import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
const s=fs.readFileSync(new URL('../src/runtime/StubbsVirtualBuildingBlueprint.ts',import.meta.url),'utf8')
test('virtual blueprint models infrastructure and approved reuse',()=>{
 for(const name of ["'power'","'lighting'","'water'","'drainage'","'data'","'fire-safety'","'streetverse'","'live'","'website'","'training'"])assert.ok(s.includes(name),name)
 assert.ok(s.includes('rights_unapproved'))
})
test('virtual blueprints cannot claim engineering certification or publish automatically',()=>{
 for(const name of ['realConstructionCertified:false','realElectricalDesign:false','realPlumbingDesign:false','permitReady:false','autoPublish:false'])assert.ok(s.includes(name))
 assert.doesNotMatch(s,/\bfetch\s*\(|localStorage|window\.location/)
})
