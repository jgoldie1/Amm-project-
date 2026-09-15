import fs from 'node:fs';
import assert from 'node:assert/strict';

const docs = fs.readFileSync(new URL('../docs/FOUNDER_ADMIN_AGENT.md', import.meta.url), 'utf8');

for (const state of ['LIVE', 'READY', 'BUILDING', 'LOCKED', 'COMING SOON']) {
  assert.ok(docs.includes(state), `missing truth state ${state}`);
}
assert.match(docs, /open pull request is not sufficient evidence/i);
assert.match(docs, /Status: BUILDING/);

console.log('Founder Admin Agent truth boundary: PASS');
