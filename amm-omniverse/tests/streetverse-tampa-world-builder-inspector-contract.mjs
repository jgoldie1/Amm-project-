import assert from 'node:assert/strict'
import fs from 'node:fs'
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8')
const inspector=read('src/components/StreetVerseTampaWorldBuilderInspector.tsx')
const districts=read('src/components/StreetVerseTampaBeautyDistricts.tsx')
const world=read('src/components/StreetVerseNearWest3D.tsx')
for(const term of ['Owner:','Residents:','Jobs:','Maintenance:','Economy:','Missions:','WEBSITE_PRICE_USD=450','REQUEST $450 STARTER WEBSITE','No payment, license, or purchase was processed','tryamm:website-package-interest'])assert.ok(inspector.includes(term),term)
for(const id of ['salon','academy','boutique','cafe','photo-studio','restaurant','music-venue','home-001'])assert.ok(inspector.includes("id:'"+id+"'"),id)
assert.match(districts,/inspect\('home-001'\)/)
assert.match(districts,/inspect\("salon"\)/)
assert.match(districts,/inspect\(id\)/)
assert.match(world,/<StreetVerseTampaWorldBuilderInspector\/>/)
console.log('Tampa World Builder Inspector static contract PASS')
