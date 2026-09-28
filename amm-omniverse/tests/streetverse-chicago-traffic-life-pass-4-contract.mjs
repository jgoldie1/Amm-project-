import assert from 'node:assert/strict'
import fs from 'node:fs'

const world=fs.readFileSync(new URL('../src/components/StreetVerseMobileWorld.tsx',import.meta.url),'utf8')
const traffic=fs.readFileSync(new URL('../src/runtime/StreetVerseChicagoTrafficLifeRuntime.ts',import.meta.url),'utf8')

assert.match(world,/createStreetVerseChicagoTrafficLife/)
assert.match(world,/trafficLife\.tick\(now\)/)
assert.match(world,/trafficLife\.getTrafficMultiplier/)
assert.match(world,/trafficLife\.dispose\(\)/)
assert.match(world,/trafficLifeDensity:'chicago-traffic-v1'/)
assert.match(world,/trafficObeysSignals:true/)
assert.match(world,/trafficDirection/)
assert.match(world,/trafficSpeed/)
assert.match(world,/signalMultiplier/)
assert.doesNotMatch(world,/const travel=-84\+/)

assert.match(traffic,/streetverse-mobile-traffic-signal-poles/)
assert.match(traffic,/streetverse-mobile-traffic-signal-heads/)
assert.match(traffic,/SIGNAL_CYCLE_SECONDS=24/)
assert.match(traffic,/getTrafficMultiplier/)
assert.match(traffic,/nextIntersectionDistance/)
assert.match(traffic,/horizontal:xState,vertical:zState/)
assert.match(traffic,/trafficObeysSignals:true/)
assert.match(traffic,/new THREE\.InstancedMesh/)

console.log('StreetVerse Chicago traffic-life pass 4 contract: PASS')
