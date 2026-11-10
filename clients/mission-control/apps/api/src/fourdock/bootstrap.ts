import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Run before upstream modules initialize stores. Never discover an existing
// wacli installation/session implicitly; normal startup is a synthetic demo.
if (!process.env.VITEST) {
  const mode = process.env.FOURDOCK_MODE || 'demo';
  if (!['demo', 'live'].includes(mode)) throw new Error('FOURDOCK_MODE must be demo or live');
  const root = path.resolve(process.env.FOURDOCK_DATA_DIR || path.join(os.homedir(), '.fourdock-whatsapp', mode));
  const marker = path.join(root, 'fourdock-client.json');
  fs.mkdirSync(root, { recursive: true, mode: 0o700 });
  if (!fs.existsSync(marker)) {
    if (fs.readdirSync(root).length) throw new Error('Choose an empty Fourdock data directory');
    fs.writeFileSync(marker, JSON.stringify({ app: 'fourdock-whatsapp', mode, version: 1 }), { mode: 0o600, flag: 'wx' });
  }
  const ownership = JSON.parse(fs.readFileSync(marker, 'utf8'));
  if (ownership.app !== 'fourdock-whatsapp' || ownership.mode !== mode) throw new Error('Data directory belongs to another mode');
  process.env.FOURDOCK_MODE = mode;
  process.env.FOURDOCK_DATA_DIR = root;
  process.env.WACLI_STORE_DIR = path.join(root, 'whatsapp');
  process.env.WACLI_DB_FILE = path.join(root, 'interface.db');
  fs.mkdirSync(process.env.WACLI_STORE_DIR, { recursive: true, mode: 0o700 });
  if (mode === 'demo') {
    process.env.WACLI_BIN = fileURLToPath(new URL('../../demo/wacli.mjs', import.meta.url));
  } else if (!process.env.WACLI_BIN || !path.isAbsolute(process.env.WACLI_BIN)) {
    throw new Error('Live mode needs an explicit absolute WACLI_BIN with auth pair support');
  }
  process.env.WACLI_DISABLE_SYNC = '1';
  process.env.WACLI_UPDATE_CHECK = '0';
  process.env.PORT ||= '4702';
  process.env.LOG_LEVEL ||= 'ERROR';
}
