// Network-only shell: never cache conversations, API responses or pairing data.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));
self.addEventListener('fetch', event => {
  if (event.request.mode !== 'navigate') return;
  event.respondWith(fetch(event.request).catch(() => new Response(
    '<!doctype html><title>Fourdock offline</title><h1>Fourdock non è raggiungibile</h1><p>Riapri il collegamento al client e ricarica questa finestra.</p>',
    { headers: { 'Content-Type': 'text/html; charset=utf-8' } },
  )));
});
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(self.clients.matchAll({ type: 'window' }).then(async windows => {
    const existing = windows.find(client => new URL(client.url).origin === self.location.origin);
    if (existing) await existing.focus();
    else await self.clients.openWindow('/');
  }));
});
