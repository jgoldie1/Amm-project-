import fs from 'node:fs';
import assert from 'node:assert/strict';

const source = fs.readFileSync(new URL('../src/runtime/FounderAdminAgent.ts', import.meta.url), 'utf8');

assert.match(source, /INSPECT_STATUS/);
assert.match(source, /DIAGNOSE_FAILURE/);
assert.match(source, /RERUN_TEST/);
assert.match(source, /RETRY_HEALTH_CHECK/);
assert.match(source, /DEPLOY_PRODUCTION/);
assert.match(source, /CHANGE_SECURITY/);
assert.match(source, /DELETE_DATA/);
assert.match(source, /MOVE_REAL_MONEY/);
assert.match(source, /requiresFounderApproval: true/);
assert.match(source, /allowed: false/);
assert.match(source, /never grants autonomous authority/i);

console.log('Founder Admin Agent contract: PASS');
