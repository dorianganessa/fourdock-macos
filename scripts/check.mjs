import { readdir, readFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import assert from 'node:assert/strict';
for (const dir of ['extension', 'scripts', 'tests']) {
  for (const file of await readdir(dir)) if (/\.(m?js)$/.test(file)) execFileSync(process.execPath, ['--check', `${dir}/${file}`]);
}
const manifest = JSON.parse(await readFile('extension/manifest.json', 'utf8'));
assert.equal(manifest.manifest_version, 3);
assert(!manifest.host_permissions.includes('<all_urls>'));
assert(!manifest.permissions.some(p => ['cookies', 'debugger', 'webRequest', 'history'].includes(p)));
const expected = JSON.parse(await readFile('extension/id.json', 'utf8')).id;
const { createHash } = await import('node:crypto');
const id = [...createHash('sha256').update(Buffer.from(manifest.key, 'base64')).digest('hex').slice(0, 32)].map(c => String.fromCharCode(97 + parseInt(c, 16))).join('');
assert.equal(id, expected);
assert((await readFile('native/main.swift', 'utf8')).includes(`let extensionID = "${id}"`));
console.log('PASS JavaScript syntax, narrow extension permissions and native/extension identity');
