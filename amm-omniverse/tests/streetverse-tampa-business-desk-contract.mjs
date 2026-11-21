import assert from 'node:assert/strict'
import fs from 'node:fs'
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8')
const desk=read('src/components/StreetVerseTampaBusinessDesk.tsx')
const world=read('src/components/StreetVerseNearWest3D.tsx')
for(const term of ['game-permit','cashapp-question','website','SAVE REQUEST DRAFT','Fictional permits do not authorize real-world operations','NOT been delivered','localStorage.setItem','maxLength={500}'])assert.ok(desk.includes(term),term)
assert.match(world,/<StreetVerseTampaBusinessDesk\/>/)
console.log('Tampa business desk static contract PASS')
