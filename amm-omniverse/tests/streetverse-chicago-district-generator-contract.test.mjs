import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
const s=fs.readFileSync(new URL('../src/runtime/StreetVerseChicagoDistrictGenerator.ts',import.meta.url),'utf8')
test('staging generator covers six Chicago districts and bounds device usage',()=>{
 for(const d of ['circle-park','taylor','roosevelt','pilsen','west-side','downtown'])assert.ok(s.includes("'"+d+"'"))
 for(const v of ['size>12','fictionalized:true','status:\'staging\'','protectedCircleParkActive','trafficSpawns'])assert.ok(s.includes(v),v)
})
test('staging code cannot deploy or overwrite current world',()=>{
 assert.doesNotMatch(s,/\bfetch\s*\(|window\.location|localStorage|publishWorld\s*\(/)
 assert.ok(s.includes('context.isStaging'))
})
