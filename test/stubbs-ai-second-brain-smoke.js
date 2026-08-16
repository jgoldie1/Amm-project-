'use strict';
const assert=require('assert');
const {createBrainResult,compareBrains,critique,verificationGate,buildDoublePassPlan}=require('../lib/stubbs-ai-second-brain');

const a=createBrainResult({brainId:'primary',answer:{value:42},confidence:.91,evidenceIds:['e1','e2']});
const b=createBrainResult({brainId:'secondary',answer:{value:42},confidence:.89,evidenceIds:['e1','e2']});
const cmp=compareBrains(a,b);
assert.equal(cmp.status,'agree');
assert.ok(cmp.agreement>=.85);

const good=verificationGate({primary:a,secondary:b,sandboxResult:{status:'pass',changedState:false},externalEvidenceIds:['e3'],actionRisk:'high'});
assert.equal(good.accepted,true);
assert.equal(good.requiresHumanApproval,true);

const c=createBrainResult({brainId:'secondary',answer:{value:41},confidence:.55,evidenceIds:['e9']});
const badCmp=compareBrains(a,c);
assert.notEqual(badCmp.status,'agree');
const crit=critique(a,c);
assert.equal(crit.requiresRepair,true);

const blocked=verificationGate({primary:a,secondary:c,sandboxResult:{status:'fail',changedState:true},externalEvidenceIds:[],actionRisk:'critical'});
assert.equal(blocked.accepted,false);
assert.equal(blocked.rollbackRequired,true);
assert.ok(blocked.reasons.includes('sandbox-not-passed'));
assert.ok(blocked.reasons.includes('high-risk-needs-independent-evidence'));

const plan=buildDoublePassPlan({id:'t1'},{risk:'high'});
assert.equal(plan.taskId,'t1');
assert.ok(plan.stages.includes('second-brain-independent-solve'));
assert.ok(plan.rules.some(x=>x.includes('Agreement is not proof')));

console.log('Stubbs AI Second Brain smoke: PASS');
