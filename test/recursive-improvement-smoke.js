'use strict';

const assert=require('assert');
const ri=require('../lib/recursive-improvement-engine');

assert.strictEqual(ri.improvementPolicy().productionSelfRewrite,false);
assert.strictEqual(ri.improvementPolicy().sandboxRequiredForCode,true);
assert.ok(ri.powerUps().stubbs_ai);
assert.ok(ri.powerUps().hologpt);
assert.ok(ri.powerUps().middleverse_ai);
assert.strictEqual(ri.classifyRisk({targets:['payment-ledger']}),'critical');
assert.strictEqual(ri.classifyRisk({changesCode:true}),'medium');
assert.strictEqual(ri.classifyRisk({highImpact:true}),'high');
assert.strictEqual(ri.scoreCandidate({baseline:{quality:50,reliability:50,latency:50,accessibility:50,safety:50,revenue:50},candidate:{quality:60,reliability:60,latency:60,accessibility:60,safety:60,revenue:60}}),10);

const task=ri.buildImprovementTask({
  objective:'Improve HoloGPT workflow completion',
  agent:'hologpt',
  changesCode:true,
  baseline:{quality:60,reliability:60},
  candidate:{quality:70,reliability:70}
});
assert.strictEqual(task.type,'coding');
assert.strictEqual(task.actionRisk,'medium');
assert.ok(task.sandboxChecks.includes('rollback-plan'));
assert.strictEqual(task.context.agent,'hologpt');

console.log('recursive-improvement-smoke: ok');
