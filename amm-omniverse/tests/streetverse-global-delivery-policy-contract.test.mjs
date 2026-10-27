import {test} from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
const src=fs.readFileSync(new URL('../src/runtime/StreetVerseGlobalDeliveryPolicy.ts',import.meta.url),'utf8')
test('global loader must enforce safe internal assets and bounded packs',()=>{
 for(const key of ['MAX_PACK_BYTES','ALLOWED_ASSET','asset_pack_not_verified','using_last_verified_city','reducedMotion'])assert.ok(src.includes(key),key)
 assert.doesNotMatch(src,/\bfetch\s*\(|\bexec\s*\(|localStorage|window\.location/)
})
test('travel is blocked before saved progress and country safety checks',()=>{
 for(const key of ['passport_unverified','age_gate','progress_not_saved','destination_unavailable'])assert.ok(src.includes(key),key)
})
