import { test } from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';
import { webcrypto } from 'node:crypto';
import { notificationRelay } from '../extension/notifications.js';

const pageScript = await readFile(new URL('../extension/notification-page.js', import.meta.url), 'utf8');
const contentScript = await readFile(new URL('../extension/notification-content.js', import.meta.url), 'utf8');
const tick = () => new Promise(resolve => setTimeout(resolve, 10));

function browser() {
  const session = {};
  const shown = new Map();
  const delivered = [];
  const focused = [];
  const api = {
    storage: { session: {
      get: async key => ({ [key]: session[key] }),
      set: async value => Object.assign(session, structuredClone(value)),
    } },
    runtime: { getURL: path => `chrome-extension://synthetic/${path}` },
    tabs: { sendMessage: async (...args) => { delivered.push(args); } },
    notifications: {
      create: async (id, options) => { shown.set(id, options); },
      clear: async id => shown.delete(id),
    },
  };
  return { api, session, shown, delivered, focused,
    relay: notificationRelay(api, async service => { focused.push(service); }) };
}

test('preview relay uses service identity, saves metadata only, and survives worker replacement for clicks', async () => {
  const b = browser();
  const id = webcrypto.randomUUID();
  const sender = { tab: { id: 42 }, documentId: 'synthetic-document' };
  assert.deepEqual(await b.relay.create('whatsapp', sender, { id, title: 'Synthetic sender', body: 'Synthetic private preview' }), { ok: true });
  const [notificationID, notice] = [...b.shown][0];
  assert.equal(notice.title, 'Fourdock · WhatsApp — Synthetic sender');
  assert.equal(notice.message, 'Synthetic private preview');
  assert(notice.iconUrl.endsWith('/icons/whatsapp.png'));
  const saved = JSON.stringify(b.session);
  assert(!saved.includes('Synthetic sender'));
  assert(!saved.includes('Synthetic private preview'));
  assert(!saved.includes('https://'));
  const restarted = notificationRelay(b.api, async service => b.focused.push(service));
  await restarted.event(notificationID, 'click');
  assert.deepEqual(b.focused, ['whatsapp']);
  assert.deepEqual(b.delivered[0], [42, { type: 'notification-event', id, event: 'click' }, { documentId: 'synthetic-document' }]);
  await restarted.close('whatsapp', { tab: { id: 43 }, documentId: sender.documentId }, id);
  assert.equal(b.shown.size, 1, 'another document must not close this notification');
  await restarted.close('whatsapp', sender, id);
  assert.equal(b.shown.size, 0);
  assert.equal(Object.keys(b.session.notificationRoutes).length, 0);
  assert.equal(b.delivered.at(-1)[1].event, 'close');
});

test('rejected notifications leave no route or preview behind', async () => {
  const b = browser();
  b.api.notifications.create = async () => { throw new Error('synthetic permission denial'); };
  const result = await b.relay.create('gmail', { tab: { id: 1 }, documentId: 'fixture' },
    { id: webcrypto.randomUUID(), title: 'Synthetic sender', body: 'Synthetic secret' });
  assert.equal(result.code, 'notification-unavailable');
  assert.deepEqual(b.session.notificationRoutes, {});
  await assert.rejects(b.relay.create('gmail', {}, { id: 'not-an-id' }));
});

async function pageFixture({ order = 'main-first', enabled = true, denyExtension = false } = {}) {
  const b = browser();
  const window = new EventTarget();
  window.top = window;
  const origin = 'https://web.whatsapp.com';
  const native = [];
  const contentListeners = [];
  const sender = { tab: { id: 42 }, documentId: 'synthetic-document' };
  class NativeNotification extends EventTarget {
    static permission = 'granted';
    static async requestPermission() { return this.permission; }
    constructor(title, options) { super(); this.title = title; this.body = options?.body; native.push(this); }
    close() { this.dispatchEvent(new Event('close')); }
  }
  window.Notification = NativeNotification;
  window.postMessage = data => queueMicrotask(() => {
    const event = new Event('message');
    Object.defineProperties(event, { source: { value: window }, origin: { value: origin }, data: { value: data } });
    window.dispatchEvent(event);
  });
  b.api.tabs.sendMessage = async (tabId, message, options) => {
    b.delivered.push([tabId, message, options]);
    for (const listener of contentListeners) listener(message);
  };
  const runtime = {
    onMessage: { addListener: listener => contentListeners.push(listener) },
    sendMessage: async message => {
      if (message.type === 'state') return { service: 'whatsapp', prefs: { notifications: { whatsapp: enabled } } };
      if (message.type === 'notification-create') {
        if (denyExtension) throw new Error('synthetic disconnected extension');
        return b.relay.create('whatsapp', sender, message);
      }
      if (message.type === 'notification-close') return b.relay.close('whatsapp', sender, message.id);
    },
  };
  const context = vm.createContext({ window, location: { origin }, EventTarget, Event, crypto: webcrypto,
    setTimeout, clearTimeout, chrome: { runtime } });
  const scripts = order === 'main-first' ? [pageScript, contentScript] : [contentScript, pageScript];
  for (const script of scripts) vm.runInContext(script, context);
  await tick();
  return { ...b, window, native, context, contentListeners };
}

for (const order of ['main-first', 'isolated-first']) {
  test(`page-to-extension relay preserves sender, preview and site click handler (${order})`, async () => {
    const p = await pageFixture({ order });
    vm.runInContext(`window.clickCount = 0; window.showCount = 0;
      window.notice = new window.Notification('Synthetic sender', { body: 'Synthetic preview', data: { local: true } });
      window.notice.onclick = () => window.clickCount++;
      window.notice.addEventListener('show', () => window.showCount++);`, p.context);
    await tick();
    assert.equal(p.native.length, 0, 'do not duplicate the site notification');
    assert.equal(p.shown.size, 1);
    assert.equal(p.window.showCount, 1);
    assert(p.window.notice instanceof p.window.Notification);
    assert.equal(p.window.notice.data.local, true);
    const id = [...p.shown.keys()][0];
    await p.relay.event(id, 'click'); await tick();
    assert.equal(p.window.clickCount, 1);
    assert.deepEqual(p.focused, ['whatsapp']);
    p.window.notice.close(); await tick();
    assert.equal(p.shown.size, 0);
    assert.equal(Object.keys(p.session.notificationRoutes).length, 0);
  });
}

test('disabled relay uses native notifications and disconnected extension falls back without swallowing previews', async () => {
  for (const options of [{ enabled: false }, { denyExtension: true }]) {
    const p = await pageFixture(options);
    const notice = new p.window.Notification('Synthetic sender', { body: 'Synthetic preview' });
    let clicked = false; notice.onclick = () => { clicked = true; };
    await tick();
    assert.equal(p.shown.size, 0);
    assert.equal(p.native.length, 1);
    assert.equal(p.native[0].body, 'Synthetic preview');
    if (options.denyExtension) {
      p.native[0].dispatchEvent(new Event('click'));
      assert.equal(clicked, true);
    }
    notice.close(); await tick();
  }
});

test('tag replacement closes the previous relay and website permissions stay authoritative', async () => {
  const p = await pageFixture();
  const old = new p.window.Notification('First fixture', { tag: 'same-fixture' });
  let closed = 0; old.onclose = () => closed++;
  await tick();
  const next = new p.window.Notification('Second fixture', { tag: 'same-fixture' });
  await tick();
  assert.equal(closed, 1);
  assert.equal(p.shown.size, 1);
  assert.equal([...p.shown.values()][0].title, 'Fourdock · WhatsApp — Second fixture');
  next.close(); await tick();
  assert.equal(await p.window.Notification.requestPermission(), 'granted');
  p.window.Notification.permission = 'denied';
  new p.window.Notification('Native permission handling');
  assert.equal(p.native.length, 1);
});
