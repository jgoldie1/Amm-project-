import assert from 'node:assert/strict'
import {test} from 'node:test'
import fs from 'node:fs'
import {build} from 'esbuild'

const out=await build({entryPoints:[new URL('../src/runtime/GreenvilleCampusLivingMemory.ts',import.meta.url).pathname],bundle:true,platform:'node',format:'esm',write:false,logLevel:'silent'})
const api=await import('data:text/javascript;base64,'+Buffer.from(out.outputFiles[0].text).toString('base64'))
const {
 GREENVILLE_MEMORY_HUBS,initialGreenvilleCampusLivingMemory,
 chooseGreenvilleCampusAction,greenvilleCampusXp,greenvilleCampusReputation,
 greenvilleCampusGreeting,serializeGreenvilleCampusLivingMemory,readGreenvilleCampusLivingMemory,
}=api

test('five original Greenville hubs, zero simulated impact at start',()=>{
 assert.deepEqual(GREENVILLE_MEMORY_HUBS.map(h=>h.id),['student-union','hogue-lawn','burritt-hall','blankenship-tower','scott-field'])
 const fresh=initialGreenvilleCampusLivingMemory()
 assert.deepEqual(fresh.entries,[])
 assert.equal(greenvilleCampusXp(fresh),0)
 assert.equal(greenvilleCampusReputation(fresh),0)
})

test('player chooses HELP at Student Union, creates a persistent visible impact and remembered greeting',()=>{
 const initial=initialGreenvilleCampusLivingMemory()
 const chosen=chooseGreenvilleCampusAction(initial,'student-union','help')
 assert.equal(chosen.ok,true)
 assert.equal(greenvilleCampusXp(chosen.state),25)
 assert.equal(greenvilleCampusReputation(chosen.state),1)
 assert.deepEqual(chosen.state.entries,[{hubId:'student-union',choice:'help'}])
 assert.match(greenvilleCampusGreeting(chosen.state,'student-union'),/recognize Jacobie/i)
 const persisted=readGreenvilleCampusLivingMemory(serializeGreenvilleCampusLivingMemory(chosen.state))
 assert.deepEqual(persisted,chosen.state)
 const replay=chooseGreenvilleCampusAction(persisted,'student-union','create')
 assert.equal(replay.ok,false)
 assert.strictEqual(replay.state,persisted)
 assert.equal(greenvilleCampusXp(replay.state),25)
})

test('five independent physical hubs allow five choices but no unlimited point farming',()=>{
 let state=initialGreenvilleCampusLivingMemory()
 for(const [i,hub] of GREENVILLE_MEMORY_HUBS.entries()){
  const next=chooseGreenvilleCampusAction(state,hub.id,i%2?'learn':'create')
  assert.equal(next.ok,true)
  state=next.state
 }
 assert.equal(state.entries.length,5)
 assert.equal(greenvilleCampusXp(state),125)
 assert.equal(greenvilleCampusReputation(state),5)
 for(const hub of GREENVILLE_MEMORY_HUBS){
  const blocked=chooseGreenvilleCampusAction(state,hub.id,'help')
  assert.equal(blocked.ok,false)
  assert.strictEqual(blocked.state,state)
 }
})

test('reject unknown locations, choices, duplicates, oversized saves and tampered data',()=>{
 const fresh=initialGreenvilleCampusLivingMemory()
 assert.equal(chooseGreenvilleCampusAction(fresh,'invalid','help').ok,false)
 assert.equal(chooseGreenvilleCampusAction(fresh,'student-union','invalid').ok,false)
 for(const invalid of [
  'not json',
  JSON.stringify({version:2,entries:[]}),
  JSON.stringify({version:1,entries:[{hubId:'unknown',choice:'help'}]}),
  JSON.stringify({version:1,entries:[{hubId:'scott-field',choice:'help'},{hubId:'scott-field',choice:'help'}]}),
  JSON.stringify({version:1,entries:[{hubId:'hogue-lawn',choice:'cash'}]}),
  'x'.repeat(4100),
 ]){
  assert.deepEqual(readGreenvilleCampusLivingMemory(invalid),fresh)
 }
})

test('one-hand checkpoint UI changes the actual 3D world, without replacing dorms or avatar creator',()=>{
 const scene=fs.readFileSync(new URL('../src/components/GreenvilleCampusVerseScene.tsx',import.meta.url),'utf8')
 const world=fs.readFileSync(new URL('../src/components/GreenvilleWalkableCampus.tsx',import.meta.url),'utf8')
 assert.match(scene,/d<5&&!reached\.current\.has\(stop\.id\)/)
 assert.match(scene,/arrivedHubId===activeHub\.id/)
 assert.match(scene,/chooseGreenvilleCampusAction\(campusMemory,activeHub\.id,choice\)/)
 assert.match(scene,/setArrivedHubId\(stop\.id\)/)
 assert.match(scene,/serializeGreenvilleCampusLivingMemory\(campusMemory\)/)
 assert.match(scene,/memory=\{campusMemory\}/)
 assert.match(scene,/minHeight:48/)
 assert.match(scene,/aria-live="polite"/)
 assert.match(world,/name=\{'greenville-memory-'\+hub\.id\}/)
 assert.match(world,/visible=\{Boolean\(record\)\}/)
 assert.match(world,/memory\.entries\.find/)
 assert.match(world,/<Player move=\{move\} onPosition=\{onPosition\}\/>/)
})
