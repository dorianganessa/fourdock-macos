// Read-only observer for the real dedicated browser. No page automation, profile
// file reads, screenshots, window changes, message sends, or process termination.
import { execFileSync } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { setTimeout as delay } from 'node:timers/promises';
import path from 'node:path';
import os from 'node:os';

if (process.platform !== 'darwin') throw new Error('This observer requires macOS.');
const duration = Number(process.env.FOURDOCK_MEASURE_SECONDS || 300);
if (!Number.isInteger(duration) || duration < 10 || duration > 3600) throw new Error('Use a duration of 10–3600 seconds.');
const profile = path.join(os.homedir(), 'Library/Application Support/Fourdock-Browser-Probe');
const command = (exe, args) => execFileSync(exe, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
let candidates = [];
try { candidates = command('pgrep', ['-x', 'Google Chrome']).split(/\s+/).filter(p => /^\d+$/.test(p)); } catch { /* No browser root. */ }
const roots = candidates.filter(pid => {
  // Inspect only Chrome main-process arguments to distinguish the dedicated
  // instance. Never record or print arguments, URLs, or the user's profile path.
  try { return command('ps', ['-p', pid, '-o', 'command=']).includes(`--user-data-dir=${profile}`); }
  catch { return false; }
});
if (roots.length !== 1) throw new Error('Open the dedicated Fourdock browser and wait for startup to finish before measuring.');
const root = Number(roots[0]);
const seconds = text => text.split(':').reduce((total, part) => total * 60 + Number(part), 0);
function snapshot() {
  const rows = command('ps', ['-axo', 'pid=,ppid=,rss=,time=']).split('\n').map(line => {
    const [pid, ppid, rss, cpu] = line.trim().split(/\s+/);
    return { pid: Number(pid), ppid: Number(ppid), rss: Number(rss), cpu: seconds(cpu) };
  });
  if (!rows.some(row => row.pid === root)) throw new Error('The dedicated browser exited; measurement is incomplete.');
  const owned = new Set([root]);
  let grew = true;
  while (grew) {
    grew = false;
    for (const row of rows) if (owned.has(row.ppid) && !owned.has(row.pid)) { owned.add(row.pid); grew = true; }
  }
  return rows.filter(row => owned.has(row.pid));
}
const report = {
  date: new Date().toISOString(),
  environment: { macOS: command('sw_vers', ['-productVersion']), architecture: os.arch(), chrome: command('/usr/libexec/PlistBuddy', ['-c', 'Print CFBundleShortVersionString', '/Applications/Google Chrome.app/Contents/Info.plist']) },
  fixture: false,
  runtime: 'dedicated official Chrome and live descendants only',
  nativeLauncherIncluded: false,
  operatorDeclaredIdle: process.env.FOURDOCK_MEASURE_IDLE === '1',
  notes: ['No account contents or profile files inspected.', 'Other Chrome profiles and the observer process are excluded.', 'Summed RSS may double-count shared pages.', 'Detached/reparented helpers and CPU consumed after a child disappears between samples may be missed.', 'The idle label is an operator declaration, not inferred from low CPU.'],
  requestedSeconds: duration, completed: false, samples: [],
};
const start = performance.now();
let previous = new Map(snapshot().map(row => [row.pid, row.cpu]));
let lastElapsed = 0;
console.log(`Observing dedicated browser for ${duration}s; workload: ${report.operatorDeclaredIdle ? 'operator-declared idle' : 'uncontrolled'}.`);
try {
  while ((performance.now() - start) / 1000 < duration) {
    await delay(Math.min(5000, Math.max(1, duration * 1000 - (performance.now() - start))));
    const rows = snapshot();
    const elapsedSeconds = (performance.now() - start) / 1000;
    const cpuDeltaSeconds = rows.reduce((sum, row) => sum + Math.max(0, row.cpu - (previous.get(row.pid) ?? 0)), 0);
    report.samples.push({ elapsedSeconds, processes: rows.length, rssMiB: rows.reduce((sum, row) => sum + row.rss, 0) / 1024, cpuDeltaSeconds, intervalCpuPercent: cpuDeltaSeconds / (elapsedSeconds - lastElapsed) * 100 });
    previous = new Map(rows.map(row => [row.pid, row.cpu])); lastElapsed = elapsedSeconds;
  }
  report.completed = true;
} finally {
  if (report.samples.length) report.summary = {
    observedSeconds: lastElapsed,
    meanCpuPercent: report.samples.reduce((sum, row) => sum + row.cpuDeltaSeconds, 0) / lastElapsed * 100,
    meanRssMiB: report.samples.reduce((sum, row) => sum + row.rssMiB, 0) / report.samples.length,
    finalRssMiB: report.samples.at(-1).rssMiB,
  };
  const folder = path.join(os.homedir(), 'Library/Logs/Fourdock/Measurements');
  await mkdir(folder, { recursive: true, mode: 0o700 });
  await writeFile(path.join(folder, `${report.date.replaceAll(':', '-')}.json`), JSON.stringify(report, null, 2), { mode: 0o600 });
  console.log('Saved anonymous process metrics under ~/Library/Logs/Fourdock/Measurements, outside the source tree.');
}
console.log(JSON.stringify({ completed: report.completed, operatorDeclaredIdle: report.operatorDeclaredIdle, ...report.summary }, null, 2));
