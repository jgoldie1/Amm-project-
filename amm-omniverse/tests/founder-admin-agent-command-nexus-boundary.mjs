import fs from 'node:fs';
import assert from 'node:assert/strict';

const docs = fs.readFileSync(new URL('../docs/FOUNDER_ADMIN_AGENT.md', import.meta.url), 'utf8');
assert.match(docs, /Automan \/ Command Nexus/);
assert.match(docs, /permitted action/);
assert.match(docs, /one control plane/);

console.log('Founder Admin Agent Command Nexus boundary: PASS');
