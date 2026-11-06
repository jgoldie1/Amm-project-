import assert from 'node:assert/strict'
import fs from 'node:fs'
const root=new URL('../src/',import.meta.url)
const state=fs.readFileSync(new URL('runtime/StreetVerseChicagoSessionRuntime.ts',root),'utf8')
const hud=fs.readFileSync(new URL('components/StreetVerseChicagoSessionHUD.tsx',root),'utf8')
const world=fs.readFileSync(new URL('components/StreetVerseMobileWorld.tsx',root),'utf8')
for(const key of ['vehicle-driven','package-delivered','food-purchased','after-dark-exited','next-mission-started'])assert.ok(state.includes(key))
assert.match(state,/transitions\[stage\]\.event!==event/,'Reject out-of-order events')
assert.match(hud,/buyStreetVerseFood\(player,id\)/,'Use actual fictional economy')
assert.match(hud,/tryamm:streetverse-after-dark-test/,'After Dark exit advances session')
assert.match(hud,/3D behavior not automatically certified/,'Do not mislabel manual checkpoints')
assert.match(world,/<StreetVerseChicagoSessionHUD\/>/,'Session HUD mounted')
console.log('Chicago session source contract PASS')
