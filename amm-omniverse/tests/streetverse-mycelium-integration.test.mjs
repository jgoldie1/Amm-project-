import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import ts from 'typescript'
import {buildCityPlan} from '../api/_lib/ai-cafe-city-plan.js'
const loadTs=async file=>{
 const source=readFileSync(new URL(file,import.meta.url),'utf8')
 const compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText
 return import('data:text/javascript;base64,'+Buffer.from(compiled).toString('base64'))
}
const generator=await loadTs('../src/data/StreetVerseLivingCityGenerator.ts')
const mycelium=await loadTs('../src/runtime/StreetVerseMyceliumNetwork.ts')
const timelineModule=await loadTs('../src/runtime/StreetVerseMyceliumTimelineRuntime.ts')
test('every city produces stable, valid roads, bridges, transit, buildings and welcome mission',()=>{
 assert.ok(generator.STREETVERSE_STARTER_CITIES.length>=14)
 for(const city of generator.STREETVERSE_STARTER_CITIES){
  const one=generator.generateStarterDistrict(city.id)
  const two=generator.generateStarterDistrict(city.id)
  assert.deepEqual(one,two)
  assert.deepEqual(generator.validateStarterDistrict(one),[])
  for(const kind of ['road','bridge','transit','building','mission'])assert.ok(one.features.some(f=>f.type===kind),city.id+': '+kind)
 }
})
test('Mycelium fans out once per unique event, resists cycles and duplicate delivery',()=>{
 const network=mycelium.createStreetVerseMyceliumNetwork()
 const event={id:'mission:chicago:0001',kind:'mission-complete',cityId:'chicago',source:'streetverse',payload:{xp:5}}
 const result=network.publish(event)
 assert.equal(result.duplicate,false)
 assert.equal(result.effects,'simulation-only')
 assert.equal(result.delivered.length,8)
 assert.equal(network.publish(event).duplicate,true)
 assert.equal(network.receipts().length,1)
 assert.throws(()=>network.publish({...event,id:'not valid'}))
})
test('Mycelium local simulation receipt survives network rebuild without double delivery',()=>{
 const disk=new Map()
 const prior=globalThis.localStorage
 globalThis.localStorage={getItem:k=>disk.get(k)||null,setItem:(k,v)=>disk.set(k,v)}
 try{
  const event={id:'district-preview:chicago:1',kind:'district-preview',cityId:'chicago',source:'streetverse',payload:{features:4}}
  assert.equal(mycelium.createStreetVerseMyceliumNetwork({persistLocal:true}).publish(event).duplicate,false)
  const next=mycelium.createStreetVerseMyceliumNetwork({persistLocal:true})
  assert.equal(next.publish(event).duplicate,true)
  assert.equal(next.receipts().length,1)
 }finally{if(prior===undefined)delete globalThis.localStorage;else globalThis.localStorage=prior}
})
test('Recovered Mycelium timeline keeps forked world history separate',()=>{
 const timeline=timelineModule.createMyceliumTimeline('streetverse:chicago')
 assert.equal(timeline.record({id:'e1',kind:'district-preview',payload:{city:'chicago'},at:1}),true)
 assert.equal(timeline.record({id:'e1',kind:'district-preview',payload:{city:'chicago'},at:1}),false)
 timeline.fork('pocket:1','pocket-dimension',2)
 timeline.travel('pocket:1')
 assert.equal(timeline.history().length,1)
 assert.equal(timeline.record({id:'e2',kind:'arrival',payload:{},at:3}),true)
 assert.equal(timeline.history().length,2)
 timeline.travel('streetverse:chicago')
 assert.equal(timeline.history().length,1)
})
test('existing AI Café backend accepts only a nonpublishing, cost-free city plan',()=>{
 const result=buildCityPlan({cityId:'sv-us-chicago',district:'Circle Park / Taylor Street',assets:[],publish:false,allowPaidGeneration:false})
 assert.equal(result.plan.release.playable,false)
 assert.equal(result.plan.publish,false)
 assert.equal(result.externalCostUsd,0)
 assert.ok(result.sha256)
 assert.throws(()=>buildCityPlan({cityId:'sv-us-chicago',publish:true}))
})
test('frontend button is connected to backend, AI Café and world builder, without auto-publish',()=>{
 const panel=readFileSync(new URL('../src/components/StreetVerseMyceliumSubmissionPanel.tsx',import.meta.url),'utf8')
 const builder=readFileSync(new URL('../src/components/StreetVerseWestSideWorldBuilder.tsx',import.meta.url),'utf8')
 const runner=readFileSync(new URL('../src/runtime/StreetVerseOneButtonSubmissionTest.ts',import.meta.url),'utf8')
 assert.match(panel,/BUILD VISIBLE CHICAGO \+ TEST CONNECTIONS/)
 assert.match(panel,/tryamm:streetverse-forge-placement-request/)
 assert.match(panel,/tryamm:open-hologpt/)
 assert.match(panel,/tryamm:open-middleverse-ai/)
 assert.match(builder,/<StreetVerseMyceliumSubmissionPanel\s*\/>/)
 assert.match(runner,/\/api\/agents\/jobs/)
 assert.match(runner,/tryamm:ai-cafe-task/)
 assert.match(runner,/tryamm:streetverse-district-preview/)
 assert.match(runner,/publish:false,allowPaidGeneration:false/)
})
