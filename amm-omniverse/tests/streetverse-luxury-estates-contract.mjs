import assert from 'node:assert/strict'
import fs from 'node:fs'
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8')
const manager=read('src/components/StreetVerseLuxuryEstateManagement.tsx')
const chicago=read('src/components/StreetVerseChicagoJacobieGoldCoastMansion.tsx')
const world=read('src/components/StreetVerseNearWest3D.tsx')
const travel=read('src/components/StreetVerseTampaTravelDock.tsx')
for(const token of ['bathrooms:14','ensuites:12','powderRooms:2','housekeepers:4','butlers:2','estateManagers:1','chefs:1','security:2','HOUSEKEEPING','MAINTENANCE','ESTATE EVENT','localStorage.setItem'])assert.ok(manager.includes(token),token)
assert.ok(chicago.includes('jacobie-gold-coast-12-bedroom-mansion'))
assert.ok(world.includes('<StreetVerseChicagoJacobieGoldCoastMansion/>'))
assert.ok(world.includes('<StreetVerseLuxuryEstateManagement/>'))
assert.ok(travel.includes('jacobie-chicago-mansion')&&travel.includes('lateasia-mansion'))
console.log('Luxury estate static contract PASS')
