'use strict';
const assert=require('assert');
const {classifyRisk,spiderSense,secondBrainCritique,solarPlexusGuard,compareBrains,consensusGate,adaptiveIntelligenceBudget,systemBodyState}=require('../lib/stubbs-ai-tribrain');

assert.equal(classifyRisk(0),'GREEN');
assert.equal(classifyRisk(30),'YELLOW');
assert.equal(classifyRisk(60),'ORANGE');
assert.equal(classifyRisk(80),'RED');

const green=spiderSense({});
assert.equal(green.band,'GREEN');
const red=spiderSense({secretAccess:true,privilegeEscalation:true,promptInjection:true});
assert.equal(red.band,'RED');
assert.equal(red.action,'block-isolate-rollback');

assert.equal(secondBrainCritique({objective:'answer',type:'creative'}).passed,true);
assert.equal(secondBrainCritique({objective:'fresh fact',type:'fact',evidenceIds:[]}).passed,false);

const guardian=solarPlexusGuard({proposal:{objective:'deploy',type:'creative'},signals:{unexpectedPermission:.7}});
assert.equal(guardian.decision,'VERIFY');

assert.equal(compareBrains({answer:'A',decision:'ship'},{answer:'A',decision:'ship'}).agree,true);
assert.equal(compareBrains({answer:'A',decision:'ship'},{answer:'B',decision:'ship'}).agree,false);

const verified=consensusGate({
  primary:{answer:'A',decision:'ship',evidenceIds:['e1']},
  secondary:{answer:'A',decision:'ship',evidenceIds:['e1']},
  guardian:solarPlexusGuard({proposal:{objective:'safe',type:'creative'},signals:{}}),
  sandboxResult:{passed:true,evidenceIds:['s1']}
});
assert.equal(verified.accepted,true);

const blocked=consensusGate({
  primary:{answer:'A',decision:'ship'},secondary:{answer:'A',decision:'ship'},
  guardian:solarPlexusGuard({proposal:{objective:'x',type:'creative'},signals:{secretAccess:true,privilegeEscalation:true,promptInjection:true}})
});
assert.equal(blocked.status,'BLOCKED');

assert.ok(adaptiveIntelligenceBudget({score:.7,target:.9,complexity:1,riskBand:'ORANGE'})<=.5);
assert.equal(systemBodyState({cpu:0,memory:0,latency:0}).state,'GREEN');
assert.equal(systemBodyState({cpu:1,gpu:1,memory:1,latency:1,apiErrorRate:1,dbErrorRate:1,securityAlerts:1,agentFailureRate:1}).state,'RED');

console.log('Stubbs AI tri-brain smoke: PASS');
