import { spawn, execFileSync } from 'node:child_process';
import { stat, readFile } from 'node:fs/promises';
import { setTimeout as delay } from 'node:timers/promises';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';

if (process.env.CI !== 'true') throw new Error('Native execution is blocked on the managed development Mac; run this check only on the approved CI host.');
const exe = path.resolve('dist/Fourdock.app/Contents/MacOS/Fourdock');
const root = path.join(os.homedir(), 'Library/Application Support/Fourdock');
const socket = path.join(os.homedir(), '.fourdock/bridge.sock');
const app = spawn(exe, [], { stdio: 'ignore' });
let host;
try {
  // Independent observation of the actual packaged app, without a special mode
  // or mocked AppKit. Its normal first-run window must exist on screen.
  execFileSync('xcrun', ['swift', 'scripts/inspect-window.swift', String(app.pid)], { timeout: 60000, stdio: 'inherit' });
  assert.equal((await stat(socket)).mode & 0o777, 0o600);
  const manifest = JSON.parse(await readFile(path.join(root, 'BrowserProfile/NativeMessagingHosts/com.fourdock.bridge.json'), 'utf8'));
  assert.equal(manifest.path, exe);
  assert.deepEqual(manifest.allowed_origins, ['chrome-extension://infjmihppfefdefbgjginaijgcponpog/']);
  host = spawn(exe, ['--native-host'], { stdio: ['pipe', 'pipe', 'ignore'] });
  const payload = Buffer.from(JSON.stringify({ type: 'hello' }));
  const header = Buffer.alloc(4); header.writeUInt32LE(payload.length);
  host.stdin.write(Buffer.concat([header, payload]));
  let connected = false;
  for (let i = 0; i < 100; i++) {
    try { connected = (await readFile(path.join(root, 'extension-connected'), 'utf8')).trim() === 'connected'; } catch { /* Wait for native IPC delivery. */ }
    if (connected) break;
    if (app.exitCode !== null || host.exitCode !== null) break;
    await delay(50);
  }
  assert(connected, 'Native host frame did not reach the running packaged application');
  assert.equal(app.exitCode, null);
  console.log('PASS packaged app startup, private IPC socket, scoped native-host registration and end-to-end host frame');
} finally {
  host?.kill('SIGTERM');
  app.kill('SIGTERM');
}
