import assert from 'node:assert/strict'
import fs from 'node:fs'
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8')
const missions=read('src/components/StreetVerseTampaCommercialMissions.tsx')
const desk=read('src/components/StreetVerseTampaBusinessDesk.tsx')
const world=read('src/components/StreetVerseNearWest3D.tsx')
for(const heading of ['Brand Outreach','Sales & Approvals','World Builder Commerce','Service & Community','Growth & Leadership'])assert.ok(missions.includes(heading))
for(const token of ['flatMap','completed.length','localStorage.setItem','COMPLETE RP MISSION','No real money, license, or customer order'])assert.ok(missions.includes(token))
assert.ok(desk.includes('commercial-brand'))
assert.match(world,/<StreetVerseTampaCommercialMissions\/>/)
console.log('Tampa commercial missions static contract PASS')
