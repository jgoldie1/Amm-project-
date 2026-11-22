import assert from 'node:assert/strict'
import fs from 'node:fs'
import test from 'node:test'
import ts from 'typescript'
const src=fs.readFileSync(new URL('../src/foundation/chicagoHoloJourneyEvidence.ts',import.meta.url),'utf8')
const component=fs.readFileSync(new URL('../src/components/ChicagoHoloJourneyStatus.tsx',import.meta.url),'utf8')
const farm=fs.readFileSync(new URL('../src/components/FarmToFamilyPilot.tsx',import.meta.url),'utf8')
const home=fs.readFileSync(new URL('../src/components/TryAMMHome.tsx',import.meta.url),'utf8')
const js=ts.transpileModule(src,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText
const {assessChicagoJourney,emptyChicagoJourney,JOURNEY_STEPS}=await import('data:text/javascript;base64,'+Buffer.from(js).toString('base64'))
test('six-step journey fails closed without server evidence',()=>{
 const status=assessChicagoJourney(emptyChicagoJourney())
 assert.equal(status.passed,0)
 assert.equal(status.total,6)
 assert.equal(status.canClaimComplete,false)
})
test('incomplete and duplicate client claims do not count as verified',()=>{
 const date='2026-11-22T13:00:00Z'
 const evidence=[{step:'world',status:'verified',source:null,checkedAt:date,reference:'clicked'},{step:'world',status:'verified',source:'fake',checkedAt:date,reference:'clicked'}]
 assert.equal(assessChicagoJourney(evidence).passed,0)
 assert.equal(assessChicagoJourney(evidence).canClaimComplete,false)
})
test('only all six individually evidenced steps are considered complete',()=>{
 const all=JOURNEY_STEPS.map((step,index)=>({step,status:'verified',source:'provider-'+index,checkedAt:'2026-11-22T13:00:00Z',reference:'receipt-'+index}))
 assert.equal(assessChicagoJourney(all).canClaimComplete,true)
 assert.equal(assessChicagoJourney(all.slice(0,5)).canClaimComplete,false)
})
test('Middleverse and Stubbs AI entrypoints use existing action names',()=>{
 for(const key of ['__showMiddleverseWorkstation','__showBennie']){assert.ok(component.includes(key));assert.ok(home.includes(key))}
 assert.match(component,/integration_not_ready/)
 assert.match(component,/not allowed to grant supplier consent/)
 assert.match(farm,/<ChicagoHoloJourneyStatus\/>/)
})
