// Preserve the site's real notification title, body and click callbacks. This
// opt-out relay touches only the page Notification constructor, never WebAuthn.
// Notifications created inside a service worker remain browser-owned.
(() => {
  if (window.top !== window || !window.Notification) return;
  const Original = window.Notification;
  const pending = new Map();
  const tags = new Map();
  let enabled = false;
  const post = message => window.postMessage({ source: 'fourdock-notification', ...message }, location.origin);
  const forget = item => {
    clearTimeout(item.timer);
    pending.delete(item.id);
    if (item.tag && tags.get(item.tag) === item.id) tags.delete(item.tag);
  };
  window.addEventListener('message', event => {
    if (event.source !== window || event.origin !== location.origin || event.data?.source !== 'fourdock-extension') return;
    const data = event.data;
    if (data.type === 'configure') { enabled = data.enabled === true; return; }
    if (data.type !== 'event') return;
    const item = pending.get(data.id);
    if (!item) return;
    clearTimeout(item.timer);
    if (data.event === 'fallback') {
      // Extension disabled, reloaded, or OS API failure: keep ordinary site
      // notifications instead of silently consuming them.
      if (item.native) return;
      post({ type: 'close', id: item.id });
      try {
        item.native = new Original(item.title, item.options);
        for (const kind of ['show', 'click', 'close', 'error']) item.native.addEventListener(kind, () => {
          item.target.dispatchEvent(new Event(kind));
          if (kind === 'close') forget(item);
        });
      } catch { item.target.dispatchEvent(new Event('error')); forget(item); }
    } else if (['show', 'click', 'close', 'error'].includes(data.event)) {
      item.target.dispatchEvent(new Event(data.event));
      if (data.event === 'close' || data.event === 'error') forget(item);
    }
  });
  let Wrapped;
  Wrapped = new Proxy(Original, {
    construct(target, args, newTarget) {
      // Keep site permission checks and unsupported subclasses with Chrome.
      if (!enabled || Original.permission !== 'granted' || newTarget !== Wrapped) return Reflect.construct(target, args, newTarget);
      const title = String(args[0] ?? '');
      const options = args[1] || {};
      const tag = String(options.tag || '');
      const previous = pending.get(tags.get(tag));
      if (tag && previous) previous.target.close();
      const instance = new EventTarget();
      Object.setPrototypeOf(instance, Original.prototype);
      const item = { id: crypto.randomUUID(), target: instance, title, options, tag };
      for (const [key, value] of Object.entries({ title, body: String(options.body || ''), tag,
        icon: options.icon || '', badge: options.badge || '', lang: options.lang || '', dir: options.dir || 'auto',
        data: options.data ?? null, silent: options.silent ?? null, requireInteraction: !!options.requireInteraction,
        renotify: !!options.renotify, timestamp: options.timestamp ?? Date.now(), vibrate: options.vibrate || [] })) {
        Object.defineProperty(instance, key, { value, enumerable: true });
      }
      for (const kind of ['show', 'click', 'close', 'error']) {
        let handler = null;
        Object.defineProperty(instance, `on${kind}`, { get: () => handler, set(value) {
          if (handler) instance.removeEventListener(kind, handler);
          handler = typeof value === 'function' ? value : null;
          if (handler) instance.addEventListener(kind, handler);
        } });
      }
      Object.defineProperty(instance, 'close', { value() {
        if (item.native) { item.native.close(); return; }
        post({ type: 'close', id: item.id });
      } });
      // Bound retained page objects; payloads never go into persistent storage.
      if (pending.size >= 256) forget(pending.values().next().value);
      pending.set(item.id, item);
      if (tag) tags.set(tag, item.id);
      item.timer = setTimeout(() => window.postMessage({ source: 'fourdock-extension', type: 'event',
        id: item.id, event: 'fallback' }, location.origin), 5000);
      post({ type: 'create', id: item.id, title, body: instance.body,
        silent: options.silent === true, requireInteraction: !!options.requireInteraction });
      return instance;
    },
  });
  window.Notification = Wrapped;
  post({ type: 'ready' });
})();
