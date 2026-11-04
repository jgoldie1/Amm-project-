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
assert.match(mobile,/let activeCar:THREE\.(?:Mesh|Group)\|null=null/,
  'StreetVerseMobileWorld: mobile WebGL must control a real scene vehicle object, not only flip HUD state')
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


// Car-entry buttons must remain physically discoverable after the carousel is
// collapsed, and must drive the real vehicle controller instead of a no-op bus.
const carousel=read('../src/components/StreetVerseActionCarousel.tsx')
assert.match(carousel,/aria-label="Get in nearby car"/,
  'mobile car entry must be a named, touch-friendly action')
assert.match(carousel,/nearbyVehicle&&!inVehicle/,
  'car entry action must only be advertised when a nearby car is available on foot')
assert.match(carousel,/id==='enter'[\s\S]*?tryamm:streetverse-vehicle-interact/,
  'carousel ENTER must send a real vehicle-interact command')
assert.match(carousel,/entered:true,vehicleId,source:'action-carousel'/,
  'car entry must identify the nearby car and its source')
assert.match(carousel,/tryamm:streetverse-nearby-vehicle-request/,
  'carousel must recover proximity state after asynchronous mount')
assert.match(carousel,/zIndex:46050/,
  'expanded action carousel must be visible above fixed world controls')
assert.match(mobile,/const publishNearbyVehicle=/,
  'the playable 3D world must publish drivable nearby-car state')
assert.match(mobile,/tryamm:streetverse-nearby-vehicle-request/,
  'the world must answer a newly mounted action carousel')
assert.match(mobile,/const nearestCar=/,
  'the world must verify actual scene-car proximity before entry')

console.log(`StreetVerse vehicle control-loop contract: PASS (${worlds.length} playable worlds + iPhone-safe mission parity)`)
