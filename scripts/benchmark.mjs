import { chromium } from 'playwright';
import { spawnSync } from 'node:child_process';
import { mkdtemp, readFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { setTimeout as delay } from 'node:timers/promises';

const extension = path.resolve('extension');
const html = await readFile('fixtures/service.html', 'utf8');
const extensionId = JSON.parse(await readFile('extension/id.json', 'utf8')).id;
const executablePath = process.env.FOURDOCK_TEST_BROWSER;
const report = { date: new Date().toISOString(), platform: `${os.platform()} ${os.release()} ${os.arch()}`, fixture: true, nativeLauncherIncluded: false, starts: [], switchRequestMs: [], idle: [] };
const options = { headless: false, ...(executablePath ? { executablePath } : {}), args: [`--disable-extensions-except=${extension}`, `--load-extension=${extension}`, '--host-resolver-rules=MAP * ~NOTFOUND'], ignoreDefaultArgs: ['--disable-extensions'] };
let context;
let control;
const cpuSeconds = text => text.split(':').reduce((sum, component) => sum * 60 + Number(component), 0);
function sample() {
  const snapshot = spawnSync('ps', ['-axo', 'pid=,ppid=,rss=,pcpu=,time='], { encoding: 'utf8' });
  if (snapshot.status !== 0) throw new Error('Cannot sample process tree');
  const rows = snapshot.stdout.trim().split('\n').map(line => {
    const [pid, ppid, rss, cpu, time] = line.trim().split(/\s+/);
    return { pid: Number(pid), ppid: Number(ppid), rss: Number(rss), cpu: Number(cpu), seconds: cpuSeconds(time) };
  });
  const pids = new Set([process.pid]);
  for (let i = 0; i < 10; i++) for (const row of rows) if (pids.has(row.ppid)) pids.add(row.pid);
  // ps itself is a short-lived sampling child, not part of the runtime.
  const owned = rows.filter(r => pids.has(r.pid) && r.pid !== snapshot.pid);
  return { elapsedSeconds: 0, processes: owned.length, rssMiB: owned.reduce((sum,r) => sum+r.rss,0)/1024, lifetimeCpuPercent: owned.reduce((sum,r) => sum+r.cpu,0), cpuSeconds: owned.reduce((sum,r) => sum+r.seconds,0) };
}
try {
  for (let i = 0; i < 3; i++) {
    const profile = await mkdtemp(path.join(os.tmpdir(), 'fourdock-benchmark-'));
    const start = performance.now();
    context = await chromium.launchPersistentContext(profile, options);
    await context.route('https://**/*', route => route.fulfill({ contentType: 'text/html', body: html }));
    control = await context.newPage(); await control.goto(`chrome-extension://${extensionId}/options.html`);
    const launched = await control.evaluate(() => chrome.runtime.sendMessage({ type: 'launch' }));
    if (launched?.error) throw new Error(JSON.stringify(launched));
    const windowMs = performance.now() - start;
    for (let attempt = 0; attempt < 100 && context.pages().length < 6; attempt++) await delay(100);
    await control.evaluate(async () => {
      const { mapping } = await chrome.storage.local.get('mapping');
      const urls = ['https://web.whatsapp.com/', 'https://web.telegram.org/k/', 'https://app.fastmail.com/', 'https://mail.google.com/'];
      for (const [i, id] of ['whatsapp','telegram','fastmail','gmail'].entries()) await chrome.tabs.update(mapping[id], { url: urls[i] });
    });
    for (let attempt = 0; attempt < 100; attempt++) {
      if (context.pages().filter(p => /^https:\/\/(web\.whatsapp\.com|web\.telegram\.org|app\.fastmail\.com|mail\.google\.com)/.test(p.url())).length === 4) break;
      await delay(100);
    }
    const pages = context.pages().filter(p => /^https:\/\/(web\.whatsapp\.com|web\.telegram\.org|app\.fastmail\.com|mail\.google\.com)/.test(p.url()));
    if (pages.length !== 4) throw new Error('Expected four loaded service tabs');
    await Promise.all(pages.map(async p => { await p.reload(); await p.locator('#draft').waitFor(); }));
    report.starts.push({ run: i+1, browserWindowMs: windowMs, fourFixtureServicesMs: performance.now() - start });
    if (i < 2) { await context.close(); context = undefined; }
  }
  for (let i = 0; i < 50; i++) {
    const start = performance.now();
    await control.evaluate(service => chrome.runtime.sendMessage({ type: 'select', service }), ['whatsapp','telegram','fastmail','gmail'][i%4]);
    report.switchRequestMs.push(performance.now() - start);
  }
  console.log('Three starts and 50 switches complete. Sampling five minutes idle.');
  const start = performance.now(); let previous = sample();
  while (performance.now() - start < 300000) {
    await delay(5000);
    const current = sample(); current.elapsedSeconds = (performance.now() - start)/1000;
    const elapsed = current.elapsedSeconds - previous.elapsedSeconds;
    current.intervalCpuPercent = Math.max(0, (current.cpuSeconds - previous.cpuSeconds)/elapsed*100);
    report.idle.push(current); previous = current;
  }
  const sorted = [...report.switchRequestMs].sort((a,b)=>a-b);
  report.summary = { medianSwitchRequestMs: sorted[25], p95SwitchRequestMs: sorted[47], meanIdleCpuPercent: report.idle.reduce((s,r)=>s+r.intervalCpuPercent,0)/report.idle.length, meanIdleRssMiB: report.idle.reduce((s,r)=>s+r.rssMiB,0)/report.idle.length, lastIdleRssMiB: report.idle.at(-1).rssMiB, idleDurationSeconds: report.idle.at(-1).elapsedSeconds };
} finally {
  if (context) await context.close();
  await mkdir('dist', { recursive: true });
  await writeFile('dist/benchmark.json', JSON.stringify(report, null, 2));
}
console.log(JSON.stringify(report.summary, null, 2));
