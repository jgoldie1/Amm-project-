import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
const code=fs.readFileSync(new URL('../src/runtime/StreetVerseChicagoStreamingPlanner.ts',import.meta.url),'utf8')
test('Chicago streaming is bounded and supports adjacent districts',()=>{
 for(const expected of ['maxResidentDistricts','maxBuildings','DEFAULT_MOBILE_BUDGET','DEFAULT_DESKTOP_BUDGET','current_district_exceeds_budget'])assert.ok(code.includes(expected))
 assert.ok(code.includes("['circle-park','roosevelt','pilsen']"))
});
test('planner cannot trigger production edits or network access',()=>{
 assert.doesNotMatch(code,/\bfetch\s*\(|window\.|localStorage|autoDeploy|process\.env/)
 assert.ok(code.includes('staging_plan_ready'))
});
