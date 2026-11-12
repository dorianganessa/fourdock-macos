import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

test('Fourdock Ferdium recipe exposes only the existing loopback client', () => {
  const root = new URL('../integrations/ferdium/fourdock-whatsapp/', import.meta.url);
  const config = JSON.parse(fs.readFileSync(new URL('package.json', root)));
  assert.equal(config.config.serviceURL, 'http://127.0.0.1:4702/');
  const calls = [];
  let tick;
  const sandbox = { module: { exports: {} }, window: { location: { origin: 'http://127.0.0.1:4702' } },
    document: { title: '(7) Fourdock WhatsApp' } };
  vm.runInNewContext(fs.readFileSync(new URL('webview.js', root), 'utf8'), sandbox);
  sandbox.module.exports({ loop: fn => { tick = fn; }, setBadge: (...args) => calls.push(args) });
  assert.deepEqual(calls.at(-1), [7, 0]);
  sandbox.document.title = 'Fourdock WhatsApp'; tick();
  assert.deepEqual(calls.at(-1), [0, 0]);
  sandbox.document.title = '(4) Other site'; tick();
  assert.deepEqual(calls.at(-1), [0, 0]);
  sandbox.document.title = '(4) Fourdock WhatsApp';
  sandbox.window.location.origin = 'https://example.invalid'; tick();
  assert.deepEqual(calls.at(-1), [0, 0]);
});
