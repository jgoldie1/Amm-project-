import assert from 'node:assert/strict'
import test from 'node:test'
import {createBJOriginalRiggedGLB} from '../scripts/build-bj-original-rigged-glb.mjs'
import {augmentBJ15Motion} from '../scripts/build-bj-v15-motion.mjs'

const documentFrom=bytes=>{
 assert.equal(bytes.toString('ascii',0,4),'glTF')
 assert.equal(bytes.readUInt32LE(8),bytes.length)
 const length=bytes.readUInt32LE(12)
 assert.equal(bytes.readUInt32LE(16),0x4e4f534a)
 const doc=JSON.parse(bytes.toString('utf8',20,20+length))
 const binOffset=20+length
 assert.equal(bytes.readUInt32LE(binOffset+4),0x004e4942)
 assert.equal(bytes.readUInt32LE(binOffset),doc.buffers[0].byteLength)
 return doc
}

test('V15 motion-enhancement script preserves source meshes, skeleton and materials, adds honest run proxy',()=>{
 const original=createBJOriginalRiggedGLB()
 const before=documentFrom(original)
 const enhanced=augmentBJ15Motion(original)
 const after=documentFrom(enhanced)
 assert.notEqual(enhanced.length,original.length)
 assert.equal(after.meshes.length,before.meshes.length)
 assert.equal(after.materials.length,before.materials.length)
 assert.deepEqual(after.skins,before.skins)
 assert.equal(after.animations.length,before.animations.length+1)
 assert.deepEqual(before.animations[0].name,'BJ_Idle_Breathe')
 const added=after.animations.at(-1)
 assert.equal(added.name,'BJ_Run_Cycle_Fallback_From_Walk_0p68x')
 assert.equal(added.extras.status,'retimed-walk-not-captured-running')
 assert.ok(added.channels.length>0)
 assert.deepEqual(documentFrom(original),before,'source must not be modified')
 assert.deepEqual(augmentBJ15Motion(enhanced),enhanced,'repeat processing should be idempotent')
})

test('V15 live loader has an opt-in motion preview and falls back to unchanged V15 remote',async()=>{
 const fs=await import('node:fs')
 const source=fs.readFileSync(new URL('../src/runtime/StreetVerseMeshyBJHeroRuntime.ts',import.meta.url),'utf8')
 assert.match(source,/BJ_V15_MOTION_PREVIEW_URL/)
 assert.match(source,/get\('bj'\)==='motion'/)
 assert.match(source,/\[motionPreviewUrl,v15PreviewUrl,metaHumanPreviewUrl/)
 assert.match(source,/candidate===v15PreviewUrl\|\|candidate===motionPreviewUrl/)
 assert.match(source,/if\(!valid\)\{disposeObject/)
})

test('recovered V15 real animation clip names map to live gesture controls',async()=>{
 const fs=await import('node:fs')
 const source=fs.readFileSync(new URL('../src/runtime/StreetVerseMeshyBJHeroRuntime.ts',import.meta.url),'utf8')
 const panel=fs.readFileSync(new URL('../src/components/StreetVerseMyceliumSubmissionPanel.tsx',import.meta.url),'utf8')
 assert.match(source,/Observe_Left_Right/)
 assert.match(source,/Conversational_Gesture/)
 assert.match(source,/Listen(?:ing)?/)
 assert.match(source,/BJ_Run_Cycle_Fallback_From_Walk_0p68x/)
 assert.match(source,/usingRetimedRunProxy/)
 assert.match(source,/tryamm:bj-gesture-result/)
 for(const gesture of ['greet','nod','look-around','acknowledge']){
  assert.ok(panel.includes("'"+gesture+"'"),'Missing in-game '+gesture+' test button')
 }
 assert.match(panel,/tryamm:bj-gesture-result/)
 assert.match(panel,/gestureResult/)
})

test('BJ V15 local File picker uses the actual StreetVerse loader with safe fallback',async()=>{
 const fs=await import('node:fs')
 const runtime=fs.readFileSync(new URL('../src/runtime/StreetVerseMeshyBJHeroRuntime.ts',import.meta.url),'utf8')
 const ui=fs.readFileSync(new URL('../src/components/StreetVerseMyceliumSubmissionPanel.tsx',import.meta.url),'utf8')
 const mobile=fs.readFileSync(new URL('../src/components/StreetVerseMobileWorld.tsx',import.meta.url),'utf8')
 assert.match(ui,/SELECT BJ V15 GLB FROM FILES/)
 assert.match(ui,/file\.slice\(0,12\)\.arrayBuffer/)
 assert.match(ui,/createObjectURL\(file\)/)
 assert.match(ui,/tryamm:streetverse-bj-v15-preview/)
 assert.match(runtime,/__TRYAMM_BJ_LOCAL_PREVIEW_URL__/)
 assert.match(runtime,/\[selectedLocalUrl,motionPreviewUrl,v15PreviewUrl,metaHumanPreviewUrl/)
 assert.match(runtime,/candidate\.startsWith\('blob:'\)/)
 assert.match(runtime,/candidate===v15PreviewUrl\|\|candidate===motionPreviewUrl\|\|candidate===selectedLocalUrl/)
 assert.match(mobile,/tryamm:streetverse-bj-v15-preview/)
 assert.match(ui,/COPY DEVICE QA REPORT/)
})
