import assert from 'node:assert/strict'
import fs from 'node:fs'
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8')
const hud=read('src/components/StreetVerseChronoShopHUD.tsx')
const world=read('src/components/StreetVerseMobileWorld.tsx')
assert.match(hud,/tryamm:streetverse-avatar-outfit/)
assert.match(hud,/wear\('creator-jacket'\)/)
assert.match(world,/avatar.add\(shopWardrobe\)/)
assert.match(world,/tryamm:streetverse-avatar-outfit/)
assert.match(world,/wardrobeCoat.visible=/)
assert.match(world,/wardrobeGeometry.dispose\(\)/)
assert.match(world,/wardrobeMaterial.dispose\(\)/)
console.log('StreetVerse 3D wardrobe event bridge contract PASS')
