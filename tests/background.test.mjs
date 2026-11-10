import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SERVICES } from '../extension/core.js';

const event = () => { const listeners = []; return { addListener: fn => listeners.push(fn), listeners }; };

test('global service commands restore the existing workspace without reloads; notification transport rejects foreign documents', async () => {
  const mapping = Object.fromEntries(SERVICES.map((s, i) => [s.id, i + 10]));
  const tabs = SERVICES.map(s => ({ id: mapping[s.id], windowId: 7, url: s.url, title: '(3) Synthetic fixture' }));
  const local = { mapping, workspaceId: 7 };
  const session = {};
  const updates = [];
  const windows = [];
  const notices = [];
  const storedArea = data => ({ get: async keys => Object.fromEntries((Array.isArray(keys) ? keys : [keys]).map(k => [k, data[k]])),
    set: async value => Object.assign(data, structuredClone(value)), remove: async key => { delete data[key]; } });
  const previous = globalThis.chrome;
  const api = {
    runtime: { connectNative: () => ({ postMessage() {}, onMessage: event(), onDisconnect: event() }),
      getURL: path => `chrome-extension://fixture/${path}`, onMessage: event(), onInstalled: event() },
    storage: { local: storedArea(local), session: storedArea(session) },
    tabs: { query: async () => tabs, get: async id => tabs.find(t => t.id === id),
      update: async (id, value) => { updates.push({ id, ...value }); return tabs.find(t => t.id === id); },
      sendMessage: async () => {}, onUpdated: event(), onRemoved: event() },
    windows: { get: async () => ({ id: 7, state: 'minimized' }),
      update: async (id, value) => windows.push({ id, ...value }), onRemoved: event() },
    commands: { onCommand: event() }, action: { onClicked: event(), setBadgeText: async () => {} },
    alarms: { create() {}, onAlarm: event() },
    notifications: { onClicked: event(), onClosed: event(), create: async (...args) => notices.push(args) },
  };
  globalThis.chrome = api;
  try {
    await import(`../extension/background.js?fixture=${Date.now()}`);
    const request = (message, sender) => new Promise(resolve => api.runtime.onMessage.listeners[0](message, sender, resolve));
    await request({ type: 'state' }, { url: 'chrome-extension://fixture/options.html' });
    for (const service of SERVICES) {
      await api.commands.onCommand.listeners[0](`focus-${service.id}`);
      assert.deepEqual(updates.at(-1), { id: mapping[service.id], active: true });
      assert.deepEqual(windows.at(-1), { id: 7, focused: true, state: 'normal' });
    }
    assert.equal(updates.length, 4, 'existing service documents are selected without navigation');
    const message = { type: 'notification-create', id: '11111111-1111-4111-8111-111111111111', title: 'Synthetic sender', body: 'Synthetic preview' };
    for (const sender of [
      { tab: { id: 999 }, frameId: 0, url: SERVICES[0].url },
      { tab: { id: 10 }, frameId: 0, url: 'https://evil.invalid/' },
      { tab: { id: 10 }, frameId: 1, url: SERVICES[0].url },
    ]) assert((await request(message, sender)).error);
    assert.equal(notices.length, 0);
    assert((await request(message, { tab: { id: 10 }, frameId: 0, documentId: 'fixture', url: SERVICES[0].url })).ok);
    assert.equal(notices[0][1].title, 'Fourdock · WhatsApp — Synthetic sender');
    await request({ type: 'prefs', prefs: { notifications: { whatsapp: false } } }, { url: 'chrome-extension://fixture/options.html' });
    const denied = await request(message, { tab: { id: 10 }, frameId: 0, documentId: 'fixture', url: SERVICES[0].url });
    assert.equal(denied.code, 'notification-disabled');
    assert.equal(notices.length, 1);
  } finally { globalThis.chrome = previous; }
});
