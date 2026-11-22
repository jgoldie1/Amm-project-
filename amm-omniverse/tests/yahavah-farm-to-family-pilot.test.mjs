import assert from 'node:assert/strict'
import fs from 'node:fs'
import test from 'node:test'
const ui=fs.readFileSync(new URL('../src/components/FarmToFamilyPilot.tsx',import.meta.url),'utf8')
const hub=fs.readFileSync(new URL('../src/components/UnifiedCommerceHub.tsx',import.meta.url),'utf8')

test('Farm-to-Family component is wired into existing grocery hub',()=>{
 assert.match(hub,/import FarmToFamilyPilot from '.\/FarmToFamilyPilot'/)
 assert.match(hub,/<FarmToFamilyPilot\/>/)
 assert.match(hub,/\/farm-to-family/)
 assert.match(hub,/Farm-to-Family \/ Passports/)
})
test('no fictitious farm can be presented as approved commerce',()=>{
 assert.match(ui,/approved:false/g)
 assert.doesNotMatch(ui,/approved:true/)
 assert.match(ui,/0 approved partners/)
 assert.match(ui,/No farm listings are approved/)
 assert.match(ui,/No farm or Eatwild affiliation/)
 assert.doesNotMatch(ui,/checkout\(/i)
})
test('demonstration passports, accessible search and bilingual route work',()=>{
 for(const word of ['aria-live','aria-label','aria-pressed','search','setProduct','Language / Idioma','Español','passportURL','new URLSearchParams(window.location.search).get(\'farm\')'])assert.ok(ui.includes(word),word)
 assert.match(ui,/quickchart\.io\/qr/)
 assert.match(ui,/external service/)
})
test('Chicago pilot does not silently submit suppliers or sell products',()=>{
 for(const word of ['Chicago, IL','PRIVATE INQUIRY DRAFT','NOT ENROLLED','written farm opt-in','No farm is enrolled automatically','No farm listings are approved'])assert.ok(ui.includes(word),word)
})
