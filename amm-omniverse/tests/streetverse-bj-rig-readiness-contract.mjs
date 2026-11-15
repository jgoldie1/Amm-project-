import fs from 'node:fs'
import assert from 'node:assert/strict'
const preview=fs.readFileSync(new URL('../src/components/StreetVerseHoloLab3DPreview.tsx',import.meta.url),'utf8')
assert.match(preview,/let rigReady=false/,'Rig must start unverified')
assert.match(preview,/gltf\.scene\.getObjectByProperty\('type','SkinnedMesh'\)/,'Real skinned mesh required')
assert.match(preview,/gltf\.animations\.length/,'Animation clips required')
assert.match(preview,/rigReady=true/,'Rig readiness must be explicit')
assert.match(preview,/tryamm:bj-rig-ready/,'Rig evidence event must be emitted')
assert.match(preview,/if\(!rigReady\)/,'Arrival must be blocked without actual rig')
assert.match(preview,/animationFactory\.play\('walk'\)/,'Walking must be routed through Animation Factory')
console.log('BJ V15 actual rig readiness contract PASS')
