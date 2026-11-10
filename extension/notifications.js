import { SERVICES } from './core.js';

// Store routing metadata only, in browser-session storage. Sender names and
// previews are passed straight to Chrome's notification UI, never saved/logged.
export function notificationRelay(api, focus) {
  const key = 'notificationRoutes';
  const routeID = (service, id) => `fourdock:${service}:${id}`;
  const validID = id => typeof id === 'string' && /^[a-f0-9-]{36}$/.test(id);
  const routes = async () => (await api.storage.session.get(key))[key] || {};
  async function create(service, sender, message, test = false) {
    if (!validID(message.id)) throw new Error('Unsupported request');
    const info = SERVICES.find(s => s.id === service);
    if (!info) throw new Error('Unsupported request');
    const id = routeID(service, message.id);
    const stored = await routes();
    stored[id] = { service, id: message.id, tabId: sender.tab?.id,
      documentId: sender.documentId, at: Date.now(), test };
    for (const [old, value] of Object.entries(stored)) {
      if (Date.now() - value.at > 86400000) delete stored[old];
    }
    for (const old of Object.keys(stored).slice(0, Math.max(0, Object.keys(stored).length - 256))) delete stored[old];
    await api.storage.session.set({ [key]: stored });
    try {
      const title = typeof message.title === 'string' ? message.title.slice(0, 512) : '';
      const body = typeof message.body === 'string' ? message.body.slice(0, 2048) : '';
      await api.notifications.create(id, {
        type: 'basic', iconUrl: api.runtime.getURL(`icons/${service}.png`),
        title: `Fourdock · ${info.name}${title ? ` — ${title}` : ''}`,
        message: body, silent: message.silent === true,
        requireInteraction: message.requireInteraction === true,
      });
      return { ok: true };
    } catch {
      delete stored[id];
      await api.storage.session.set({ [key]: stored });
      return { error: 'Notifications unavailable', code: 'notification-unavailable' };
    }
  }
  async function event(id, kind) {
    const stored = await routes();
    const route = stored[id];
    if (!route) return;
    if (kind === 'click') await focus(route.service);
    if (!route.test && route.tabId && route.documentId) {
      await api.tabs.sendMessage(route.tabId, { type: 'notification-event', id: route.id, event: kind },
        { documentId: route.documentId }).catch(() => {});
    }
    if (kind === 'close') { delete stored[id]; await api.storage.session.set({ [key]: stored }); }
  }
  async function close(service, sender, id) {
    if (!validID(id)) return;
    const stored = await routes();
    const notificationId = routeID(service, id);
    const route = stored[notificationId];
    if (route?.tabId === sender.tab?.id && route?.documentId === sender.documentId) {
      await api.notifications.clear(notificationId);
      await event(notificationId, 'close');
    }
  }
  return { create, event, close };
}
