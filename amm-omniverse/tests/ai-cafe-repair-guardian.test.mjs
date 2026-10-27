import test from 'node:test'
import assert from 'node:assert/strict'
import {evaluateRepairEvidence,REPAIR_GUARDIAN_LIMITS} from '../api/_lib/ai-cafe-repair-guardian.js'
const base={area:'assets',phase:'red',branch:'fix/npc-render',changedFiles:['amm-omniverse/src/runtime/NPC.ts'],failingTests:['npc-load'],passingTests:[],ciPassed:false,securityPassed:false,mobileProofPassed:false,humanApproved:false}
test('red fails first and may only advance to green in isolation',()=>{
 assert.deepEqual(evaluateRepairEvidence(base),{approved:true,next:'green',errors:[]})
 assert.equal(evaluateRepairEvidence({...base,failingTests:[]}).approved,false)
})
test('green requires the actual failing test to pass',()=>{
 assert.ok(evaluateRepairEvidence({...base,phase:'green',passingTests:['npc-load']}).approved)
 assert.equal(evaluateRepairEvidence({...base,phase:'green'}).next,'blocked')
})
test('review requires CI, security, mobile and explicit human approval',()=>{
 const review={...base,phase:'review',passingTests:['npc-load'],ciPassed:true,securityPassed:true,mobileProofPassed:true}
 assert.equal(evaluateRepairEvidence(review).next,'blocked')
 assert.equal(evaluateRepairEvidence({...review,humanApproved:true}).next,'staging_only')
})
test('blocks production branch, privileged changes and dangerous paths',()=>{
 assert.equal(evaluateRepairEvidence({...base,branch:'main'}).approved,false)
 assert.equal(evaluateRepairEvidence({...base,changedFiles:['.github/workflows/deploy.yml']}).approved,false)
 assert.equal(evaluateRepairEvidence({...base,changedFiles:['../secrets']}).approved,false)
 assert.equal(REPAIR_GUARDIAN_LIMITS.liveDeploy,false)
 assert.equal(REPAIR_GUARDIAN_LIMITS.autoMerge,false)
})
