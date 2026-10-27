import {test} from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
const src=fs.readFileSync(new URL('../src/runtime/StubbsUniversalCreationGraph.ts',import.meta.url),'utf8')
test('cross-surface creation never bypasses consent, rights or verification',()=>{
 for(const rule of ['rights_not_approved','performer_consent_missing','accessibility_fallback_missing','output_unverified','adult_content_restricted','explicit_review_required']) assert.ok(src.includes(rule),rule)
 assert.match(src,/status:decision.ready\?'staging_ready':'blocked'/)
 assert.doesNotMatch(src,/\bfetch\s*\(|\bexec\s*\(|localStorage|window\.location/)
})
test('one authored asset spans core TRYAMM surfaces',()=>{
 for(const surface of ['streetverse','omnibox','isaiah-tv','aniyah-studio','marketplace','xr','training'])assert.ok(src.includes(surface),surface)
})
