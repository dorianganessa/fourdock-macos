import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { writeFile } from 'node:fs/promises';

if (process.platform !== 'darwin' || process.env.CI !== 'true') {
  throw new Error('WebKit native execution is CI-only; target requires accepted signing/IT authorization.');
}
const server = createServer((req, res) => {
  const url = new URL(req.url, 'http://127.0.0.1');
  const name = url.pathname.slice(1);
  if (!['whatsapp', 'gmail', 'popup'].includes(name)) { res.writeHead(404).end(); return; }
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Security-Policy', "default-src 'none'; script-src 'none'; connect-src 'none'; frame-src 'none'");
  if (url.searchParams.get('phase') === 'write') res.setHeader('Set-Cookie', `fixture=${name}; Path=/; Max-Age=86400; HttpOnly; SameSite=Lax`);
  res.end(`<!doctype html><html><body data-fixture="${name}"><h1>Synthetic ${name}</h1><input aria-label="Unsent fixture draft"></body></html>`);
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const base = `http://127.0.0.1:${server.address().port}`;
const ids = [randomUUID(), randomUUID()];
const results = [];
try {
  for (const phase of ['write', 'read']) {
    await new Promise((resolve, reject) => {
      const child = spawn('dist/Fourdock-WebKit-Fixtures.app/Contents/MacOS/Fourdock-WebKit-Fixtures', [base, ...ids, phase], { stdio: ['ignore', 'pipe', 'pipe'] });
      let output = '';
      let failure = '';
      child.stdout.on('data', data => { output += data; });
      // WebKit system stderr can contain navigation details. Never publish it.
      child.stderr.on('data', data => {
        const line = String(data).split('\n').find(value => value.startsWith('FAIL WebKit fixture:'));
        if (line) failure = line;
      });
      const timer = setTimeout(() => { child.kill('SIGKILL'); reject(new Error(`WebKit ${phase} timeout`)); }, 60000);
      child.on('error', error => { clearTimeout(timer); reject(error); });
      child.on('exit', code => {
        clearTimeout(timer);
        if (code === 0 && output.includes(`PASS WebKit synthetic ${phase}:`)) {
          const summary = output.split('\n').find(line => line.startsWith('PASS WebKit synthetic'));
          results.push({ phase, state: 'PASS AUTOMATICO', summary });
          console.log(summary);
          resolve();
        } else reject(new Error(`${failure || `WebKit ${phase} failed (exit ${code})`}; account authentication was not tested`));
      });
    });
  }
  await writeFile('dist/webkit-probe-results.json', JSON.stringify({ runtime: 'system WKWebView', syntheticOnly: true, results }, null, 2) + '\n');
} finally {
  await new Promise(resolve => server.close(resolve));
}
