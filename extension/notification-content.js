// Isolated-world transport. Only explicit Notification API payloads cross this
// bridge; it never reads message DOM, authentication APIs, or browser cookies.
(() => {
  if (window.top !== window) return;
  const send = async message => { try { return await chrome.runtime.sendMessage(message); } catch { return null; } };
  const post = message => window.postMessage({ source: 'fourdock-extension', ...message }, location.origin);
  const configure = state => {
    if (state?.service) post({ type: 'configure', enabled: state.prefs?.notifications?.[state.service] === true });
  };
  window.addEventListener('message', async event => {
    if (event.source !== window || event.origin !== location.origin || event.data?.source !== 'fourdock-notification') return;
    const data = event.data;
    if (data.type === 'ready') { configure(await send({ type: 'state' })); return; }
    if (!/^[a-f0-9-]{36}$/.test(data.id || '')) return;
    if (data.type === 'create') {
      const result = await send({ type: 'notification-create', id: data.id,
        title: typeof data.title === 'string' ? data.title.slice(0, 512) : '',
        body: typeof data.body === 'string' ? data.body.slice(0, 2048) : '',
        silent: data.silent === true, requireInteraction: data.requireInteraction === true });
      post({ type: 'event', id: data.id, event: result?.ok ? 'show' : 'fallback' });
    } else if (data.type === 'close') await send({ type: 'notification-close', id: data.id });
  });
  chrome.runtime.onMessage.addListener(message => {
    if (message.type === 'state') configure(message);
    else if (message.type === 'notification-event') post({ type: 'event', id: message.id, event: message.event });
  });
  // Both ends announce readiness, so MAIN/isolated execution order is irrelevant.
  send({ type: 'state' }).then(configure);
})();
