import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Pairing } from '../fourdock/pairing.js';

const fake = fileURLToPath(new URL('../../demo/wacli.mjs', import.meta.url));
const store = () => fs.mkdtempSync(path.join(os.tmpdir(), 'fourdock-pair-'));
async function until(check: () => boolean) {
  for (let i = 0; i < 120; i++) { if (check()) return; await new Promise(resolve => setTimeout(resolve, 20)); }
  throw new Error('Synthetic pairing did not complete');
}
describe('Fourdock single-attempt pairing transport', () => {
  it('round trips the exact challenge, rejects cross-owner/replay/wrong-origin and requires confirmation', async () => {
    const pair = new Pairing(fake, store());
    try {
      const start = pair.start();
      expect(() => pair.start()).toThrow('pairing-active');
      await until(() => pair.snapshot(start.owner).request?.type === 'passkey');
      expect(pair.snapshot().request).toBeUndefined();
      const request = pair.snapshot(start.owner).request!;
      const assertion = (origin: string) => ({ id: 'synthetic', type: 'public-key', response: {
        clientDataJSON: Buffer.from(JSON.stringify({ type: 'webauthn.get', origin, challenge: request.publicKey!.challenge })).toString('base64url'),
        signature: 'synthetic', authenticatorData: 'synthetic',
      } });
      expect(() => pair.reply('wrong-owner', { type: 'passkey', id: request.id, assertion: assertion('https://web.whatsapp.com') })).toThrow();
      expect(() => pair.reply(start.owner, { type: 'passkey', id: request.id, assertion: assertion('https://evil.invalid') })).toThrow();
      pair.reply(start.owner, { type: 'passkey', id: request.id, assertion: assertion('https://web.whatsapp.com') });
      expect(() => pair.reply(start.owner, { type: 'passkey', id: request.id, assertion: assertion('https://web.whatsapp.com') })).toThrow();
      await until(() => pair.snapshot(start.owner).request?.type === 'confirm');
      const confirmation = pair.snapshot(start.owner).request!;
      expect(() => pair.reply(start.owner, { type: 'confirm', id: confirmation.id, confirmed: false })).toThrow();
      pair.reply(start.owner, { type: 'confirm', id: confirmation.id, confirmed: true });
      await until(() => pair.snapshot().phase === 'paired' && !pair.snapshot().active);
      expect(pair.snapshot(start.owner).request).toBeUndefined();
    } finally { pair.stop(); }
  });
  it('refuses an existing store, bounds a failed ceremony, and cancels one attempt', async () => {
    const existing = store(); fs.writeFileSync(path.join(existing, 'session.db'), 'synthetic');
    expect(() => new Pairing(fake, existing).start()).toThrow('session-exists');
    const timeout = new Pairing(fake, store(), 40); timeout.start();
    await until(() => timeout.snapshot().failure === 'timeout');
    expect(timeout.snapshot().active).toBe(false);
    const cancelled = new Pairing(fake, store()); const { owner } = cancelled.start();
    expect(() => cancelled.cancel('wrong-owner')).toThrow();
    cancelled.cancel(owner);
    expect(cancelled.snapshot().failure).toBe('cancelled');
    expect(cancelled.snapshot(owner).request).toBeUndefined();
  });
});
