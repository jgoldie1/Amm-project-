import assert from 'node:assert/strict'
import fs from 'node:fs'

const read=rel=>fs.readFileSync(new URL(rel,import.meta.url),'utf8')
const pipeline=read('../src/runtime/Meshy3DPrintPipeline.ts')
const panel=read('../src/components/Meshy3DPrintLab.tsx')
const factory=read('../src/components/MeshyFactoryControlPanel.tsx')

for(const token of [
 "name:'TRYAMM Meshy 3D Print Prep'",
 "outputs:['binary STL','OBJ','print-prep manifest']",
 "doesNotGenerateGcode:true",
 "doesNotSendActuatorCommands:true",
 "rightsReviewRequiredForCommercialProduction:true",
 "analyzeMeshyPrintableScene",
 "cloneForPrint",
 "STLExporter",
 "OBJExporter",
]) assert.ok(pipeline.includes(token),`Meshy print pipeline missing ${token}`)

assert.ok(pipeline.includes("if(!input.rightsAcknowledged)reasons.push('rights-not-acknowledged')"),'print export must require rights acknowledgement')
assert.ok(pipeline.includes("orientation:'z-up'"),'print manifest must identify Z-up output')
assert.ok(pipeline.includes("slicerRequired:true")&&pipeline.includes("machineProfileRequired:true"),'print prep must require a real slicer and machine profile')
assert.ok(panel.includes('LOCAL MESHY GLB (OPTIONAL)'),'print lab must accept any downloaded Meshy GLB')
assert.ok(panel.includes("accept=\".glb,model/gltf-binary,application/octet-stream\""),'local Meshy GLB file input missing')
assert.ok(panel.includes("EXPORT STL")&&panel.includes("EXPORT OBJ"),'print lab must expose STL and OBJ prep')
assert.ok(panel.includes('Commercial production still requires'),'print lab must preserve rights review warning')
assert.ok(factory.includes('<Meshy3DPrintLab jobs={jobs}/>'),'Meshy factory must expose 3D print prep')

console.log('Meshy 3D print prep contract: PASS')
