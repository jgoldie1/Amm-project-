import assert from 'node:assert/strict'
import fs from 'node:fs'

const world=fs.readFileSync(new URL('../src/components/StreetVerseMobileWorld.tsx',import.meta.url),'utf8')
const pedestrians=fs.readFileSync(new URL('../src/runtime/StreetVerseChicagoPedestrianRoutineRuntime.ts',import.meta.url),'utf8')

assert.match(world,/createStreetVerseChicagoPedestrianRoutines/)
assert.match(world,/pedestrianRoutines\.tick\(now\)/)
assert.match(world,/pedestrianRoutines\.dispose\(\)/)
assert.match(world,/pedestrianLifePass:'v6'/)
assert.match(world,/pedestriansObeySignals:true/)
assert.match(world,/crossingResidentCount:pedestrianRoutines\.counts\.crossingResidents/)
assert.match(world,/pedestrianWalkSignalCount:pedestrianRoutines\.counts\.walkSignals/)

for(const token of [
  'streetverse-mobile-crossing-resident-bodies',
  'streetverse-mobile-crossing-resident-heads',
  'streetverse-mobile-crossing-resident-parcels',
  'streetverse-mobile-pedestrian-walk-signals',
  'tryamm:streetverse-pedestrian-signal-state',
  'tryamm:streetverse-pedestrian-routine-state',
  'trafficSignalAware:true',
  'crosswalkAware:true',
]){
  assert.ok(pedestrians.includes(token),'missing pedestrian routine contract token: '+token)
}

for(const routine of ['commuter','shopper','delivery','visitor']){
  assert.ok(pedestrians.includes("'"+routine+"'"),'missing pedestrian routine type: '+routine)
}

assert.match(pedestrians,/getSignalState\(resident\.trafficAxis,nowMs\)==='red'/)
assert.match(pedestrians,/approachingCurb/)
assert.match(pedestrians,/resident\.inCrossing/)
assert.match(pedestrians,/mustWait/)
assert.match(pedestrians,/new THREE\.InstancedMesh/)
assert.match(pedestrians,/crossingResidents:residents\.length/)
assert.match(pedestrians,/signalizedCrossings:INTERSECTIONS\.length\*INTERSECTIONS\.length/)

console.log('StreetVerse Chicago pedestrian routines pass 6 contract: PASS')
