import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SERVICES, serviceForURL, unreadFromTitle, safeExternal, normalizePrefs } from '../extension/core.js';

test('service origins are exact HTTPS matches, including deceptive URLs', () => {
  assert.equal(SERVICES.length, 4);
  assert.equal(serviceForURL('https://mail.google.com/mail/u/0/#inbox')?.id, 'gmail');
  for (const url of ['https://web.whatsapp.com.attacker.test/', 'http://web.whatsapp.com/', 'https://web.whatsapp.com@evil.test/', 'javascript:alert(1)', 'invalid']) assert.equal(serviceForURL(url), undefined);
});
test('badge parsing uses explicit title counts and avoids message previews', () => {
  assert.equal(unreadFromTitle('(12) WhatsApp', 'whatsapp'), 12);
  assert.equal(unreadFromTitle('Inbox (31) - synthetic@invalid - Gmail', 'gmail'), 31);
  assert.equal(unreadFromTitle('Inbox (31)', 'telegram'), 0);
  assert.equal(unreadFromTitle('Message 98765 from Someone', 'whatsapp'), 0);
  assert.equal(unreadFromTitle('(1234567) WhatsApp', 'whatsapp'), 0);
});
test('external opening rejects executable and local-file protocols', () => {
  for (const url of ['https://example.org/', 'http://localhost:99/', 'mailto:synthetic@example.org', 'tel:+390000']) assert.equal(safeExternal(url), true);
  for (const url of ['file:///etc/passwd', 'javascript:alert(1)', 'data:text/html,test', 'fourdock://quit', 'bad']) assert.equal(safeExternal(url), false);
});
test('preferences remain bounded and reject arbitrary appearance values', () => {
  assert.deepEqual(normalizePrefs({ theme: 'evil', zoom: -99 }), { theme: 'system', zoom: .5, badges: true, externalLinks: true,
    notifications: { whatsapp: true, telegram: true, fastmail: true, gmail: true } });
  assert.equal(normalizePrefs({ zoom: Infinity }).zoom, 1.75);
  assert.equal(normalizePrefs({ zoom: 'not-a-number' }).zoom, 1);
  assert.equal(normalizePrefs({ badges: false }).badges, false);
  assert.deepEqual(normalizePrefs({ notifications: { gmail: false, other: true } }).notifications,
    { whatsapp: true, telegram: true, fastmail: true, gmail: false });
});
