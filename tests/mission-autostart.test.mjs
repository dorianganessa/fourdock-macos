import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { prepareTunnelAgent, agentPaths, LABEL } from '../scripts/mission-autostart.mjs';

function fixture() {
  const homeDir = fs.mkdtempSync(path.join(os.tmpdir(), 'fourdock-autostart-'));
  const configPath = path.join(homeDir, 'private & spaced config');
  fs.writeFileSync(configPath, 'Host fourdock-whatsapp\n HostName example.invalid\n', { mode: 0o600 });
  return { homeDir, configPath };
}
test('creates a parseable private user agent with loopback forwarding and restart controls', () => {
  const options = fixture();
  const files = prepareTunnelAgent(options);
  const parsed = JSON.parse(execFileSync('python3', ['-c', 'import plistlib,json,sys; print(json.dumps(plistlib.loads(sys.stdin.buffer.read())))'], { input: fs.readFileSync(files.plist), encoding: 'utf8' }));
  assert.equal(parsed.Label, LABEL);
  assert.equal(parsed.ProgramArguments[0], '/usr/bin/ssh');
  assert.equal(parsed.ProgramArguments[2], options.configPath);
  assert(parsed.ProgramArguments.includes('127.0.0.1:4702:127.0.0.1:4702'));
  assert(parsed.ProgramArguments.includes('StrictHostKeyChecking=yes'));
  assert(parsed.ProgramArguments.includes('ExitOnForwardFailure=yes'));
  assert.equal(parsed.RunAtLoad, true);
  assert.equal(parsed.KeepAlive, true);
  assert.equal(parsed.ThrottleInterval, 15);
  assert.equal(fs.statSync(files.plist).mode & 0o777, 0o600);
  assert.equal(fs.statSync(files.logs).mode & 0o777, 0o700);
  assert(!fs.readFileSync(files.plist, 'utf8').includes('example.invalid'));
  assert.doesNotThrow(() => prepareTunnelAgent(options));
});
test('refuses a readable or symlinked private config without writing an agent', () => {
  const options = fixture();
  fs.chmodSync(options.configPath, 0o644);
  assert.throws(() => prepareTunnelAgent(options), /private/);
  assert(!fs.existsSync(agentPaths(options.homeDir).plist));
  fs.chmodSync(options.configPath, 0o600);
  const link = path.join(options.homeDir, 'config-link');
  fs.symlinkSync(options.configPath, link);
  assert.throws(() => prepareTunnelAgent({ ...options, configPath: link }), /private/);
});
test('does not overwrite an unrelated launch agent or follow a log symlink', () => {
  const options = fixture();
  const files = agentPaths(options.homeDir, options.configPath);
  fs.mkdirSync(path.dirname(files.plist), { recursive: true });
  fs.writeFileSync(files.plist, 'foreign agent');
  assert.throws(() => prepareTunnelAgent(options), /not owned/);
  assert.equal(fs.readFileSync(files.plist, 'utf8'), 'foreign agent');
  fs.unlinkSync(files.plist);
  fs.mkdirSync(files.logs, { recursive: true });
  fs.symlinkSync(options.configPath, path.join(files.logs, 'tunnel.err.log'));
  assert.throws(() => prepareTunnelAgent(options), /symlinked log/);
});
