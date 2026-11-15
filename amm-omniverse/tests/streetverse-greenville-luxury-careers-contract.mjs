import assert from 'node:assert/strict'
import fs from 'node:fs'
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8')
const careers=read('src/components/StreetVerseLuxuryLifestyleCareers.tsx')
const mansion=read('src/components/StreetVerseGreenvilleFratMansion.tsx')
const world=read('src/components/StreetVerseNearWest3D.tsx')
const travel=read('src/components/StreetVerseTampaTravelDock.tsx')
for(const title of ['Butler Training','Housekeeping Management','Private Chef','Estate Security','Event Planning','Interior Design','Property Maintenance'])assert.ok(careers.includes(title))
for(const token of ['localStorage.setItem','tryamm:luxury-career-task-complete','No real employment or certification'])assert.ok(careers.includes(token))
assert.ok(mansion.includes('greenville-university-fraternity-mansion'))
assert.ok(world.includes('<StreetVerseGreenvilleFratMansion/>'))
assert.ok(world.includes('<StreetVerseLuxuryLifestyleCareers/>'))
assert.ok(travel.includes('greenville-frat-mansion'))
console.log('Greenville luxury careers static contract PASS')
