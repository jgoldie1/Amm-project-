import assert from 'node:assert/strict'
import fs from 'node:fs'

const world=fs.readFileSync(new URL('../src/components/StreetVerseMobileWorld.tsx',import.meta.url),'utf8')
const identity=fs.readFileSync(new URL('../src/runtime/StreetVerseChicagoIdentityInteractionRuntime.ts',import.meta.url),'utf8')

assert.match(world,/createStreetVerseChicagoIdentityInteraction/)
assert.match(world,/identityInteraction\.getNearestInteraction/)
assert.match(world,/identityInteraction\.activate/)
assert.match(world,/identityInteraction\.dispose\(\)/)
assert.match(world,/interactionPrompt&&<button/)
assert.match(world,/activateContextPrompt/)
assert.match(world,/ENTER VEHICLE/)
assert.match(world,/EXIT VEHICLE/)
assert.match(world,/contextualInteraction:true/)
assert.match(world,/chicagoIdentityPass:'v5'/)
assert.match(world,/interactionTargetCount:identityInteraction\.counts\.interactionTargets/)

for(const label of ['THE LOOP','CHICAGO RIVER','NORTH SIDE','SOUTH SIDE','LAKEFRONT']){
  assert.ok(identity.includes(label),'missing Chicago identity label: '+label)
}
for(const action of ['START MISSION','SHOP','EXPLORE','RIDE CTA','TALK']){
  assert.ok(identity.includes(action),'missing contextual action: '+action)
}
for(const event of [
  'tryamm:streetverse-mission-open',
  'tryamm:streetverse-commerce-open',
  'tryamm:streetverse-discover',
  'tryamm:streetverse-transit-board',
  'tryamm:streetverse-npc-dialogue',
  'tryamm:streetverse-context-interaction',
]){
  assert.ok(identity.includes(event),'missing interaction event: '+event)
}

assert.match(identity,/streetverse-chicago-district-labels/)
assert.match(identity,/streetverse-chicago-cta-identity/)
assert.match(identity,/streetverse-chicago-lakefront-identity/)
assert.match(identity,/streetverse-mobile-lakefront-bollards/)
assert.match(identity,/streetverse-chicago-neighborhood-identity/)
assert.match(identity,/new THREE\.Sprite/)
assert.match(identity,/new THREE\.InstancedMesh/)
assert.match(identity,/getNearestInteraction/)
assert.match(identity,/Math\.hypot/)
assert.match(identity,/proximityInteraction:true/)

console.log('StreetVerse Chicago identity + contextual interaction pass 5 contract: PASS')
