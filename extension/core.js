export const SERVICES = Object.freeze([
  { id: 'whatsapp', name: 'WhatsApp', icon: 'W', url: 'https://web.whatsapp.com/', hosts: ['web.whatsapp.com'] },
  { id: 'telegram', name: 'Telegram', icon: 'T', url: 'https://web.telegram.org/k/', hosts: ['web.telegram.org'] },
  { id: 'fastmail', name: 'Fastmail', icon: 'F', url: 'https://app.fastmail.com/', hosts: ['app.fastmail.com'] },
  { id: 'gmail', name: 'Gmail', icon: 'G', url: 'https://mail.google.com/', hosts: ['mail.google.com'] },
]);

export function serviceForURL(raw) {
  try { const u = new URL(raw); return u.protocol === 'https:' ? SERVICES.find(s => s.hosts.includes(u.hostname)) : undefined; }
  catch { return undefined; }
}

// Read only explicit numeric title indicators. Unknown titles produce no badge,
// never guessed counts or message-content inspection.
export function unreadFromTitle(title, service) {
  const prefix = title.match(/^\((\d{1,6})\)\s/);
  const inbox = service === 'gmail' ? title.match(/^Inbox\s*\((\d{1,6})\)/i) : null;
  return Math.min(999999, Number((prefix || inbox)?.[1] || 0));
}

export function safeExternal(raw) {
  try { return ['https:', 'http:', 'mailto:', 'tel:'].includes(new URL(raw).protocol); }
  catch { return false; }
}

export function normalizePrefs(raw = {}) {
  return {
    theme: ['system', 'light', 'dark'].includes(raw.theme) ? raw.theme : 'system',
    badges: raw.badges !== false,
    externalLinks: raw.externalLinks !== false,
    zoom: Math.min(1.75, Math.max(0.5, Number(raw.zoom) || 1)),
  };
}
