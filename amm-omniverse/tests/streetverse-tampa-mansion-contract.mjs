import assert from 'node:assert/strict'
import fs from 'node:fs'
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8')
const mansion=read('src/components/StreetVerseTampaLaTeasiaMansion.tsx')
const world=read('src/components/StreetVerseNearWest3D.tsx')
for(const token of ['length:6','East Bedroom','West Bedroom','lateasia-12-bedroom-mansion-duplex','OPEN','FRONT DOOR','LIGHTS','tryamm:tampa-mansion-controls','sphereGeometry','cylinderGeometry','12-bedroom duplex mansion'])assert.ok(mansion.includes(token),token)
assert.match(world,/<StreetVerseTampaLaTeasiaMansion\/>/)
assert.match(world,/<StreetVerseTampaMansionControls\/>/)
console.log('Tampa mansion static contract PASS')
