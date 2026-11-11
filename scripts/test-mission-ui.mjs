import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdtemp, readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import assert from 'node:assert/strict';

if (process.env.CI !== 'true') throw new Error('Run the browser fixture on CI; target PWA/OS checks are owner-controlled.');
const client = path.resolve('clients/mission-control');
const temp = await mkdtemp(path.join(os.tmpdir(), 'fourdock-mission-'));
const app = spawn(process.execPath, ['apps/api/dist/index.js'], {
  cwd: client, env: { ...process.env, FOURDOCK_MODE: 'demo', FOURDOCK_DATA_DIR: path.join(temp, 'data'), PORT: '4702' }, stdio: 'ignore',
});
let context;
const results = [];
try {
  let available = false;
  for (let i = 0; i < 100; i++) {
    try { available = (await fetch('http://127.0.0.1:4702/api/pairing')).ok; } catch {}
    if (available) break;
    if (app.exitCode !== null) throw new Error('Synthetic API stopped');
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  assert(available);
  const extension = path.join(client, 'connector');
  context = await chromium.launchPersistentContext(path.join(temp, 'browser'), {
    headless: false, args: [`--disable-extensions-except=${extension}`, `--load-extension=${extension}`,
      '--host-resolver-rules=MAP web.whatsapp.com ~NOTFOUND'], ignoreDefaultArgs: ['--disable-extensions'],
  });
  const worker = context.serviceWorkers()[0] || await context.waitForEvent('serviceworker');
  await worker.evaluate(() => {
    globalThis.syntheticInjectionErrors = [];
    // Extension-created first navigations can precede Playwright attachment.
    // Keep DNS confinement, create a blank target, then navigate the attached
    // page below so its HTTPS document is served exclusively by our fixture.
    const createTab = chrome.tabs.create.bind(chrome.tabs);
    chrome.tabs.create = options => {
      if (options.url !== 'https://web.whatsapp.com/') throw new Error('Unexpected fixture destination');
      return createTab({ ...options, url: 'about:blank' });
    };
    const inject = chrome.scripting.executeScript.bind(chrome.scripting);
    chrome.scripting.executeScript = async request => {
      try { return await inject(request); }
      catch (error) { globalThis.syntheticInjectionErrors.push(String(error.message)); throw error; }
    };
  });
  await context.route('https://web.whatsapp.com/**', route => route.fulfill({ contentType: 'text/html', body: `<!doctype html><title>Synthetic passkey origin</title><h1>Synthetic WebAuthn fixture</h1><script>
    navigator.credentials.get = async ({publicKey}) => {
      window.syntheticCalled = true;
      const challenge = btoa(String.fromCharCode(...new Uint8Array(publicKey.challenge))).replaceAll('+','-').replaceAll('/','_').replace(/=+$/,'');
      return {id:'synthetic',type:'public-key',rawId:new Uint8Array([1]).buffer,response:{
        clientDataJSON:new TextEncoder().encode(JSON.stringify({type:'webauthn.get',origin:location.origin,challenge})).buffer,
        authenticatorData:new Uint8Array([1,2]).buffer,signature:new Uint8Array([3,4]).buffer,userHandle:null}};
    };
  </script>` }));
  const page = await context.newPage();
  await page.addInitScript(() => {
    window.syntheticBadges = [];
    Object.defineProperty(navigator, 'setAppBadge', { value: async count => window.syntheticBadges.push(count) });
    Object.defineProperty(navigator, 'clearAppBadge', { value: async () => window.syntheticBadges.push(0) });
    Notification.requestPermission = async () => 'granted';
    ServiceWorkerRegistration.prototype.showNotification = async (title, options) => { window.syntheticNotice = { title, body: options.body }; };
  });
  await page.goto('http://127.0.0.1:4702');
  await page.getByText('DEMO · solo conversazioni sintetiche').waitFor();
  await page.getByText('Alice · demo', { exact: true }).first().waitFor();
  await page.getByText('Bob · demo', { exact: true }).first().click();
  await page.getByText('Puoi provare icona, badge e notifiche senza collegare un account.', { exact: true }).first().waitFor();
  results.push('Reused Mission Control renders synthetic chat list and conversation without real accounts');
  const manifest = await (await fetch('http://127.0.0.1:4702/manifest.webmanifest')).json();
  assert.equal(manifest.display, 'standalone'); assert.equal(manifest.name, 'Fourdock WhatsApp');
  for (const icon of manifest.icons) assert((await fetch(`http://127.0.0.1:4702${icon.src}`)).ok);
  await page.getByRole('button', { name: 'Prova notifica e badge' }).click();
  await page.waitForFunction(() => window.syntheticNotice?.title === 'Fourdock WhatsApp');
  assert((await page.evaluate(() => window.syntheticBadges)).includes(3));
  results.push('PWA metadata/icons, service worker and notification/badge API calls pass; OS display stubbed');
  await page.getByRole('button', { name: 'Collega WhatsApp', exact: true }).click();
  await page.getByRole('button', { name: 'Avvia simulazione' }).click();
  await page.getByRole('button', { name: 'Simula conferma passkey' }).click();
  await page.getByRole('button', { name: 'Conferma simulazione' }).click();
  await page.getByText('Collegamento completato.', { exact: true }).waitFor();
  await page.getByRole('button', { name: 'Carica conversazioni' }).click();
  results.push('Pairing UI completes synthetic challenge/assertion/explicit confirmation through real process pipes');

  const config = JSON.parse(await readFile(path.join(client, 'apps/web/public/connector.json'), 'utf8'));
  const waEvent = context.waitForEvent('page', { predicate: p => p !== page });
  const assertionResult = page.evaluate(extensionId => new Promise(resolve => {
    chrome.runtime.sendMessage(extensionId, { type: 'assert', publicKey: {
      rpId: 'whatsapp.com', challenge: btoa('Fourdock synthetic challenge only').replace(/=+$/, ''), userVerification: 'required', allowCredentials: [],
    } }, result => resolve({ ok: result?.ok === true, valid: result?.assertion?.type === 'public-key', error: !!chrome.runtime.lastError,
      ...(result?.code ? { failureStage: result.code } : {}) }));
  }), config.extensionId);
  const wa = await waEvent;
  try {
    await wa.goto('https://web.whatsapp.com/');
    await wa.waitForFunction(() => document.getElementById('fourdock-passkey'));
  } catch (error) {
    console.error('Synthetic connector outcome:', await assertionResult);
    console.error('Synthetic injection diagnostics:', await worker.evaluate(() => globalThis.syntheticInjectionErrors));
    throw error;
  }
  assert.equal(await wa.evaluate(() => window.syntheticCalled), undefined);
  await wa.getByRole('heading', { name: 'Synthetic WebAuthn fixture' }).click();
  await wa.keyboard.press('Tab'); await wa.keyboard.press('Enter');
  const outcome = await assertionResult;
  assert.deepEqual(outcome, { ok: true, valid: true, error: false });
  results.push('Loaded Chrome connector delegates to HTTPS-origin fixture after trusted click; initial tab navigation is attached by the fixture, no real WebAuthn ceremony');
  await page.bringToFront();
  await mkdir('dist', { recursive: true });
  await page.screenshot({ path: 'dist/mission-control-synthetic.png' });
  await writeFile('dist/mission-control-ui.json', JSON.stringify({ date: new Date().toISOString(), fixture: true,
    browserVersion: context.browser()?.version(), source: process.env.GITHUB_SHA,
    osDeliveryTested: false, realAuthenticationTested: false, results }, null, 2));
  console.log(JSON.stringify({ syntheticChecks: results.length, results }, null, 2));
} finally { await context?.close(); app.kill('SIGTERM'); }
