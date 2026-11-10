import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import { Router } from 'express';
import type { WacliProcessManager } from '../wacli/process-manager.js';
import { execWacli } from '../wacli/commands.js';

const MAX = 65536;
const phases = new Set(['passkey_requested', 'assertion_received', 'assertion_validated', 'submitting_assertion',
  'assertion_submitted', 'confirmation_required', 'confirming_pairing', 'confirmation_submitted',
  'session_saved', 'login_redirect', 'authenticated']);
type Packet = { type: string; id?: string; png?: string; publicKey?: Record<string, unknown>; code?: string; phase?: string };

export class Pairing {
  private child?: ChildProcessWithoutNullStreams;
  private pending?: Packet;
  private buffer = Buffer.alloc(0);
  private timer?: ReturnType<typeof setTimeout>;
  private phase = 'idle';
  private failure?: string;
  private owner?: string;
  private shutdown = () => this.stop('cancelled');
  constructor(private bin: string, private store: string, private timeout = 300000) {}

  snapshot(owner?: string) {
    return { phase: this.phase, failure: this.failure, active: !!this.child,
      ...(owner && owner === this.owner && this.pending ? { request: this.pending } : {}) };
  }

  assertStartable() {
    if (this.child) throw new Error('pairing-active');
    // The companion store is owned by this candidate, never the monitor's store.
    // Refuse to overwrite even a stale/revoked session; operator review required.
    if (fs.existsSync(`${this.store}/session.db`)) throw new Error('session-exists');
  }
  start() {
    this.assertStartable();
    this.owner = crypto.randomBytes(32).toString('hex');
    this.pending = undefined; this.failure = undefined; this.phase = 'starting'; this.buffer = Buffer.alloc(0);
    const child = spawn(this.bin, ['--store', this.store, '--timeout', '5m', 'auth', 'pair'], {
      stdio: ['pipe', 'pipe', 'pipe'], env: { ...process.env, WACLI_STORE_DIR: this.store },
    });
    this.child = child;
    process.once('SIGTERM', this.shutdown);
    // stderr is deliberately discarded, never logged or returned as an auth error.
    child.stderr.resume();
    child.stdin.on('error', () => { if (this.child === child) this.stop('pipe-closed'); });
    child.stdout.on('data', (chunk: Buffer) => {
      if (this.child !== child) return;
      this.buffer = Buffer.concat([this.buffer, chunk]);
      while (this.buffer.includes(10)) {
        const end = this.buffer.indexOf(10);
        const line = this.buffer.subarray(0, end); this.buffer = this.buffer.subarray(end + 1);
        if (line.length > MAX) { this.stop('protocol'); return; }
        try { this.receive(JSON.parse(line.toString('utf8')) as Packet); }
        catch { this.stop('protocol'); return; }
      }
      if (this.buffer.length > MAX) this.stop('protocol');
    });
    child.on('error', () => { if (this.child === child) this.stop('client-unavailable'); });
    child.on('exit', code => {
      if (this.child !== child) return;
      if (this.phase === 'paired' && code === 0) this.finish();
      else this.stop('client-stopped');
    });
    this.timer = setTimeout(() => this.stop('timeout'), this.timeout);
    return { owner: this.owner, ...this.snapshot(this.owner) };
  }

  private receive(packet: Packet) {
    if (packet.type === 'progress') {
      if (!phases.has(packet.phase || '')) throw new Error();
      this.phase = packet.phase!; return;
    }
    if (packet.type === 'paired') { this.phase = 'paired'; this.pending = undefined; return; }
    if (packet.type === 'failed') { this.stop('pairing-refused'); return; }
    if (packet.type === 'qr') {
      if (this.pending && this.pending.type !== 'qr') throw new Error();
      if (typeof packet.png !== 'string' || packet.png.length > 64000 || !/^[A-Za-z0-9+/=]+$/.test(packet.png)) throw new Error();
      this.pending = { type: 'qr', png: packet.png }; this.phase = 'qr'; return;
    }
    if (!['passkey', 'confirm'].includes(packet.type) || !/^[a-f0-9]{64}$/.test(packet.id || '')) throw new Error();
    if (this.pending && this.pending.type !== 'qr') throw new Error();
    if (packet.type === 'passkey') {
      const key = packet.publicKey;
      if (!key || !['whatsapp.com', 'web.whatsapp.com'].includes(String(key.rpId)) ||
        typeof key.challenge !== 'string' || !/^[A-Za-z0-9_-]{16,1024}$/.test(key.challenge)) throw new Error();
      this.pending = { type: 'passkey', id: packet.id, publicKey: key };
    } else {
      if (typeof packet.code !== 'string' || packet.code.length > 32) throw new Error();
      this.pending = { type: 'confirm', id: packet.id, code: packet.code };
    }
    this.phase = packet.type;
  }

  reply(owner: string, reply: Record<string, unknown>) {
    if (!owner || owner !== this.owner || !this.child || !this.pending ||
      this.pending.id !== reply.id || this.pending.type !== reply.type) throw new Error('stale-request');
    const payload: Record<string, unknown> = { type: reply.type, id: reply.id };
    if (reply.type === 'confirm') {
      if (reply.confirmed !== true) throw new Error('confirmation-required');
      payload.confirmed = true;
    } else if (reply.type === 'passkey') {
      const assertion = reply.assertion as Record<string, unknown> | undefined;
      const response = assertion?.response as Record<string, unknown> | undefined;
      if (!assertion || assertion.type !== 'public-key' || typeof assertion.id !== 'string' || !response ||
        typeof response.clientDataJSON !== 'string' || typeof response.signature !== 'string' ||
        typeof response.authenticatorData !== 'string') throw new Error('assertion-invalid');
      const data = JSON.parse(Buffer.from(response.clientDataJSON, 'base64url').toString('utf8'));
      if (data.type !== 'webauthn.get' || data.origin !== 'https://web.whatsapp.com' || data.crossOrigin === true ||
        data.challenge !== this.pending.publicKey?.challenge) throw new Error('assertion-invalid');
      payload.assertion = assertion;
    } else throw new Error('stale-request');
    const encoded = JSON.stringify(payload) + '\n';
    if (Buffer.byteLength(encoded) >= MAX) throw new Error('oversized-response');
    this.child.stdin.write(encoded);
    // Request and assertion never enter a database, log, or event history.
    this.pending = undefined; this.phase = 'waiting';
  }

  cancel(owner: string) { if (owner !== this.owner) throw new Error('stale-request'); this.stop('cancelled'); }
  private finish() { clearTimeout(this.timer); process.removeListener('SIGTERM', this.shutdown); this.child = undefined; this.pending = undefined; this.buffer = Buffer.alloc(0); }
  stop(code = 'cancelled') {
    const child = this.child; this.finish(); this.phase = 'failed'; this.failure = code;
    child?.stdin.end(); child?.kill('SIGTERM');
    if (child) { const timer = setTimeout(() => child.kill('SIGKILL'), 2000); timer.unref(); }
  }
}

export function createPairingRouter(pm: WacliProcessManager): Router {
  const router = Router();
  const pairing = new Pairing(process.env.WACLI_BIN || '', process.env.WACLI_STORE_DIR || '');
  const owner = (value: unknown) => typeof value === 'string' ? value : '';
  router.use((_req, res, next) => { res.setHeader('Cache-Control', 'no-store'); next(); });
  router.get('/pairing', (req, res) => res.json({ mode: process.env.FOURDOCK_MODE || 'demo', ...pairing.snapshot(owner(req.headers['x-fourdock-owner'])) }));
  router.post('/pairing/start', async (req, res) => {
    if (req.headers['x-fourdock-request'] !== '1') { res.sendStatus(403); return; }
    try { pairing.assertStartable(); await pm.stop(); res.json(pairing.start()); }
    catch (error) { res.status(409).json({ error: error instanceof Error && ['session-exists', 'pairing-active'].includes(error.message) ? error.message : 'pairing-unavailable' }); }
  });
  router.post('/pairing/reply', (req, res) => {
    try { pairing.reply(owner(req.headers['x-fourdock-owner']), req.body as Record<string, unknown>); res.json({ ok: true }); }
    catch { res.status(400).json({ error: 'response-refused' }); }
  });
  router.post('/pairing/cancel', (req, res) => {
    try { pairing.cancel(owner(req.headers['x-fourdock-owner'])); res.json({ ok: true }); }
    catch { res.status(403).json({ error: 'not-owner' }); }
  });
  router.post('/pairing/sync', async (req, res) => {
    if (req.headers['x-fourdock-request'] !== '1' || pairing.snapshot().active) { res.sendStatus(409); return; }
    try {
      const status = await execWacli<{ authenticated?: boolean }>(['auth', 'status']);
      if (status.authenticated !== true) { res.status(409).json({ error: 'not-paired' }); return; }
      await pm.start(); res.json({ ok: true });
    } catch { res.status(503).json({ error: 'client-unavailable' }); }
  });
  return router;
}
