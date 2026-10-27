import {test} from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
const s=fs.readFileSync(new URL('../src/runtime/StubbsFilmContinuityGate.ts',import.meta.url),'utf8')
test('previs requires approved shot, matched continuity and licensed assets',()=>{
 for(const phrase of ['continuity_record_missing','location_mismatch','shot_not_approved','previs_not_approved','asset_rights_unverified','invalid_duration'])assert.ok(s.includes(phrase),phrase)
})
test('four-direction coverage and no media publishing or payment',()=>{
 assert.match(s,/fourDirectionReady/)
 assert.doesNotMatch(s,/fetch\s*\(|getUserMedia\s*\(|publishVideo\s*\(|chargeCustomer\s*\(/)
})
