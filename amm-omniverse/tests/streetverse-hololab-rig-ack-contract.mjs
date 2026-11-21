import fs from 'node:fs'
import assert from 'node:assert/strict'
const hud=fs.readFileSync(new URL('../src/components/StreetVerseHoloLabDemoHUD.tsx',import.meta.url),'utf8')
const preview=fs.readFileSync(new URL('../src/components/StreetVerseHoloLab3DPreview.tsx',import.meta.url),'utf8')
assert.match(hud,/renderedEra!==pending/,'Travel must wait for renderer acknowledgement')
assert.match(hud,/tryamm:hololab-scene-rendered/,'HUD must receive render acknowledgement')
assert.match(preview,/renderer\.render\(scene,camera\);if\(acknowledgeEra\)/,'Acknowledge only after rendered frame')
assert.match(preview,/GLTFLoader/,'Rigged GLB loader missing')
assert.match(preview,/SkinnedMesh/,'Rig validation missing')
assert.match(preview,/gltf\.animations\.length/,'Animation validation missing')
assert.match(preview,/AnimationMixer/,'Skeletal animation mixer missing')
assert.match(preview,/VITE_STREETVERSE_BJ_GLB_URL/,'GLB asset configuration missing')
console.log('HoloLab renderer acknowledgement and optional GLB contract PASS')
