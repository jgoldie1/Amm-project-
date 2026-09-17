import fs from 'node:fs';
import assert from 'node:assert/strict';

const source = fs.readFileSync(new URL('../src/runtime/FounderAdminAgent.ts', import.meta.url), 'utf8');

const automatic = ['INSPECT_STATUS', 'DIAGNOSE_FAILURE', 'RERUN_TEST', 'RETRY_HEALTH_CHECK'];
const approvalGated = ['DEPLOY_PRODUCTION', 'CHANGE_SECURITY', 'DELETE_DATA', 'MOVE_REAL_MONEY'];

for (const action of [...automatic, ...approvalGated]) {
  assert.ok(source.includes(action), `missing policy action ${action}`);
}

assert.ok(source.includes("risk: 'READ_ONLY'"));
assert.ok(source.includes("risk: 'LOW'"));
assert.ok(source.includes("risk: 'HIGH'"));
assert.ok(source.includes('requiresFounderApproval: true'));
assert.ok(source.includes('allowed: false'));

console.log('Founder Admin Agent policy smoke: PASS');
