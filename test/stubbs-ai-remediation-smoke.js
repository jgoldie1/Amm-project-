'use strict';
const assert=require('assert');
const {AREAS,extraBudget,evaluateArea,evaluateQualification,makeRepairPlan,postActionVerification,evidenceDecision}=require('../lib/stubbs-ai-remediation');

assert.equal(extraBudget(.89,.90),.20);
assert.equal(extraBudget(.80,.90),.30);
assert.equal(extraBudget(.70,.90),.40);
assert.equal(extraBudget(.40,.90),.50);

for(const [name,spec] of Object.entries(AREAS)){
  const passing=spec.probes.map(probe=>({probe,status:'pass',score:spec.target,evidenceIds:[`e:${name}:${probe}`]}));
  const result=evaluateArea(name,passing);
  assert.equal(result.passed,true,`${name} should pass with complete evidence`);
}

const incomplete=evaluateQualification({});
assert.equal(incomplete.qualified,false);
assert.equal(incomplete.readyForHiddenSuite,false);
assert.ok(makeRepairPlan(incomplete).length>0);

assert.deepEqual(evidenceDecision({type:'fact',evidenceIds:[]}).allowed,false);
assert.deepEqual(evidenceDecision({type:'fact',evidenceIds:['s1'],timeSensitive:true,fresh:false}).allowed,false);
assert.deepEqual(evidenceDecision({type:'fact',evidenceIds:['s1'],fresh:true}).allowed,true);

assert.equal(postActionVerification({kind:'deploy'}).ok,false);
assert.equal(postActionVerification({kind:'deploy',toolResponse:{ok:true},verificationEvidence:'status:ready'}).ok,true);

const complete={};
for(const [name,spec] of Object.entries(AREAS)) complete[name]=spec.probes.map(probe=>({probe,status:'pass',score:Math.min(1,spec.target+.01),evidenceIds:['verified']}));
const ready=evaluateQualification(complete);
assert.equal(ready.readyForHiddenSuite,true);
assert.equal(ready.qualified,false,'public AGI qualification must never be granted by remediation smoke tests');

console.log('Stubbs AI remediation smoke: PASS');
