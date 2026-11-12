import { describe, it, expect, vi } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { savedSyncAllowed } from '../fourdock/saved-sync.js';

const fixture = () => {
  const store = fs.mkdtempSync(path.join(os.tmpdir(), 'fourdock-saved-sync-'));
  fs.writeFileSync(path.join(store, 'session.db'), 'synthetic fixture');
  return { mode: 'live', enabled: '1', bin: '/synthetic/wacli', store };
};
describe('saved-session automatic synchronization', () => {
  it('requires explicit live opt-in and an existing regular session file', () => {
    const options = fixture();
    const probe = vi.fn();
    expect(savedSyncAllowed({ ...options, enabled: undefined }, probe)).toBe(false);
    expect(savedSyncAllowed({ ...options, mode: 'demo' }, probe)).toBe(false);
    expect(savedSyncAllowed({ ...options, bin: 'wacli' }, probe)).toBe(false);
    fs.unlinkSync(path.join(options.store, 'session.db'));
    expect(savedSyncAllowed(options, probe)).toBe(false);
    expect(probe).not.toHaveBeenCalled();
  });
  it('uses only a bounded read-only status command before permitting startup', () => {
    const options = fixture();
    const probe = vi.fn().mockReturnValue(JSON.stringify({ success: true, data: { authenticated: true } }));
    expect(savedSyncAllowed(options, probe)).toBe(true);
    const [bin, args, settings] = probe.mock.calls[0];
    expect(bin).toBe(options.bin);
    expect(args).toContain(options.store);
    expect(args.slice(-2)).toEqual(['auth', 'status']);
    expect(args).not.toContain('pair');
    expect(settings.env.WACLI_READONLY).toBe('1');
    expect(settings.timeout).toBeLessThanOrEqual(10000);
    expect(settings.maxBuffer).toBeLessThanOrEqual(65536);
    expect(settings.stdio[2]).toBe('ignore');
  });
  it('leaves partial/invalid/revoked sessions stopped and never retries', () => {
    const options = fixture();
    for (const result of [{ success: true, data: { authenticated: false } },
      { success: true, data: { authenticated: 'true' } }, { success: false }, {}]) {
      const probe = vi.fn().mockReturnValue(JSON.stringify(result));
      expect(savedSyncAllowed(options, probe)).toBe(false);
      expect(probe).toHaveBeenCalledTimes(1);
    }
    expect(savedSyncAllowed(options, () => { throw new Error('synthetic timeout'); })).toBe(false);
    expect(savedSyncAllowed(options, () => 'invalid JSON')).toBe(false);
  });
  it('refuses a symlink to a different session', () => {
    const options = fixture();
    fs.renameSync(path.join(options.store, 'session.db'), path.join(options.store, 'other.db'));
    fs.symlinkSync(path.join(options.store, 'other.db'), path.join(options.store, 'session.db'));
    const probe = vi.fn();
    expect(savedSyncAllowed(options, probe)).toBe(false);
    expect(probe).not.toHaveBeenCalled();
  });
});
