import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
const src=fs.readFileSync(new URL('../src/runtime/AICafeZeroSpendModelPolicy.ts',import.meta.url),'utf8')
test('AI Cafe free-mode disallows accidental paid fallbacks',()=>{
 for(const phrase of ['autoPaidFallback:false','maxDollarSpend:0','autoSubscription:false','productionWrites:false','no_approved_free_capacity_stop_without_charge'])assert.ok(src.includes(phrase),phrase)
})
test('free mode excludes sensitive data from outside runtimes',()=>{
 assert.match(src,/sensitive_data_requires_private_approved_runtime/)
 assert.match(src,/commercialTermsReviewed/)
 assert.match(src,/privacyReviewed/)
 assert.doesNotMatch(src,/\bfetch\s*\(|process\.env|apiKey\s*=/)
})
