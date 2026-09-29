import assert from 'node:assert/strict'
import fs from 'node:fs'

const world=fs.readFileSync(new URL('../src/components/StreetVerseMobileWorld.tsx',import.meta.url),'utf8')
const visual=fs.readFileSync(new URL('../src/runtime/StreetVerseChicagoVisualLifeRuntime.ts',import.meta.url),'utf8')

assert.match(world,/createStreetVerseChicagoVisualLife/)
assert.match(world,/visualLife\.tick\(now,weatherVisual\)/)
assert.match(world,/visualLife\.dispose\(\)/)
assert.match(world,/visualLifeDensity:'chicago-visual-v3'/)
assert.match(world,/nightLighting:true/)
assert.match(world,/busShelterCount:visualLife\.counts\.busShelters/)
assert.match(world,/socialResidentCount:visualLife\.counts\.socialResidents/)
assert.match(visual,/new THREE\.InstancedMesh/)
assert.match(visual,/MeshStandardMaterial/)
assert.match(visual,/streetverse-mobile-facade-accents/)
assert.match(visual,/streetverse-mobile-storefront-awnings/)
assert.match(visual,/streetverse-mobile-bus-shelter-roofs/)
assert.match(visual,/streetverse-mobile-social-resident-bodies/)
assert.match(visual,/lightingForHour/)
assert.match(visual,/tryamm:streetverse-time-of-day/)
assert.match(visual,/nightBlend/)
assert.match(visual,/facadeAccents:facadeIndex/)
assert.match(visual,/busShelters:shelterSpots\.length/)
assert.match(visual,/socialResidents:SOCIAL_SPOTS\.length/)
assert.doesNotMatch(world,/renderer\.shadowMap\.enabled=true/)

console.log('StreetVerse Chicago visual-life pass 3 contract: PASS')
