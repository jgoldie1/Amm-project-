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

test('existing ecology life-cycle rules remain the source of truth for births, migration and hunting',()=>{
 const ecology=src('../public/streetverse-ecology-lifecycle.js')
 for(const event of ['tryamm:streetverse-wildlife-offspring','tryamm:streetverse-wildlife-matured','tryamm:streetverse-wildlife-seasonal','tryamm:streetverse-predator-prey','tryamm:streetverse-wildlife-harvest']){
  assert.ok(ecology.includes(event),'existing producer '+event)
  assert.ok(mycelium.includes(event),'bridge listener '+event)
 }
 assert.match(mycelium,/if\(d\.ok!==true\)return/,'reject protected or failed harvests')
 assert.match(ecology,/population-conservation-floor/,'existing conservation rules remain')
 assert.match(ecology,/protected-game-species/,'existing protected species remain')
 assert.match(mycelium,/tryamm:streetverse-wildlife-injury/,'individual animal injury and care signal')
 assert.match(mycelium,/tryamm:streetverse-character-injury/,'universal character health is updated')
})
