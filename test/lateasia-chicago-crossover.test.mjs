import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8')
test('LaTeasia Monroe is explicitly present in Chicago, with creator dialogue and accessible meeting action',()=>{
 const city=read('amm-omniverse/src/components/StreetVerseNearWest3D.tsx')
 const npc=read('amm-omniverse/src/components/StreetVerseLaTeasiaChicago.tsx')
 assert.match(city,/<StreetVerseLaTeasiaChicago onStatus={setLaTeasiaModelLoaded}\/>/)
 assert.match(city,/Meet LaTeasia Monroe in Chicago/)
 assert.match(city,/LaTeasia Monroe Chicago creator conversation/)
 assert.match(city,/setPlayerSpawn\(\{x:LATEASIA_CHICAGO\.position\.x\+3/)
 assert.match(npc,/id:'lateasia-monroe'/)
 assert.match(npc,/Taylor Street creator district/)
 assert.match(npc,/LaTeasia_RIGGED_DIAGNOSTIC\.glb/)
 assert.match(npc,/preview-only-not-certified-rig/)
 assert.match(npc,/if\(meshes===0\|\|!group\.current\)return/)
})
test('LaTeasia model never substitutes another anonymous Meshy NPC or asserts unverified certification',()=>{
 const npc=read('amm-omniverse/src/components/StreetVerseLaTeasiaChicago.tsx')
 assert.doesNotMatch(npc,/sv-black-woman-adult-01|sv-white-woman-youngadult-01/)
 assert.match(npc,/DEPLOYMENT TARGET, not a verified installed file/)
 assert.match(npc,/setRealModel\(true\)/)
 assert.match(npc,/mixer\.current\?\.update/)
})
test('LaTeasia remains referenced by Tampa Riverwalk even as Chicago is added',()=>{
 const tampa=read('amm-omniverse/src/components/TampaRiverwalkWorld.tsx')
 const character=read('amm-omniverse/src/components/StreetVerseLaTeasiaChicago.tsx')
 assert.match(tampa,/LaTeasia/)
 assert.match(tampa,/<StreetVerseLaTeasiaChicago city="tampa" position=\{\[18,0,-\.7\]\}\/>/)
 assert.match(character,/city\?:'chicago'\|'tampa'/)
 assert.match(character,/skinnedMeshes===0/)
 assert.match(character,/hasExpectedAnimations/)
 assert.match(character,/loaded-rig-preview-not-likeness-certified/)
})
