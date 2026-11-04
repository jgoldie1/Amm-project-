import assert from 'node:assert/strict'
import fs from 'node:fs'

const read=path=>fs.readFileSync(new URL(path,import.meta.url),'utf8')
const presets=read('../src/game/holocad/livingSystemsPresets.ts')
const xr=read('../src/game/holocad/holocadXRSupport.ts')
const viewer=read('../src/components/StreetVerseHoloCADLivingSystemsLab.tsx')
const bridge=read('../src/components/StreetVerseGeoSpawnBridge.tsx')

// This static contract prevents losing the lab even on hardware without WebXR.
// True runtime and headset performance requires a real browser/AR headset QA pass.
const count=(s,re)=>[...s.matchAll(re)].length
assert.equal(count(presets,/\s+"id":\s*"/g),81,'HoloCAD must preserve 81 selectable schematic parts')
for(const subject of ['human','canine','automobile','building']){
 assert.ok(presets.includes(`"${subject}"`),`Missing HoloCAD subject ${subject}`)
}
for(const layer of ['organs','skeleton','mechanical','electrical','plumbing','hvac']){
 assert.ok(presets.includes(`"layer": "${layer}"`),`Missing layer ${layer}`)
}
for(const token of [
 'checkHoloCADXRSupport','immersive-ar','immersive-vr','isSessionSupported',
 'window.isSecureContext'
])assert.ok((xr+'\n'+viewer).includes(token),'WebXR support gate missing '+token)
for(const token of [
 'renderer.xr.setSession','renderer.setAnimationLoop','renderer.xr.getController',
 "controller.addEventListener('select'","controller.addEventListener('squeeze'",
 "type=\"button\" aria-label=\"Enter HoloCAD augmented reality\"",
 "type=\"button\" aria-label=\"Enter HoloCAD virtual reality\"",
 'EXIT XR','xrSupport.ar','xrSupport.vr'
])assert.ok(viewer.includes(token),'XR session/control behavior missing '+token)
for(const token of [
 'releaseControllers()', 'renderer.xr.enabled=false',
 "addEventListener('end',onSessionEnd)","removeEventListener('end',onSessionEnd)",
 'document.body', "tryamm:holocad-living-open"
])assert.ok((viewer+'\n'+bridge).includes(token),'XR lifecycle or activation missing '+token)
for(const token of ['EXPORTED PARTS MANIFEST','EXPORT PARTS MANIFEST','REASSEMBLE / RESET','MARK FAULT','ISOLATE PART']){
 assert.ok(viewer.includes(token.replace('EXPORTED PARTS MANIFEST','EXPORT PARTS MANIFEST')),'HoloCAD teardown feature missing '+token)
}
assert.ok(viewer.includes('No living being is scanned'),'HoloCAD simulation boundary must stay explicit')
assert.ok(viewer.includes('WebXR unsupported here'),'Unsupported devices must retain normal 3D')
assert.ok(bridge.includes('const holoCADControl'),'HoloCAD must mount into the existing world without changing driving')

console.log('HoloCAD Living Systems WebXR source/teardown contract: PASS (81 parts; AR, VR and 3D fallback)')
