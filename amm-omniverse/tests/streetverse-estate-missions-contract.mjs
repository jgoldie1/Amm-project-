import assert from 'node:assert/strict'
import fs from 'node:fs'
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8')
const missions=read('src/components/StreetVerseEstateMissions.tsx')
const manager=read('src/components/StreetVerseLuxuryEstateManagement.tsx')
const world=read('src/components/StreetVerseNearWest3D.tsx')
for(const token of ["lateasia:TASKS.map","jacobie:TASKS.map","greenville:TASKS.map","length","tryamm:estate-mission-action","tryamm:estate-mission-complete","localStorage.setItem","TRAVEL TO ESTATE","PERFORM"])assert.ok(missions.includes(token),token)
for(const action of ['staff','housekeeping','maintenance','event'])assert.ok(manager.includes("missionAction('"+action+"')"),action)
assert.ok(world.includes('<StreetVerseEstateMissions onTravel={travelEstateMission}/>'))
assert.ok(world.includes('const travelEstateMission='))
console.log('Estate missions static contract PASS')
