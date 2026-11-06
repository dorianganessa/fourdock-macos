import { SERVICES, serviceForURL, unreadFromTitle, safeExternal, normalizePrefs } from './core.js';

let bridge;
let queue = Promise.resolve();
let prefs = normalizePrefs();
let mapping = {};
let workspaceId;
const unread = {};
const errors = {};
const serialize = task => {
  const result = queue.then(task);
  queue = result.catch(() => {});
  return result;
};

function native(message) {
  try { bridge?.postMessage(message); } catch { /* No native host in browser fixture tests. */ }
}

function connect() {
  if (bridge) return;
  bridge = chrome.runtime.connectNative('com.fourdock.bridge');
  bridge.onMessage.addListener(message => {
    if (message.type === 'select' && SERVICES.some(s => s.id === message.service)) {
      serialize(() => select(message.service));
    } else if (message.type === 'hide') {
      if (workspaceId) chrome.windows.update(workspaceId, { state: 'minimized' }).catch(() => {});
    } else if (message.type === 'show') serialize(ensureWorkspace);
    else if (message.type === 'quit') chrome.windows.getAll().then(windows => Promise.all(windows.map(w => chrome.windows.remove(w.id))));
  });
  bridge.onDisconnect.addListener(() => {
    void chrome.runtime.lastError;
    bridge = undefined;
  });
  native({ type: 'hello' });
}

async function restore() {
  const stored = await chrome.storage.local.get(['mapping', 'workspaceId', 'prefs']);
  prefs = normalizePrefs(stored.prefs);
  mapping = stored.mapping || {};
  workspaceId = stored.workspaceId;
  const live = await chrome.tabs.query({});
  for (const [id, tabId] of Object.entries(mapping)) {
    if (!live.some(t => t.id === tabId)) delete mapping[id];
  }
  if (!live.some(t => t.windowId === workspaceId)) workspaceId = undefined;
  connect();
}
const ready = restore();

async function ensureWorkspace() {
  if (workspaceId) {
    try {
      const window = await chrome.windows.get(workspaceId);
      await chrome.windows.update(window.id, { focused: true, ...(window.state === 'minimized' ? { state: 'normal' } : {}) });
    } catch { workspaceId = undefined; }
  }
  if (!workspaceId) {
    // Chrome popup/app windows contain one tab; a normal window is required to
    // keep all four top-level service documents alive without unsupported APIs.
    const window = await chrome.windows.create({ type: 'normal', url: SERVICES.map(s => s.url), width: 1180, height: 820, focused: true });
    workspaceId = window.id;
    SERVICES.forEach((s, i) => { mapping[s.id] = window.tabs[i].id; });
    await chrome.storage.local.set({ mapping, workspaceId });
    for (const tab of window.tabs) {
      await chrome.tabs.update(tab.id, { autoDiscardable: false });
      // A newly-created tab may still have an empty URL. Apply zoom on completion
      // when the permitted service origin exists, without failing workspace setup.
      await chrome.tabs.setZoom(tab.id, prefs.zoom).catch(() => {});
    }
  }
  return mapping;
}

async function select(id) {
  await ensureWorkspace();
  let tab;
  try { tab = await chrome.tabs.get(mapping[id]); } catch { /* Recreate only missing service. */ }
  if (!tab) {
    tab = await chrome.tabs.create({ windowId: workspaceId, url: SERVICES.find(s => s.id === id).url });
    mapping[id] = tab.id;
    await chrome.tabs.update(tab.id, { autoDiscardable: false });
    await chrome.tabs.setZoom(tab.id, prefs.zoom);
    await chrome.storage.local.set({ mapping });
  }
  await chrome.tabs.update(tab.id, { active: true });
  native({ type: 'selected', service: id });
  return { ok: true };
}

async function broadcast() {
  const badges = prefs.badges ? unread : {};
  const total = Object.values(badges).reduce((a, b) => a + b, 0);
  await chrome.action.setBadgeText({ text: total ? String(Math.min(total, 9999)) : '' });
  native({ type: 'badge', count: total });
  await Promise.all(Object.values(mapping).map(id => chrome.tabs.sendMessage(id, { type: 'state', badges, prefs }).catch(() => {})));
}

chrome.tabs.onUpdated.addListener((tabId, change, tab) => {
  const service = Object.keys(mapping).find(id => mapping[id] === tabId);
  if (!service) return;
  if (change.title && serviceForURL(tab.url)?.id === service) {
    unread[service] = unreadFromTitle(change.title, service);
    broadcast();
  }
  if (change.status === 'complete') {
    delete errors[service];
    chrome.tabs.setZoom(tabId, prefs.zoom).catch(() => {});
    broadcast();
  }
});
chrome.tabs.onRemoved.addListener(tabId => {
  for (const id of Object.keys(mapping)) if (mapping[id] === tabId) {
    delete mapping[id]; delete unread[id];
  }
  chrome.storage.local.set({ mapping });
  broadcast();
});
chrome.windows.onRemoved.addListener(id => {
  if (id === workspaceId) { workspaceId = undefined; chrome.storage.local.remove('workspaceId'); }
});

chrome.runtime.onMessage.addListener((message, sender, respond) => {
  // A page content script can control its own mapped service only. Extension pages
  // are trusted UI; external web pages have no runtime messaging permission.
  const fromUI = sender.url?.startsWith(chrome.runtime.getURL('')) === true;
  const service = Object.keys(mapping).find(id => mapping[id] === sender.tab?.id);
  const handle = async () => {
    await ready;
    if (!fromUI && !service) throw new Error('Unmanaged tab');
    switch (message.type) {
      case 'launch': if (!fromUI) break; return ensureWorkspace();
      case 'select': if (SERVICES.some(s => s.id === message.service)) return select(message.service); break;
      case 'state': return { prefs, badges: prefs.badges ? unread : {}, service, connected: !!bridge };
      case 'reload': if (service) { await chrome.tabs.reload(sender.tab.id); return { ok: true }; } break;
      case 'hide': if (workspaceId) await chrome.windows.update(workspaceId, { state: 'minimized' }); return { ok: true };
      case 'options': await chrome.runtime.openOptionsPage(); return { ok: true };
      case 'prefs':
        if (!fromUI) break;
        prefs = normalizePrefs(message.prefs);
        await chrome.storage.local.set({ prefs });
        await Promise.all(Object.values(mapping).map(id => chrome.tabs.setZoom(id, prefs.zoom).catch(() => {})));
        await broadcast(); return prefs;
      case 'external':
        if (service && safeExternal(message.url) && prefs.externalLinks && bridge) {
          native({ type: 'external', url: message.url }); return { handled: true };
        }
        return { handled: false };
      case 'diagnostics':
        return { version: chrome.runtime.getManifest().version, connected: !!bridge, services: SERVICES.map(s => ({ id: s.id, open: !!mapping[s.id], unread: unread[s.id] || 0 })), preferences: prefs };
    }
    throw new Error('Unsupported request');
  };
  serialize(handle).then(respond, error => {
    // Deliberately classify known API failures instead of returning raw exception
    // strings, which can include page URLs. No remote content is logged.
    const text = String(error?.message || '');
    const code = /Unmanaged tab/.test(text) ? 'unmanaged-tab'
      : /Unsupported request/.test(text) ? 'unsupported-request'
      : /No tab|Invalid tab/.test(text) ? 'missing-tab'
      : /No window|Invalid window/.test(text) ? 'missing-window'
      : /Cannot access/.test(text) ? 'origin-not-ready'
      : /dragging|cannot be edited/i.test(text) ? 'browser-busy' : 'browser-api';
    respond({ error: 'Action unavailable; open Fourdock from the Dock and retry.', code });
  });
  return true;
});

chrome.commands.onCommand.addListener(command => {
  const i = Number(command.replace('service-', '')) - 1;
  if (SERVICES[i]) ready.then(() => serialize(() => select(SERVICES[i].id)));
});
chrome.action.onClicked.addListener(() => ready.then(() => serialize(ensureWorkspace)));
chrome.runtime.onInstalled.addListener(() => ready.then(() => chrome.runtime.openOptionsPage()));
chrome.alarms.create('bridge', { periodInMinutes: 1 });
chrome.alarms.onAlarm.addListener(alarm => { if (alarm.name === 'bridge' && !bridge) connect(); });
