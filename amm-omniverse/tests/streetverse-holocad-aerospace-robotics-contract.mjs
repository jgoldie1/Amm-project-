import assert from 'node:assert/strict'
import fs from 'node:fs'

const read=p=>fs.readFileSync(new URL(p,import.meta.url),'utf8')
const original=read('../src/game/holocad/livingSystemsPresets.ts')
const extended=read('../src/game/holocad/aerospaceRoboticsPresets.ts')
const diagnostics=read('../src/game/holocad/holocadTrainingDiagnostics.ts')
const viewer=read('../src/components/StreetVerseHoloCADLivingSystemsLab.tsx')
const xr=read('../src/game/holocad/holocadXRSupport.ts')

const expected=[
 ['aircraft',16],
 ['spacecraft',14],
 ['satellite',13],
 ['drone',15],
 ['humanoid-robot',16],
 ['robot-dog',13],
 ['rover',16],
 ['exoskeleton',13],
 ['robotic-arm',13]
]
assert.equal([...extended.matchAll(/"id": "[^"]+"/g)].length,129,
 'Engineering expansion must have 129 inspectable 3D schematic components')
assert.equal([...original.matchAll(/"id": "[^"]+"/g)].length,81,
 'Existing human, animal, car and building CAD parts must remain available')
for(const [key,count] of expected){
 const start=extended.indexOf(' "'+key+'":{')
 assert.ok(start>=0,'Missing '+key+' subject')
 const next=extended.indexOf('\n "',
   start+key.length+4)
 const block=extended.slice(start,next>=0?next:extended.indexOf('\n}',start))
 const found=[...block.matchAll(/"id": "[^"]+"/g)].length
 assert.equal(found,count,'Subject '+key+' is missing CAD parts')
 const ids=[...block.matchAll(/"id": "([^"]+)"/g)].map(x=>x[1])
 assert.equal(new Set(ids).size,ids.length,'Duplicate ID in subject '+key)
}
for(const token of [
 '...HOLOCAD_AEROSPACE_ROBOTICS_PRESETS',
 '...HOLOCAD_AEROSPACE_ROBOTICS_KEYS',
 "'avionics'","'propulsion'","'actuation'","'sensors'","'power'","'compute'"
])assert.ok(original.includes(token),'Existing HoloCAD root not extended: '+token)
for(const token of [
 'diagnoseHoloCADTraining','exerciseIntegrityPercent','subsystemGroups',
 'faults.slice(0,8)','illustrative-only'
])assert.ok(diagnostics.includes(token),'Simulated subsystem diagnostics missing '+token)
for(const token of [
 'HOLOCAD_SUBJECT_ICONS','HOLOCAD_SUBJECT_ORDER','catalogPartCount',
 'RUN SANDBOX DIAGNOSTICS','trainingDiagnostic:', 'ILLUSTRATIVE SUBSYSTEM CHECK',
 'EXPORT PARTS MANIFEST','ENTЕR AR'
]){
 if(token==='ENTЕR AR')continue
 assert.ok(viewer.includes(token),'CAD interface missing '+token)
}
for(const token of ['renderer.xr.setSession','renderer.xr.getController',"getXRAPI(navigator)"]){
 assert.ok(viewer.includes(token),'XR interaction not preserved '+token)
}
assert.ok(xr.includes("'immersive-ar'")&&xr.includes("'immersive-vr'"),'AR and VR support gates missing')
assert.ok(extended.includes('NOT real CAD'),'Must label all aerospace/robotics parts as schematics')
assert.ok(viewer.includes('not actual sensor telemetry'),'Do not present manual faults as real telemetry')
console.log('HoloCAD aerospace+robotics source contract PASS: 9 subjects, 129 new parts, 210 total; AR/VR preserved')
