import fs from 'node:fs'
import assert from 'node:assert/strict'
const route=fs.readFileSync(new URL('../amm-backend/routes/asset-forge.js',import.meta.url),'utf8')
const orch=fs.readFileSync(new URL('../src/data/QuantumAssetForgeOrchestrator.ts',import.meta.url),'utf8')
assert.match(route,/CIRCLE_PARK_PRODUCTION_WAVE/)
assert.match(route,/production-wave\/start/)
assert.match(route,/maxJobs:6/)
assert.match(route,/noAutomaticRefine:true/)
assert.match(orch,/externalGenerationHardCap:6/)
assert.match(orch,/reserveCreditsForBJ:true/)
assert.match(orch,/SV_HERO_BJ_STUBBS_V6\.glb/)
assert.match(orch,/nativeWorldBuilderKinds:\['building','environment','prop'\]/)
console.log('Circle Park credit-guarded Asset Forge execution bridge contract: PASS')
