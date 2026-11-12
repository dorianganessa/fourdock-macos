import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

type Probe = (bin: string, args: string[], options: {
  encoding: 'utf8'; timeout: number; maxBuffer: number;
  env: NodeJS.ProcessEnv; stdio: ['ignore', 'pipe', 'ignore'];
}) => string;

/** Opt-in recovery of this candidate's saved session; never initiates pairing. */
export function savedSyncAllowed(options: {
  mode: string; enabled?: string; bin?: string; store: string;
}, probe: Probe = execFileSync): boolean {
  const { mode, enabled, bin, store } = options;
  if (mode !== 'live' || enabled !== '1' || !bin || !path.isAbsolute(bin) || !path.isAbsolute(store)) return false;
  try {
    const directory = fs.lstatSync(store);
    const session = fs.lstatSync(path.join(store, 'session.db'));
    if (!directory.isDirectory() || directory.isSymbolicLink() || !session.isFile() || session.isSymbolicLink()) return false;
    const result = JSON.parse(probe(bin, ['--store', store, '--timeout', '5s', '--json', 'auth', 'status'], {
      encoding: 'utf8', timeout: 8000, maxBuffer: 65536,
      env: { ...process.env, WACLI_READONLY: '1' }, stdio: ['ignore', 'pipe', 'ignore'],
    }));
    return result.success === true && result.data?.authenticated === true;
  } catch {
    // A partial/revoked store, lock or CLI error must leave sync stopped.
    // Never log session output or fall back to an auth/pair command.
    return false;
  }
}
