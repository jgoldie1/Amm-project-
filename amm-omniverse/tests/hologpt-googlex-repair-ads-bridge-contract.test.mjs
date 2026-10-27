import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
const source=fs.readFileSync(new URL('../src/runtime/HoloGPTGoogleXRepairAdsBridge.ts',import.meta.url),'utf8')
test('HoloGPT repair references existing GoogleX and repair engine',()=>{
 for(const name of ['planGoogleXContext','detectRepairLayer','normalizeErrorSignature','sandbox_red_test','bounded_failure_evidence_required'])assert.ok(source.includes(name))
})
test('Holo Ads only makes approved drafts without leaking private data or spending',()=>{
 for(const name of ['HOLO_AD_PRODUCTS','private_data_requires_scoped_backend','owner_review','billing:\'not_authorized\'','privatePlayerMemoryForAds:false','adultDeviceTelemetryForAds:false','autoSpend:false','autoPublish:false','autoDeploy:false'])assert.ok(source.includes(name),name)
 assert.doesNotMatch(source,/\bfetch\s*\(|process\.env|window\.dispatchEvent/)
})
