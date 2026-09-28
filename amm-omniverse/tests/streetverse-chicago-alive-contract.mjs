import assert from 'node:assert/strict'
import fs from 'node:fs'

const world=fs.readFileSync(new URL('../src/components/StreetVerseMobileWorld.tsx',import.meta.url),'utf8')
const alive=fs.readFileSync(new URL('../src/runtime/StreetVerseChicagoAliveMobileRuntime.ts',import.meta.url),'utf8')

assert.match(world,/createStreetVerseChicagoAliveMobile/)
assert.match(world,/alive\.tick\(now\)/)
assert.match(world,/alive\.dispose\(\)/)
assert.match(world,/aliveDensity:'alive-v1'/)
assert.match(world,/visualDensity:'chicago-visual-v2'/)
assert.match(world,/camY=activeCar\?8\.2:9\.2/)
assert.match(alive,/new THREE\.InstancedMesh/)
assert.match(alive,/ambientResidents:crowdCount/)
assert.match(alive,/parkedVehicles:parkedPositions\.length/)
assert.match(alive,/storefronts:blockCenters\.length/)
assert.match(alive,/crosswalkStripes:stripeIndex/)
assert.match(alive,/streetverse-chicago-alive-mobile/)
assert.doesNotMatch(world,/renderer\.shadowMap\.enabled=true/)

console.log('StreetVerse Chicago Alive mobile contract: PASS')
