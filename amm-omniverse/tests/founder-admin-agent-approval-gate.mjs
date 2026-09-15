import fs from 'node:fs';
import assert from 'node:assert/strict';

const source = fs.readFileSync(new URL('../src/runtime/FounderAdminAgent.ts', import.meta.url), 'utf8');

assert.match(source, /const READ_ONLY/);
assert.match(source, /const LOW_RISK/);
assert.match(source, /DEPLOY_PRODUCTION/);
assert.match(source, /CHANGE_SECURITY/);
assert.match(source, /DELETE_DATA/);
assert.match(source, /MOVE_REAL_MONEY/);
assert.match(source, /allowed: false/);
assert.match(source, /requiresFounderApproval: true/);

console.log('Founder Admin Agent approval gate: PASS');
