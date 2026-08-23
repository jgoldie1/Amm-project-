'use strict';

const assert=require('assert');
const {FLOW,capabilitySnapshot}=require('../lib/release-flow-routes');

const report=capabilitySnapshot();
assert.strictEqual(report.ok,true);
assert.strictEqual(FLOW.length,15);
assert.strictEqual(report.gates.length,15);
for(const gate of report.gates){
  assert.ok(gate.id);
  assert.ok(gate.label);
  assert.ok(['READY_FOR_LIVE_PROOF','BLOCKED_CONFIGURATION','MISSING_IMPLEMENTATION'].includes(gate.state));
}
assert.ok(report.gates.find(x=>x.id==='sign_in').implemented);
assert.ok(report.gates.find(x=>x.id==='server_verification').implemented);
assert.ok(report.gates.find(x=>x.id==='payable_balance').implemented);
assert.strictEqual(report.productionGreen,false);
assert.ok(report.greenRule.includes('live authenticated end-to-end proof'));
console.log('release-flow-smoke: ok',report.counts);
