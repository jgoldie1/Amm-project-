import assert from 'node:assert/strict'
import fs from 'node:fs'
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8')
const director=read('src/runtime/StreetVerseLivingCityDirector.ts')
const hud=read('src/components/StreetVerseLivingStoresHUD.tsx')
assert.match(director,/export function cityCommerceEvents/)
assert.match(director,/fictional:true/)
assert.match(director,/restock-request/)
assert.match(director,/shift-change/)
assert.match(hud,/citySnapshot\(cityTick\)/)
assert.match(hud,/cityCommerceEvents\(cityTick/)
assert.match(hud,/ADVANCE CITY TIME \+ NPC ACTIVITY/)
assert.match(hud,/BUY WITH GAME CREDITS/)
console.log('Living city commerce contract PASS')
