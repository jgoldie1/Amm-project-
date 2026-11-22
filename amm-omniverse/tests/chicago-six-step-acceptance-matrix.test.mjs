import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import ts from 'typescript'
const src=fs.readFileSync(new URL('../src/foundation/chicagoHoloJourneyEvidence.ts',import.meta.url),'utf8')
const js=ts.transpileModule(src,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText
const {assessChicagoJourney,JOURNEY_STEPS,STEP_LABELS}=await import('data:text/javascript;base64,'+Buffer.from(js).toString('base64'))
const date='2026-11-22T13:00:00Z'
const sample=JOURNEY_STEPS.map((step,i)=>({step,status:'verified',source:`signed-test-adapter-${i}`,checkedAt:date,reference:`contract-fixture-${i}`}))
for(const step of JOURNEY_STEPS){
 test(`6-step Chicago handoff fails when ${step} has no verified evidence`,()=>{
  const evidence=sample.filter(x=>x.step!==step)
  const result=assessChicagoJourney(evidence)
  assert.equal(result.passed,5)
  assert.equal(result.canClaimComplete,false)
  assert.ok(result.pending.includes(step))
 })
}
test('blocked approval or unlicensed 3D never becomes green',()=>{
 const evidence=sample.map(x=>x.step==='gallery'?{...x,status:'blocked'}:x)
 const status=assessChicagoJourney(evidence)
 assert.equal(status.canClaimComplete,false)
 assert.deepEqual(status.blocked,['gallery'])
})
test('provider order/tracking events require references, not UI clickthrough',()=>{
 for(const step of ['order','delivery']){
  const evidence=sample.map(x=>x.step===step?{...x,reference:null}:x)
  assert.equal(assessChicagoJourney(evidence).canClaimComplete,false)
 }
})
test('all labels present and no duplicate steps',()=>{
 assert.equal(new Set(JOURNEY_STEPS).size,6)
 assert.deepEqual(Object.keys(STEP_LABELS).sort(),[...JOURNEY_STEPS].sort())
})
