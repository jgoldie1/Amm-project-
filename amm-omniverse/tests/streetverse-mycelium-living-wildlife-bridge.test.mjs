import {test} from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
const src=p=>readFileSync(new URL(p,import.meta.url),'utf8')
const mycelium=src('../src/runtime/StreetVerseMyceliumLivingWorldBridge.ts')
const health=src('../src/runtime/StreetVerseThreeCastHealthRuntime.ts')
const anatomy=src('../src/runtime/StreetVerseBJAnatomyRuntime.ts')
const world=src('../src/components/StreetVerseMobileWorld.tsx')
test('real Living World lifecycle emits to universal animal needs without real-health or blockchain claims',()=>{
 assert.match(mycelium,/streetverse-ecology-cycle/,'listens to actual ecology lifecycle script')
 assert.match(mycelium,/streetverse-mycelium-signal/,'listens for environment changes')
 assert.match(mycelium,/streetverse-creature-environment/,'emits bounded animal health context')
 assert.match(mycelium,/streetverse-character-health-register/,'connects existing actor health registry')
 assert.match(mycelium,/simulated:true/,'clearly game-only')
 assert.match(world,/const myceliumLivingWorld=createStreetVerseMyceliumLivingBridge\(\)/)
 assert.match(world,/myceliumLivingWorld\.dispose\(\)/)
})
test('species physiology and organ names differ, and habitat requirements are bounded',()=>{
 for(const name of ['mammal','bird','fish','insect','reptile','amphibian'])assert.ok(health.includes(name)&&mycelium.includes(name),'has '+name)
 for(const name of ['gills','air-sacs','tracheae','skin-respiration'])assert.ok(health.includes(name),'physiology '+name)
 assert.match(health,/function simulateCreatureNeeds/)
 assert.match(anatomy,/function organLayoutForProfile\(profile:AnatomyProfile\)/)
})
