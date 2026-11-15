import assert from 'node:assert/strict'
import fs from 'node:fs'
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8')
const manager=read('src/components/StreetVerseGreenvilleFraternityManagement.tsx')
const world=read('src/components/StreetVerseNearWest3D.tsx')
for(const term of ['Membership application','President','Treasurer','Events Officer','House Manager','SAVE APPLICATION','RECORD FICTIONAL DUES','MAINTENANCE REPAIR','PLAN CAMPUS EVENT','localStorage.setItem','no hazing','server-enforced'])assert.ok(manager.includes(term),term)
assert.match(world,/<StreetVerseGreenvilleFraternityManagement\/>/)
console.log('Greenville fraternity management static contract PASS')
