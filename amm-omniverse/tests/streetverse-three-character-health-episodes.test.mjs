import assert from 'node:assert/strict'
import {test} from 'node:test'
import {build} from 'esbuild'
const out=await build({entryPoints:[new URL('../src/runtime/StreetVerseHealthEpisodeRuntime.ts',import.meta.url).pathname],bundle:true,platform:'node',format:'esm',write:false,logLevel:'silent'})
const m=await import('data:text/javascript;base64,'+Buffer.from(out.outputFiles[0].text).toString('base64'))
test('stroke on all three characters dispatches emergency response, never first-aid cure',()=>{
 for(const id of m.STREETVERSE_HEALTH_CHARACTERS){
  const first=m.advanceHealthEpisode(m.initialHealthEpisode(id),'stroke')
  assert.equal(first.state.characterId,id)
  assert.equal(first.state.condition,'stroke')
  assert.equal(first.state.emergency,true)
  assert.equal(first.dispatchEmergency,true)
  assert.equal(first.state.stage,'emergency-dispatched')
  assert.equal(m.advanceHealthEpisode(first.state,'first-aid').state.stage,'emergency-dispatched')
 }
})
test('severe allergy dispatches emergency; mild allergies do not',()=>{
 const initial=m.initialHealthEpisode('lateasia-monroe')
 const mild=m.advanceHealthEpisode(initial,'allergy')
 assert.equal(mild.dispatchEmergency,false)
 assert.equal(mild.state.stage,'symptoms')
 assert.equal(m.advanceHealthEpisode(mild.state,'first-aid').state.stage,'first-aid')
 const severe=m.advanceHealthEpisode(initial,'severe-allergy')
 assert.equal(severe.dispatchEmergency,true)
 assert.equal(severe.state.emergency,true)
 assert.equal(m.advanceHealthEpisode(severe.state,'first-aid').state.stage,'emergency-dispatched')
})
test('nosebleed first aid is distinct from an actual hospital discharge',()=>{
 const first=m.advanceHealthEpisode(m.initialHealthEpisode('jacobie-stubbs'),'nosebleed')
 assert.equal(first.state.emergency,false)
 assert.equal(first.state.stage,'symptoms')
 const firstAid=m.advanceHealthEpisode(first.state,'first-aid')
 assert.equal(firstAid.state.stage,'first-aid')
 assert.equal(firstAid.state.condition,'nosebleed')
 const hospital=m.advanceHealthEpisode(firstAid.state,'hospital-discharge')
 assert.equal(hospital.state.stage,'hospital-recovery')
})
test('corrupt saves reset, validated conditions persist for all three characters',()=>{
 const id='bj-stubbs'
 const stroke=m.advanceHealthEpisode(m.initialHealthEpisode(id),'stroke').state
 const all={...Object.fromEntries(m.STREETVERSE_HEALTH_CHARACTERS.map(x=>[x,m.initialHealthEpisode(x)])),[id]:stroke}
 assert.deepEqual(m.readHealthEpisodeSave(JSON.stringify(all))[id],stroke)
 assert.equal(m.readHealthEpisodeSave('{broken')[id].condition,null)
 assert.equal(m.readHealthEpisodeSave(JSON.stringify({[id]:{characterId:id,condition:'invented',stage:'healthy'}}))[id].condition,null)
})
