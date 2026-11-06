import assert from 'node:assert/strict'
import fs from 'node:fs'
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8')
const scene=read('src/runtime/StreetVerseLivingStoreScene.ts')
const hud=read('src/components/StreetVerseLivingStoresHUD.tsx')
const chrono=read('src/components/StreetVerseChronoShopHUD.tsx')
assert.match(scene,/Keep interior hollow/)
assert.match(scene,/walkable floor/)
assert.match(scene,/shelfY/)
assert.match(scene,/vendor.position.set\(0,0,-1.6\)/)
assert.match(hud,/tryamm:streetverse-open-shopping/)
assert.match(chrono,/tryamm:streetverse-open-shopping/)
assert.match(hud,/BUY WITH GAME CREDITS/)
console.log('StreetVerse retail interiors and checkout bridge contract PASS')
