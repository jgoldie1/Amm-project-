'use strict';
const assert=require('assert');
const {control,getCapability,productionFreeze,prioritizeWork,canStartWork,nextCriticalPath,velocitySummary}=require('../lib/velocity-planner');
assert.strictEqual(control.mode,'release-critical-path-first');
assert.strictEqual(getCapability('chicago-77-registry').status,'LIVE');
assert.strictEqual(productionFreeze({productionHealthy:false}),true);
assert.strictEqual(productionFreeze({productionHealthy:true,releaseBlocked:false}),false);
const frozen=prioritizeWork([
  {id:'feature',kind:'feature',priority:1},
  {id:'rollback',kind:'rollback',priority:99},
  {id:'critical',kind:'feature',productionCritical:true,priority:5}
],{productionHealthy:false});
assert.deepStrictEqual(frozen.map(item=>item.id),['critical','rollback']);
const wip=canStartWork([
  {productionCritical:true},{productionCritical:true},{productionCritical:true}
],{productionCritical:true});
assert.strictEqual(wip.allowed,false);
assert.strictEqual(nextCriticalPath(['CI_GREEN','DEPLOYMENT_READY']),'APP_SHELL_HEALTHY');
const summary=velocitySummary();
assert(summary.statusCounts.LIVE>=4);
assert(summary.statusCounts.BUILDING>=1);
console.log('Velocity control plane critical path, freeze, WIP and capability checks passed');
