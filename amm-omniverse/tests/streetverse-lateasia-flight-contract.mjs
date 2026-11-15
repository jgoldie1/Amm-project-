import assert from 'node:assert/strict'
import fs from 'node:fs'
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8')
const flight=read('src/lib/streetverseLaTeasiaFlight.ts')
const npc=read('src/components/StreetVerseLaTeasiaAnimatedNpc.tsx')
const starter=read('src/components/StreetVerseLaTeasiaTreasureStarter.tsx')
for(const token of ['FLIGHT_MAX_ALTITUDE=12','FLIGHT_MAX_RADIUS=18','FLIGHT_ENERGY_SECONDS=45','stepLaTeasiaFlight','startLaTeasiaFlight','rechargeLaTeasiaFlight'])assert.ok(flight.includes(token),token)
assert.match(flight,/Math\.hypot\(x,z\)/)
assert.match(npc,/group\.current\.position\.set/)
assert.match(npc,/FLIGHT_STATUS_EVENT/)
assert.match(starter,/flight direction controls/)
assert.match(starter,/RECHARGE/)
assert.match(starter,/LAND \/ STOP HOVER/)
console.log('LaTeasia flight controls static contract PASS')
