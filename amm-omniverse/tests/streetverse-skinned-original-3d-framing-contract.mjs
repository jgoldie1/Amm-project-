import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {test} from 'node:test'
const code=readFileSync(new URL('../src/runtime/StreetVerseRecoveredPlayableRuntime.ts',import.meta.url),'utf8')
test('skinned source gets measured after actual bone transforms, not static 0.01 armature bounds',()=>{
 assert.match(code,/function posedCharacterBounds\(model:THREE\.Object3D\)/)
 assert.match(code,/node\.applyBoneTransform\(i,vertex\)/)
 assert.match(code,/node\.localToWorld\(vertex\)/)
 assert.match(code,/function fitRecoveredCharacter\(model:THREE\.Object3D,targetHeight=1\.82\)/)
 assert.match(code,/sourcePosedHeightMeters:fitted\.sourceHeight/)
 assert.match(code,/Model remains outside playable human scale/)
})
test('original texture preference and truthful diagnostic fallback',()=>{
 assert.match(code,/LaTeasia_Monroe_Textured_Seven_Motion_Recovery\.glb/)
 assert.match(code,/raw\.githubusercontent\.com/)
 assert.match(code,/All original GLB sources failed/)
 assert.match(code,/diagnosticAppearance:id==='lateasia-monroe'&&!hasPhotoTextures/)
})
