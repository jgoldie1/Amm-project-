import assert from 'node:assert/strict'
import fs from 'node:fs'
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8')
const society=read('src/components/StreetVerseTampaArrivalSociety.tsx')
const world=read('src/components/StreetVerseNearWest3D.tsx')
for(const chapter of ['Arrival & Survival','Jobs & Transportation','Housing & Community','Business & City Leadership'])assert.ok(society.includes(chapter))
for(const id of ['A01','A02','B01','C01','D01'])assert.ok(society.includes("id:'"+id+"'"))
for(const action of ['ACCEPT SALON ASSISTANT JOB','CLAIM STARTER TRANSIT PASS','RENT STARTER ROOM','SHOWER / HYGIENE','REST / RECOVER','TALK TO SUPPORT NPC'])assert.ok(society.includes(action))
assert.match(society,/s\.credits-100/)
assert.match(society,/step:s\.step\+1/)
assert.match(society,/localStorage\.setItem/)
assert.match(world,/<StreetVerseTampaArrivalSociety\/>/)
console.log('Tampa society starter mission static contract PASS')
