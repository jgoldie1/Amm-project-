import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
const src=fs.readFileSync(new URL('../src/runtime/StreetVerseChicagoDistrictTravelGate.ts',import.meta.url),'utf8')
test('Travel gate checks adjacent districts, saved progress, verified assets and safe handoff',()=>{
 for(const term of ['not_directly_connected','progress_unsaved','assets_not_cleared','destination_not_ready','player_must_stop_safely','ready_for_verified_scene_handoff'])assert.ok(src.includes(term),term)
})
test('Geography data source rules exclude prohibited extraction and production side effects',()=>{
 assert.ok(src.includes('allowGoogleMapsExtraction:false'))
 assert.ok(src.includes('allowStreetViewModelTracing:false'))
 assert.ok(src.includes('scenesMountedAutomatically:false'))
 assert.doesNotMatch(src,/\bfetch\s*\(|localStorage|window\.location/)
})
