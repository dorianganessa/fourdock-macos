import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import net from 'node:net';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

export const LABEL = 'dev.fourdock.whatsapp-tunnel';
const OWNER = 'fourdock-whatsapp-autostart';
const xml = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');

export function agentPaths(homeDir = os.homedir(), configPath) {
  const root = path.join(homeDir, '.fourdock-whatsapp');
  return { root, config: path.resolve(configPath || path.join(root, 'ssh-config')),
    logs: path.join(root, 'logs'), marker: path.join(root, 'autostart-owner.json'),
    plist: path.join(homeDir, 'Library', 'LaunchAgents', `${LABEL}.plist`) };
}

export function renderTunnelAgent(files) {
  const args = ['/usr/bin/ssh', '-F', files.config, '-N', '-T',
    '-o', 'BatchMode=yes', '-o', 'IdentitiesOnly=yes', '-o', 'StrictHostKeyChecking=yes',
    '-o', 'ExitOnForwardFailure=yes', '-o', 'ConnectTimeout=10',
    '-o', 'ServerAliveInterval=15', '-o', 'ServerAliveCountMax=3', '-o', 'LogLevel=ERROR',
    '-L', '127.0.0.1:4702:127.0.0.1:4702', 'fourdock-whatsapp'];
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
<key>Label</key><string>${LABEL}</string>
<key>ProgramArguments</key><array>${args.map(arg => `<string>${xml(arg)}</string>`).join('')}</array>
<key>RunAtLoad</key><true/>
<key>KeepAlive</key><true/>
<key>ThrottleInterval</key><integer>15</integer>
<key>ProcessType</key><string>Background</string>
<key>StandardOutPath</key><string>${xml(path.join(files.logs, 'tunnel.out.log'))}</string>
<key>StandardErrorPath</key><string>${xml(path.join(files.logs, 'tunnel.err.log'))}</string>
</dict></plist>
`;
}

function managed(files) {
  try {
    if (fs.lstatSync(files.marker).isSymbolicLink()) return false;
    const marker = JSON.parse(fs.readFileSync(files.marker, 'utf8'));
    return marker.app === OWNER && marker.label === LABEL && marker.version === 1;
  } catch { return false; }
}

export function prepareTunnelAgent({ homeDir, configPath } = {}) {
  const files = agentPaths(homeDir, configPath);
  const config = fs.lstatSync(files.config);
  if (!config.isFile() || config.isSymbolicLink() || (config.mode & 0o077) !== 0 ||
    (process.getuid && config.uid !== process.getuid())) throw new Error('SSH config must be a private, owned regular file (0600).');
  if (fs.existsSync(files.plist) && (!managed(files) || fs.lstatSync(files.plist).isSymbolicLink())) {
    throw new Error('Existing launch agent is not owned by Fourdock; leaving it untouched.');
  }
  if (fs.existsSync(files.marker) && (!managed(files) || fs.lstatSync(files.marker).isSymbolicLink())) {
    throw new Error('Autostart ownership marker is invalid.');
  }
  for (const directory of [files.root, files.logs]) {
    if (fs.existsSync(directory) && fs.lstatSync(directory).isSymbolicLink()) throw new Error('Autostart directories must not be symlinks.');
    fs.mkdirSync(directory, { recursive: true, mode: 0o700 });
  }
  fs.mkdirSync(path.dirname(files.plist), { recursive: true });
  for (const name of ['tunnel.out.log', 'tunnel.err.log']) {
    const log = path.join(files.logs, name);
    if (fs.existsSync(log) && fs.lstatSync(log).isSymbolicLink()) throw new Error('Refusing a symlinked log file.');
    fs.closeSync(fs.openSync(log, 'a', 0o600));
    fs.chmodSync(log, 0o600);
  }
  const temporary = `${files.plist}.${process.pid}.tmp`;
  fs.writeFileSync(temporary, renderTunnelAgent(files), { mode: 0o600, flag: 'wx' });
  fs.renameSync(temporary, files.plist);
  fs.writeFileSync(files.marker, JSON.stringify({ app: OWNER, label: LABEL, version: 1 }) + '\n', { mode: 0o600 });
  return files;
}

const launchctl = args => execFileSync('/bin/launchctl', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
const serviceTarget = () => `gui/${process.getuid()}/${LABEL}`;
function state() {
  try {
    const output = launchctl(['print', serviceTarget()]);
    return { loaded: true, running: /state = running/.test(output),
      pid: Number(output.match(/\bpid = (\d+)/)?.[1]) || null };
  } catch { return { loaded: false, running: false, pid: null }; }
}
const portBusy = () => new Promise(resolve => {
  const listener = net.createServer(socket => socket.destroy());
  listener.once('error', () => resolve(true));
  listener.listen({ host: '127.0.0.1', port: 4702, exclusive: true }, () => listener.close(() => resolve(false)));
});

async function main() {
  if (process.platform !== 'darwin' || !process.getuid || process.getuid() === 0) throw new Error('Use a normal signed-in macOS user.');
  const action = process.argv[2] || '--status';
  const files = agentPaths();
  if (action === '--status') { console.log(JSON.stringify({ installed: managed(files), ...state() })); return; }
  if (action === '--disable') {
    if (!managed(files)) throw new Error('No managed Fourdock launch agent.');
    if (state().loaded) launchctl(['bootout', serviceTarget()]);
    launchctl(['disable', serviceTarget()]);
    console.log(JSON.stringify({ disabled: true })); return;
  }
  if (!['--prepare', '--install'].includes(action)) throw new Error('Use --prepare, --install, --status or --disable.');
  prepareTunnelAgent();
  execFileSync('/usr/bin/plutil', ['-lint', files.plist], { stdio: ['ignore', 'pipe', 'pipe'] });
  if (action === '--prepare') { console.log(JSON.stringify({ prepared: true, label: LABEL })); return; }
  if (!state().loaded && await portBusy()) throw new Error('Port 4702 is busy; the existing listener was not stopped.');
  if (state().loaded) launchctl(['bootout', serviceTarget()]);
  launchctl(['enable', serviceTarget()]);
  launchctl(['bootstrap', `gui/${process.getuid()}`, files.plist]);
  console.log(JSON.stringify({ installed: true, ...state() }));
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  main().catch(() => { console.error('Fourdock autostart operation failed; existing credentials and profiles were not changed.'); process.exitCode = 1; });
}
