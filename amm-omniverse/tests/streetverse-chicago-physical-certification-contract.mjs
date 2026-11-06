import assert from 'node:assert/strict'
import fs from 'node:fs'
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8')
const hud=read('src/components/StreetVerseChicagoCertificationHUD.tsx')
const world=read('src/components/StreetVerseMobileWorld.tsx')
const scene=read('src/runtime/StreetVerseLivingStoreScene.ts')
assert.match(hud,/enteredStore===d\.storeId/,'certification must require physical shop entry')
assert.match(hud,/Math\.abs\(d!\.x!-s\.x\)<2\.05/,'entry requires actual avatar coordinates')
assert.match(hud,/!d\?\.vehicleId/,'shop presence requires BJ on foot')
assert.match(world,/storeInteriorCollision\(x,z\)\.blocked/,'avatar movement must check shelves and counter')
assert.match(scene,/const shelves=/)
assert.match(scene,/const counter=/)
console.log('Chicago physical certification and interior obstacle regression contract PASS')
