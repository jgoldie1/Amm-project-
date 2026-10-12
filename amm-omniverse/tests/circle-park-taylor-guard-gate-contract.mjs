import fs from 'node:fs'
import assert from 'node:assert/strict'
const read=p=>fs.readFileSync(new URL(p,import.meta.url),'utf8')
const gate=read('../src/runtime/CircleParkTaylorGuardGateV1.ts')
const world=read('../src/components/StreetVerseMobileWorld.tsx')
const config=read('../src/data/CircleParkResidentEntrance.ts')
for(const key of [
 'circle-park-taylor-laflin-guard-entrance-v1','taylor-laflin-entry-approach-pavement',
 'taylor-laflin-entry-accessible-ramp','taylor-laflin-entry-crosswalk-stripe',
 'taylor-laflin-entry-tactile-ramp','taylor-laflin-entry-guard-canopy',
 'taylor-laflin-entry-visitor-checkin-plaque','taylor-laflin-entry-left-swing-gate',
 'taylor-laflin-entry-right-swing-gate','taylor-laflin-entry-visible-sign',
 'realWorldSecurityMap:false','disposeMaterials:()=>'
])assert.ok(gate.includes(key),'Missing Taylor/Laflin gate component '+key)
for(const key of [
 'installCircleParkTaylorGuardGateV1(circleParkReality',
 "id:'circle-park-taylor-guard'","if(prompt.id==='circle-park-taylor-guard')",
 "'tryamm:circle-park-entry'","'guard-sign-in'",
 "['taylor-gate','🚪 TAYLOR GUARD GATE']",
 'taylorStreetGuardGate.setOpen(true)','taylorStreetGuardGate.disposeMaterials()',
 "'tryamm:circle-park-taylor-route-request'",
])assert.ok(world.includes(key),'Missing mobile gate link '+key)
assert.equal(world.split("if(prompt.id==='circle-park-taylor-guard')").length-1,2,'Both mobile interaction handlers must check in')
assert.ok(config.includes("coordinatePolicy:'fictionalized-gameplay-local-not-a-security-map'"),'No claim to map real security')
console.log('CIRCLE PARK TAYLOR GUARD GATE PASS: gate meshes, accessible check-in, one-hand routing, activation, disposal and privacy')
