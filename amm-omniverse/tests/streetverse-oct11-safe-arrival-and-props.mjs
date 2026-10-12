import fs from 'node:fs'
import assert from 'node:assert/strict'
import vm from 'node:vm'
import ts from 'typescript'

const read=(rel)=>fs.readFileSync(new URL(rel,import.meta.url),'utf8')
const src=read('../src/runtime/StreetVerseSafeDistrictArrival.ts')
const compiled=ts.transpileModule(src,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText
const sandbox={exports:{},module:{exports:{}}}
vm.runInNewContext(compiled,sandbox,{timeout:1000})
const find=sandbox.exports.findSafeStreetVerseDistrictArrival
assert.equal(typeof find,'function','Arrival resolver must export callable logic')

const clamp=(v)=>Math.max(-82,Math.min(82,v))
const clear=()=>true
const exact=find({x:-15,z:49},clear,clamp)
assert.equal(exact.x,-15)
assert.equal(exact.z,49)
assert.equal(exact.adjusted,false)
assert.equal(exact.distance,0)

const blockedCenter=(x,z)=>Math.hypot(x,z)>4
const detour=find({x:0,z:0},blockedCenter,clamp)
assert.ok(detour&&detour.adjusted,'Blocked location must seek a safe nearest point')
assert.ok(blockedCenter(detour.x,detour.z),'Detour must pass the same scene collision callback')
assert.ok(detour.distance>=4,'Detour must not overlap the blocked area')

const never=()=>false
assert.equal(find({x:4,z:4},never,clamp),null,'No safe landing must leave character in place')
assert.equal(find({x:NaN,z:4},clear,clamp),null,'NaN location must be rejected')
assert.equal(find({x:4,z:Infinity},clear,clamp),null,'Infinite location must be rejected')
const clamped=find({x:110,z:-110},clear,clamp)
assert.equal(clamped.x,82)
assert.equal(clamped.z,-82)

const world=read('../src/runtime/StreetVerseWestSideVisibleWorldRuntime.ts')
const mobile=read('../src/components/StreetVerseMobileWorld.tsx')
const builder=read('../src/components/StreetVerseWestSideWorldBuilder.tsx')
for(const token of [
 'addWestSideStreetscapeV10',
 "racks.name='west-side-bike-rack-v10'",
 "bollards.name='west-side-curb-bollard-v10'",
 'worldBuilderDistrictEntries:builderArrivals.length',
 'bikeRacks:streetscapeV10.bikeRacks',
 "streetscapePass:'low-draw-call-bike-rack-bollard-v10'",
])assert.ok(world.includes(token),'Missing visual streetscape evidence '+token)
assert.ok(mobile.includes("const landing=findSafeStreetVerseDistrictArrival("),'Mobile route must use safe solver')
assert.ok(mobile.includes("'tryamm:west-side-route-blocked'"),'Blocked route must be surfaced, not silently displaced')
assert.ok(builder.includes("'tryamm:west-side-route-blocked'"),'Builder must present failure state')
console.log('STREETVERSE SAFE ARRIVAL + STREETSCAPE PASS: collision-safe routing, blocked fallback, instance props and mobile failure feedback')
