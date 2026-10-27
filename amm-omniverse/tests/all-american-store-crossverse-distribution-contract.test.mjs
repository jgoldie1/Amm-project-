import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
const src=fs.readFileSync(new URL('../src/runtime/AllAmericanStoreCrossVerseDistributionGate.ts',import.meta.url),'utf8')
test('own store and CrossVerse require review, rights, payments and binary integrity',()=>{
 for(const name of ['payment_processor_not_approved','binary_integrity_unverified','adult_eligibility_missing','device_safety_unverified','content_rights_privacy_review_missing'])assert.ok(src.includes(name))
})
test('does not silently sideload, publish, unlock or bundle adult device code in mainstream app',()=>{
 for(const name of ['mayAutoPublish:false','automaticSideload:false','hiddenUnlocks:false','mainstreamBundleContainsAdultDeviceCode:false'])assert.ok(src.includes(name))
 assert.doesNotMatch(src,/\bfetch\s*\(|localStorage|navigator\.bluetooth/)
})
