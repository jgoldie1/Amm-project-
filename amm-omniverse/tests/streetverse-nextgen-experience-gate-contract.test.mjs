import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
const code=fs.readFileSync(new URL('../src/runtime/StreetVerseNextGenExperienceGate.ts',import.meta.url),'utf8')
test('mixed reality requires opt-in, device checks, accessibility and consent',()=>{
 for(const key of ['opt_in_required','device_unsupported','accessibility_fallback_missing','rights_not_cleared','device_proof_missing','sensor_consent_required'])assert.ok(code.includes(key))
})
test('no automatic world replacement or unauthorized sensor and paid XR work',()=>{
 for(const key of ['cameraOffByDefault:true','micOffByDefault:true','automaticWorldReplacement:false','paidXRDependenciesAllowed:false','defaultSurface:\'flat\''])assert.ok(code.includes(key),key)
 assert.doesNotMatch(code,/\bfetch\s*\(|navigator\.xr|requestSession\s*\(/)
})
