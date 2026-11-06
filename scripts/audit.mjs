import { execFileSync } from 'node:child_process';
import assert from 'node:assert/strict';

// Scan the complete tracked tree plus all local history. Print paths only, never
// matching lines, so a failed audit cannot itself disclose a credential.
const files = execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8' }).split('\0').filter(Boolean);
const patterns = [/gh[pousr]_[A-Za-z0-9]{20,}/, /github_pat_[A-Za-z0-9_]{20,}/, /sk-[A-Za-z0-9_-]{24,}/, /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/, /(?:eyJ[A-Za-z0-9_-]{10,}\.){2}[A-Za-z0-9_-]{10,}/];
const failures = [];
for (const file of files) {
  if (/(^|\/)(node_modules|BrowserProfile|profiles|private|User Data|test-results)(\/|$)|\.(p12|pem|key|sqlite|db|log)$|(^|\/)\.env(?:\.|$)/i.test(file)) failures.push(file);
  const content = execFileSync('git', ['show', `:${file}`], { encoding: 'utf8', maxBuffer: 8 * 1024 * 1024 });
  if (patterns.some(p => p.test(content))) failures.push(file);
}
let history = '';
try { history = execFileSync('git', ['log', '--all', '-p', '--format=fuller'], { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 }); } catch { /* Initial repository has no commits. */ }
assert(!patterns.some(p => p.test(history)), 'Credential-like data in history; publication blocked');
assert.equal(failures.length, 0, `Publication blocked; inspect these paths privately: ${[...new Set(failures)].join(', ')}`);
console.log(`PASS tracked tree (${files.length} files), path exclusions and local history secret-pattern audit`);
