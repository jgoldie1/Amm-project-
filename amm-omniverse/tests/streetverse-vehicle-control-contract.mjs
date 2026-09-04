import fs from 'node:fs'
import assert from 'node:assert/strict'

const read=p=>fs.readFileSync(new URL(p,import.meta.url),'utf8')
const worlds=['StreetVerseLivingWorld','StreetVerseMobileWorld','StreetVerseMobilePlayableWorld']

for(const name of worlds){
  const src=read(`../src/components/${name}.tsx`)
  assert.match(src,/addEventListener\(\s*['"]tryamm:streetverse-vehicle-interact['"]/,
    `${name}: ENTER/EXIT VEHICLE has no vehicle-interact listener`)
  assert.match(src,/tryamm:streetverse-vehicle-controlled/,
    `${name}: vehicle entry/exit is never confirmed with vehicle-controlled`)
}

const mobile=read('../src/components/StreetVerseMobileWorld.tsx')
assert.match(mobile,/let activeCar:THREE\.Mesh\|null=null/,
  'StreetVerseMobileWorld: mobile WebGL must control a real scene car, not only flip HUD state')
assert.match(mobile,/const nearestCar=/,
  'StreetVerseMobileWorld: ENTER VEHICLE must resolve a nearby scene vehicle')
assert.match(mobile,/activeCar\.position\.(?:x|z)/,
  'StreetVerseMobileWorld: drive loop must move the controlled scene vehicle')
assert.match(mobile,/c===activeCar\|\|c\.userData\.playerDrivable\|\|c\.userData\.userDriven/,
  'StreetVerseMobileWorld: player-controlled/parked cars must be removed from AI traffic motion')
assert.doesNotMatch(mobile,/carBody\.visible/,
  'StreetVerseMobileWorld: do not fake driving by attaching a costume car body to the avatar')

const safe=read('../src/components/StreetVerseMobilePlayableWorld.tsx')
assert.match(safe,/SAFE_CAR_ID=['"]safe-starter-car['"]/,
  'StreetVerseMobilePlayableWorld: iPhone-safe mode needs a persistent named drivable car')
assert.match(safe,/Math\.hypot\(p\.x-c\.x,p\.y-c\.y\)/,
  'StreetVerseMobilePlayableWorld: ENTER VEHICLE must measure distance to the parked car')
assert.match(safe,/if\(distance>10\)/,
  'StreetVerseMobilePlayableWorld: safe mode must reject entering a car from across the map')
assert.match(safe,/tryamm:streetverse-vehicle-denied/,
  'StreetVerseMobilePlayableWorld: failed safe-mode car entry must report vehicle-denied')
assert.match(safe,/carPosRef\.current=next/,
  'StreetVerseMobilePlayableWorld: the controlled safe-mode car must move with drive input')
assert.match(safe,/visitedRef\.current=next/,
  'StreetVerseMobilePlayableWorld: mission checkpoints must build persistent district progress')
assert.match(safe,/tryamm:streetverse-mission-complete/,
  'StreetVerseMobilePlayableWorld: 4\/4 safe-mode checkpoints must close the district mission loop')
assert.match(safe,/DISTRICT COMPLETE ✓/,
  'StreetVerseMobilePlayableWorld: safe-mode mission completion must be visibly confirmed')
assert.match(safe,/missionProgress:/,
  'StreetVerseMobilePlayableWorld: Reel launch should carry current mission progress')

const componentsDir=new URL('../src/components/',import.meta.url)
const exempt=new Set(['StreetVersePowersportRuntime.tsx'])
for(const file of fs.readdirSync(componentsDir)){
  if(!file.endsWith('.tsx')||exempt.has(file))continue
  const src=fs.readFileSync(new URL(file,componentsDir),'utf8')
  if(/addEventListener\(\s*['"]tryamm:streetverse-vehicle-input['"]/.test(src)){
    assert.match(src,/addEventListener\(\s*['"]tryamm:streetverse-vehicle-interact['"]/,
      `${file}: consumes vehicle-input but cannot consume ENTER/EXIT VEHICLE`)
  }
}

console.log(`StreetVerse vehicle control-loop contract: PASS (${worlds.length} playable worlds + iPhone-safe mission parity)`)
