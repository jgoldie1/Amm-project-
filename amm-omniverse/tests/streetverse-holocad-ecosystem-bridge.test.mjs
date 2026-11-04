import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import {
 createHoloCADResearchResult,parseHoloCADResearchEvent,
 appendHoloCADResearchHistory,HOLOCAD_RESEARCH_HISTORY_LIMIT,
 HOLOCAD_RESEARCH_EVENT
} from '../src/game/holocad/holocadResearchBridge.ts'
import {TRYAMM_ECOSYSTEM_REPOS,TRYAMM_INTEGRATION_RELEASE_GATES} from '../src/game/holocad/tryammEcosystemRegistry.ts'

const load=path=>fs.readFileSync(new URL(path,import.meta.url),'utf8')
test('HoloCAD research bridge accepts only bounded non-authoritative educational results',()=>{
 const q=createHoloCADResearchResult({
  kind:'quantum-circuit',subject:'satellite',experiment:'bell',
  summary:'2 simulated qubits, 100 shots',now:1_000
 })
 assert.equal(q.source,'holocad-quantum')
 assert.equal(q.authority,'simulation-only')
 assert.equal(q.physicalQuantumHardware,false)
 assert.equal(q.hardwareConnected,false)
 assert.equal(q.rewardEligible,false)
 assert.equal(q.recordedAtMs,1000)
 assert.deepEqual(parseHoloCADResearchEvent(q),q)
 assert.equal(HOLOCAD_RESEARCH_EVENT,'tryamm:holocad-research-result')
 const invalids=[
  {...q,rewardEligible:true},
  {...q,hardwareConnected:true},
  {...q,physicalQuantumHardware:true},
  {...q,source:'remote-thirdparty'},
  {...q,authority:'production-authoritative'},
  {...q,kind:'wallet-payment'},
  {...q,subject:'unknown-device'},
  {...q,schemaVersion:2},
  {...q,experiment:'../invalid'},
  {...q,summary:'a'.repeat(181)},
  {...q,recordedAtMs:NaN},
  {...q,privateToken:'do-not-use',hardwareConnected:true},
  null,[],{},
 ]
 for(const bad of invalids)assert.equal(parseHoloCADResearchEvent(bad),null,'Untrusted result accepted')
})
test('HoloCAD research events are capped to 20 session-only records',()=>{
 let history=[]
 for(let i=0;i<50;i++){
  history=appendHoloCADResearchHistory(history,createHoloCADResearchResult({
   kind:'classical-physics',subject:'rover',
   experiment:'static-balance',summary:'Sample calculation '+i,now:1000+i
  }))
 }
 assert.equal(HOLOCAD_RESEARCH_HISTORY_LIMIT,20)
 assert.equal(history.length,20)
 assert.equal(history[0].recordedAtMs,1049)
 assert.equal(history[19].recordedAtMs,1030)
 assert.equal(appendHoloCADResearchHistory(history,{authority:'live-payment'}).length,20)
})
test('all 20 repository references are unique and connection states are explicit',()=>{
 assert.equal(TRYAMM_ECOSYSTEM_REPOS.length,20)
 assert.equal(new Set(TRYAMM_ECOSYSTEM_REPOS.map(x=>x.name)).size,20)
 assert.ok(TRYAMM_ECOSYSTEM_REPOS.some(x=>x.name==='Amm-project-'&&x.connection==='local'))
 assert.ok(TRYAMM_ECOSYSTEM_REPOS.some(x=>x.name==='omnicare-route-fix'&&x.connection==='security-review'))
 assert.ok(TRYAMM_ECOSYSTEM_REPOS.some(x=>x.name==='Sculptify-Wellness-Hub'&&x.connection==='manual'))
 for(const repo of TRYAMM_ECOSYSTEM_REPOS){
  assert.ok(repo.url==='https://github.com/jgoldie1/'+repo.name)
  assert.notEqual(repo.connection,'production-connected')
 }
 assert.equal(TRYAMM_INTEGRATION_RELEASE_GATES.productionUntouched,true)
 assert.equal(TRYAMM_INTEGRATION_RELEASE_GATES.livePaymentsWired,false)
 assert.equal(TRYAMM_INTEGRATION_RELEASE_GATES.externalRepoAPIsVerified,false)
 assert.equal(TRYAMM_INTEGRATION_RELEASE_GATES.realCustomerDataConnected,false)
})
test('event producers and parent listener integrate without external network or rewards',()=>{
 const viewer=load('../src/components/StreetVerseHoloCADLivingSystemsLab.tsx')
 const quantum=load('../src/components/HoloCADQuantumSandboxPanel.tsx')
 const physics=load('../src/components/HoloCADPhysicsSandboxPanel.tsx')
 const glb=load('../src/components/HoloCADGLBAssetInspector.tsx')
 const hub=load('../src/components/HoloCADEcosystemIntegrationHub.tsx')
 const bridge=load('../src/game/holocad/holocadResearchBridge.ts')
 for(const panel of [quantum,physics,glb]){
  assert.ok(panel.includes('publishHoloCADResearchResult(createHoloCADResearchResult('))
  assert.equal(panel.includes("tryamm:streetverse-mission-complete"),false)
  assert.equal(panel.includes('stripe.checkout'),false)
 }
 for(const tag of [
  'HOLOCAD_RESEARCH_EVENT,onResult',
  'appendHoloCADResearchHistory(history,detail)',
  '<HoloCADEcosystemIntegrationHub records={researchRuns}',
  '<HoloCADGLBAssetInspector subject={subject}',
  'educationalResearchEvents:researchRuns',
  '🧩 INTEGRATION HUB'
 ])assert.ok(viewer.includes(tag),'Missing working parent integration '+tag)
 for(const tag of ['EXPORT DEVELOPMENT HANDOFF','SHOW REPO INVENTORY','TRYAMM_ECOSYSTEM_REPOS','CLEAR LOCAL RUNS'])assert.ok(hub.includes(tag))
 for(const forbidden of ['fetch(', 'localStorage','navigator.serial','navigator.usb','payment-intent']){
  assert.equal(bridge.includes(forbidden),false)
 }
})
