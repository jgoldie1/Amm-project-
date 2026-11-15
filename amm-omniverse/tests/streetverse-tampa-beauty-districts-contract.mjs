import assert from 'node:assert/strict'
import fs from 'node:fs'
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8')
const districts=read('src/components/StreetVerseTampaBeautyDistricts.tsx')
const scene=read('src/components/StreetVerseNearWest3D.tsx')
for(const id of ['riverwalk','beauty-house','residential','entertainment'])assert.match(districts,new RegExp("id:'"+id+"'"))
for(const name of ['tampa-waterfront-water','riverwalk-pedestrian-path','district-connector-east-west','district-connector-north-south','lateasia-tampa-flagship-salon','beautyverse-residence-'])assert.ok(districts.includes(name),name)
for(const venue of ['academy','boutique','cafe','photo-studio','restaurant','music-venue'])assert.ok(districts.includes("'"+venue+"'"),venue)
assert.match(districts,/length:42/)
assert.match(scene,/<StreetVerseTampaBeautyDistricts\/>/)
console.log('Tampa BeautyVerse four-district scene static contract PASS')
