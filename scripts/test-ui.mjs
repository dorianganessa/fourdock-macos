import { chromium } from 'playwright';
import { readFile, mkdtemp, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import assert from 'node:assert/strict';

const extension = path.resolve('extension');
const executablePath = process.env.FOURDOCK_TEST_BROWSER;
const profile = await mkdtemp(path.join(os.tmpdir(), 'fourdock-ui-'));
const options = { headless: false, ...(executablePath ? { executablePath } : {}), args: [`--disable-extensions-except=${extension}`, `--load-extension=${extension}`, '--host-resolver-rules=MAP * ~NOTFOUND'], ignoreDefaultArgs: ['--disable-extensions'], acceptDownloads: true };
const html = await readFile('fixtures/service.html', 'utf8');
const results = [];
let context;
try {
  context = await chromium.launchPersistentContext(profile, options);
  await context.route('https://**/*', route => route.fulfill({ contentType: 'text/html', body: route.request().url().includes('auth-fixture') ? '<title>Synthetic authentication</title><button onclick="window.close()">Complete fixture</button>' : html }));
  const worker = context.serviceWorkers()[0] || await context.waitForEvent('serviceworker');
  const extensionId = worker.url().split('/')[2];
  const control = await context.newPage();
  await control.goto(`chrome-extension://${extensionId}/options.html`);
  const send = message => control.evaluate(m => chrome.runtime.sendMessage(m), message);
  // Model the already-authenticated runtime probe with a synthetic live document.
  // Workspace creation must adopt this exact tab and preserve its unsent draft.
  const probe = await context.newPage(); await probe.goto('https://web.whatsapp.com/');
  await probe.locator('#draft').fill('synthetic probe draft');
  const probeIdentity = await probe.evaluate(() => window.loadIdentity);
  const launch = await send({ type: 'launch' });
  assert(!launch?.error, JSON.stringify(launch));
  const stored = await control.evaluate(() => chrome.storage.local.get(['mapping', 'workspaceId']));
  assert.equal(Object.keys(stored.mapping).length, 4);
  assert.equal(await probe.evaluate(() => window.loadIdentity), probeIdentity);
  assert.equal(await probe.locator('#draft').inputValue(), 'synthetic probe draft');
  assert.equal(context.pages().filter(p => p.url().startsWith('https://web.whatsapp.com/')).length, 1);
  results.push({ test: 'adopt existing authenticated-probe fixture tab without reload, duplicate or draft loss', status: 'PASS AUTOMATICO' });
  const urls = ['https://web.whatsapp.com/', 'https://web.telegram.org/k/', 'https://app.fastmail.com/', 'https://mail.google.com/'];
  for (let attempt = 0; attempt < 100 && context.pages().length < 6; attempt++) await new Promise(resolve => setTimeout(resolve, 100));
  // First navigations from the browser extension can precede automation target
  // attachment. DNS confinement blocks those; now navigate the attached tabs.
  await control.evaluate(async ({ mapping, urls }) => {
    for (const [i, id] of ['whatsapp','telegram','fastmail','gmail'].entries()) await chrome.tabs.update(mapping[id], { url: urls[i] });
  }, { mapping: stored.mapping, urls });
  // Browser window creation can finish before Playwright sees tab navigation.
  for (let attempt = 0; attempt < 100; attempt++) {
    if (urls.every(url => context.pages().some(p => p.url().startsWith(new URL(url).origin)))) break;
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  const pages = [];
  for (const url of urls) {
    let page = context.pages().find(p => p.url().startsWith(new URL(url).origin));
    assert(page, `Missing service ${url}`);
    await page.goto(url);
    await page.locator('#draft').fill(`synthetic draft ${url}`);
    await page.locator('#fourdock-sidebar').waitFor({ state: 'attached' });
    pages.push(page);
  }
  const layout = await pages[0].evaluate(() => {
    const rail = document.querySelector('#fourdock-sidebar').getBoundingClientRect();
    const app = document.querySelector('#app').getBoundingClientRect();
    return { railRight: rail.right, appLeft: app.left, appRight: app.right, viewport: innerWidth };
  });
  assert(layout.appLeft >= layout.railRight && layout.appRight <= layout.viewport + 1);
  results.push({ test: 'WhatsApp absolute application root stays beside sidebar without clipping or overlap', status: 'PASS AUTOMATICO' });
  const ids = await Promise.all(pages.map(p => p.evaluate(() => window.loadIdentity)));
  const latencies = [];
  const names = ['whatsapp','telegram','fastmail','gmail'];
  for (let i = 0; i < 50; i++) {
    const start = performance.now();
    await send({ type: 'select', service: names[i % 4] });
    latencies.push(performance.now() - start);
  }
  for (let i = 0; i < 4; i++) {
    assert.equal(await pages[i].evaluate(() => window.loadIdentity), ids[i]);
    assert.equal(await pages[i].locator('#draft').inputValue(), `synthetic draft ${urls[i]}`);
  }
  results.push({ test: 'T05 synthetic 50 switches and draft preservation', status: 'PASS AUTOMATICO', medianMs: latencies.toSorted((a,b) => a-b)[25], p95Ms: latencies.toSorted((a,b) => a-b)[47] });
  await pages[0].bringToFront();
  // Use the browser accessibility tree rather than exposing the private rail's
  // shadow DOM merely for the convenience of a CSS test selector.
  const accessibility = await context.newCDPSession(pages[0]);
  await accessibility.send('Accessibility.enable');
  const tree = await accessibility.send('Accessibility.getFullAXTree');
  const gmailButton = tree.nodes.find(n => n.role?.value === 'button' && n.name?.value?.startsWith('Gmail'));
  assert(gmailButton?.backendDOMNodeId, 'Gmail service button must be accessible');
  const { model } = await accessibility.send('DOM.getBoxModel', { backendNodeId: gmailButton.backendDOMNodeId });
  const q = model.content;
  await pages[0].mouse.click((q[0] + q[2]) / 2, (q[1] + q[5]) / 2);
  await accessibility.detach();
  const active = await control.evaluate(() => chrome.tabs.query({ active: true }));
  assert(active.some(t => t.id === stored.mapping.gmail));
  results.push({ test: 'T05 sidebar selects mapped service', status: 'PASS AUTOMATICO' });
  await pages[0].bringToFront();
  await pages[0].keyboard.press('Meta+3');
  for (let attempt = 0; attempt < 40; attempt++) {
    if ((await control.evaluate(() => chrome.tabs.query({ active: true }))).some(t => t.id === stored.mapping.fastmail)) break;
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  assert((await control.evaluate(() => chrome.tabs.query({ active: true }))).some(t => t.id === stored.mapping.fastmail));
  results.push({ test: 'T05 native Cmd+3 switches to existing Fastmail tab', status: 'PASS AUTOMATICO' });
  await send({ type: 'hide' });
  for (let attempt = 0; attempt < 40; attempt++) {
    if ((await control.evaluate(id => chrome.windows.get(id), stored.workspaceId)).state === 'minimized') break;
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  assert.equal((await control.evaluate(id => chrome.windows.get(id), stored.workspaceId)).state, 'minimized');
  await send({ type: 'launch' });
  for (let attempt = 0; attempt < 40; attempt++) {
    if ((await control.evaluate(id => chrome.windows.get(id), stored.workspaceId)).state !== 'minimized') break;
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  assert.notEqual((await control.evaluate(id => chrome.windows.get(id), stored.workspaceId)).state, 'minimized');
  assert.equal(await pages[0].evaluate(() => window.loadIdentity), ids[0]);
  results.push({ test: 'T09 minimize/show retains loaded service', status: 'PASS AUTOMATICO' });
  await send({ type: 'prefs', prefs: { theme: 'dark', zoom: 1.25, badges: false } });
  assert.equal((await send({ type: 'state' })).prefs.theme, 'dark');
  assert.equal(await control.evaluate(id => chrome.tabs.getZoom(id), stored.mapping.gmail), 1.25);
  const diagnostic = await send({ type: 'diagnostics' });
  assert.equal(diagnostic.services.length, 4);
  assert(!JSON.stringify(diagnostic).includes('synthetic draft'));
  results.push({ test: 'preferences, per-tab zoom and content-free diagnostics', status: 'PASS AUTOMATICO' });
  const page = pages[0];
  await context.setOffline(true);
  assert.equal(await page.evaluate(() => navigator.onLine), false);
  assert.equal(await page.locator('#draft').inputValue(), `synthetic draft ${urls[0]}`);
  await context.setOffline(false);
  assert.equal(await page.evaluate(() => navigator.onLine), true);
  results.push({ test: 'T10 synthetic offline/online preserves draft', status: 'PASS AUTOMATICO' });
  await page.locator('#upload').setInputFiles({ name: 'synthetic.txt', mimeType: 'text/plain', buffer: Buffer.from('Synthetic only') });
  assert.equal(await page.locator('#selected').textContent(), 'synthetic.txt');
  const downloadEvent = page.waitForEvent('download');
  await page.getByText('Download fixture').click();
  const download = await downloadEvent; assert.equal(download.suggestedFilename(), 'fourdock-synthetic.txt');
  results.push({ test: 'T07 synthetic file selection and browser download', status: 'PASS AUTOMATICO' });
  const popupEvent = context.waitForEvent('page');
  await page.locator('#popup').click(); const popup = await popupEvent;
  const closed = popup.waitForEvent('close');
  await popup.getByText('Complete fixture').click(); await closed;
  assert.equal(await page.evaluate(() => window.loadIdentity), ids[0]);
  results.push({ test: 'T08 popup opener retained and popup closes', status: 'PASS AUTOMATICO' });
  const externalEvent = context.waitForEvent('page');
  await page.getByText('External link', { exact: true }).click();
  const external = await externalEvent; await external.waitForURL('https://example.org/ordinary');
  await external.close();
  results.push({ test: 'T08 external link fallback opens a separate browser tab without native bridge', status: 'PASS AUTOMATICO' });
  await page.reload();
  assert.equal(await page.evaluate(() => localStorage.getItem('fixture-session')), 'synthetic-only');
  assert.equal(await pages[1].evaluate(() => window.loadIdentity), ids[1]);
  results.push({ test: 'T10 isolated service reload; origin storage survives', status: 'PASS AUTOMATICO' });
  await page.screenshot({ path: 'dist/synthetic-workspace.png' });
  await context.close(); context = undefined;
  context = await chromium.launchPersistentContext(profile, options);
  await context.route('https://**/*', route => route.fulfill({ contentType: 'text/html', body: html }));
  const restartedControl = await context.newPage(); await restartedControl.goto(`chrome-extension://${extensionId}/options.html`);
  const restored = await restartedControl.evaluate(() => chrome.runtime.sendMessage({ type: 'state' }));
  assert.equal(restored.prefs.theme, 'dark');
  const storagePage = await context.newPage(); await storagePage.goto(urls[0]);
  assert.equal(await storagePage.evaluate(() => localStorage.getItem('fixture-session')), 'synthetic-only');
  results.push({ test: 'preferences and origin storage survive full browser restart', status: 'PASS AUTOMATICO' });
} finally {
  if (context) await context.close();
  await mkdir('dist', { recursive: true });
  await writeFile('dist/ui-results.json', JSON.stringify({ date: new Date().toISOString(), environment: `${os.platform()} ${os.arch()}`, fixture: true, results }, null, 2));
}
console.log(JSON.stringify(results, null, 2));
