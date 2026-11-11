#!/usr/bin/env node
// Synthetic contract fixture. It contains no WhatsApp client or network code.
import { createInterface } from 'node:readline';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
const args = process.argv.slice(2);
const write = value => process.stdout.write(JSON.stringify(value) + '\n');
const ok = data => write({ success: true, data, error: null });
if (args.includes('--version')) { console.log('wacli 0.20.0-fourdock-demo'); process.exit(0); }
if (args.includes('auth') && args.includes('pair')) {
  const id = crypto.randomBytes(32).toString('hex');
  const challenge = Buffer.from('Fourdock synthetic challenge only').toString('base64url');
  write({ type: 'qr', png: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLbtAAAAABJRU5ErkJggg==' });
  setTimeout(() => write({ type: 'passkey', id, publicKey: { rpId: 'whatsapp.com', challenge, userVerification: 'required', allowCredentials: [] } }), 400);
  let step = 'passkey';
  createInterface({ input: process.stdin }).on('line', line => {
    const reply = JSON.parse(line);
    if (reply.id !== id || reply.type !== step) process.exit(1);
    if (step === 'passkey') { step = 'confirm'; write({ type: 'confirm', id, code: '1234' }); }
    else if (reply.confirmed === true) { write({ type: 'paired' }); process.exit(0); }
    else process.exit(1);
  });
} else if (args.includes('sync') && args.includes('--help')) {
  console.log('Synthetic sync --send-spacing');
} else if (args.includes('sync')) {
  console.error(JSON.stringify({ event: 'connected' }));
  const heartbeat = () => {
    if (process.env.WACLI_STORE_DIR) fs.writeFileSync(path.join(process.env.WACLI_STORE_DIR, 'HEARTBEAT'), String(Date.now()));
  };
  heartbeat(); setInterval(heartbeat, 5000);
} else if (args.includes('doctor')) {
  ok({ authenticated: true, connected: true, connection_state: 'connected', fts_enabled: true,
    store: { messages: 4, chats: 2, contacts: 2, groups: 0 } });
} else if (args.includes('auth')) ok({ authenticated: true });
else if (args.includes('chats') && args.includes('list')) ok([
  { jid: 'demo-one@s.whatsapp.net', kind: 'dm', name: 'Alice · demo', unread: true, unread_count: 2, last_message_ts: '2026-11-01T10:30:00Z' },
  { jid: 'demo-two@s.whatsapp.net', kind: 'dm', name: 'Bob · demo', unread: true, unread_count: 1, last_message_ts: '2026-11-01T10:25:00Z' },
]);
else if (args.includes('messages') && args.includes('list')) {
  const messages = [
    { ChatJID: 'demo-one@s.whatsapp.net', ChatName: 'Alice · demo', MsgID: 'demo-1', SenderJID: 'demo-one@s.whatsapp.net', SenderName: 'Alice', Text: 'Questa conversazione contiene soltanto dati dimostrativi.', Timestamp: '2026-11-01T10:30:00Z', FromMe: false },
    { ChatJID: 'demo-one@s.whatsapp.net', ChatName: 'Alice · demo', MsgID: 'demo-2', SenderJID: 'demo-me@s.whatsapp.net', SenderName: 'Demo', Text: 'Bozze, ricerca e cambio chat usano l’interfaccia Mission Control.', Timestamp: '2026-11-01T10:31:00Z', FromMe: true },
    { ChatJID: 'demo-two@s.whatsapp.net', ChatName: 'Bob · demo', MsgID: 'demo-3', SenderJID: 'demo-two@s.whatsapp.net', SenderName: 'Bob', Text: 'Puoi provare icona, badge e notifiche senza collegare un account.', Timestamp: '2026-11-01T10:25:00Z', FromMe: false },
  ];
  const chat = args[args.indexOf('--chat') + 1];
  ok({ messages: args.includes('--chat') ? messages.filter(m => m.ChatJID === chat) : messages });
} else if (args.includes('groups')) ok([]);
else if (args.includes('search')) ok({ results: [], fts: true });
else if (args.includes('history')) ok([]);
else if (args.includes('send')) { console.error('Synthetic demo never sends messages'); process.exit(1); }
else ok({});
