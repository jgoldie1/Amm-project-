import fs from 'node:fs';
import assert from 'node:assert/strict';

const source = fs.readFileSync(new URL('../src/runtime/FounderAdminAgent.ts', import.meta.url), 'utf8');

for (const action of [
  'INSPECT_STATUS',
  'DIAGNOSE_FAILURE',
  'RERUN_TEST',
  'RETRY_HEALTH_CHECK',
  'DEPLOY_PRODUCTION',
  'CHANGE_SECURITY',
  'DELETE_DATA',
  'MOVE_REAL_MONEY',
]) {
  assert.ok(source.includes(action), `missing policy action ${action}`);
}

assert.ok(source.includes("risk: 'READ_ONLY'"));
assert.ok(source.includes("risk: 'LOW'"));
assert.ok(source.includes("risk: 'HIGH'"));
assert.ok(source.includes('requiresFounderApproval: true'));
assert.ok(source.includes('allowed: false'));

console.log('Founder Admin Agent executable policy smoke: PASS');
