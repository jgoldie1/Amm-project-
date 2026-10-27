import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
const s=fs.readFileSync(new URL('../src/runtime/StubbsBuildingBlueprintGraph.ts',import.meta.url),'utf8')
test('blueprints cover utilities and reusable surfaces with rights checks',()=>{
 for(const v of ["'electrical'","'plumbing'","'hvac'","'structural'","'accessibility'","'streetverse'","'live'","'website'","rights_unapproved","surface_not_authorized"])assert.ok(s.includes(v),v)
})
test('blueprints are conceptual and never control construction or live publishing',()=>{
 for(const v of ['realConstructionUse:false','automaticPublishing:false','paymentAccess:false','approvedForDisplay'])assert.ok(s.includes(v),v)
 assert.doesNotMatch(s,/\bfetch\s*\(|process\.env|localStorage/)
})
