// Network-only shell: never cache conversations, API responses or pairing data.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));
self.addEventListener('fetch', event => {
  if (event.request.mode !== 'navigate') return;
  event.respondWith(fetch(event.request).catch(() => new Response(
    `<!doctype html><meta name="viewport" content="width=device-width, initial-scale=1"><title>Fourdock offline</title>
    <body style="background:#12151b;color:#eef2f7;font:18px system-ui;padding:48px">
    <h1>Riconnessione a Fourdock…</h1><p>La finestra tornerà disponibile appena il collegamento sarà ripristinato.</p>
    <script>
    (function retry() {
      setTimeout(async () => {
        try {
          const response = await fetch('/', {method: 'HEAD', cache: 'no-store'});
          if (response.ok) { location.reload(); return; }
        } catch {}
        retry();
      }, 2000);
    })();
    </script>`,
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
