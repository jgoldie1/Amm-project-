import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import {inspectHoloCADGLB,HOLOCAD_GLB_MAX_BYTES} from '../src/game/holocad/holocadGLBInspector.ts'

function tinyGLB(data,withBin=false){
 const text=new TextEncoder().encode(JSON.stringify(data))
 const padding=(4-text.length%4)%4
 const jsonLength=text.length+padding
 const binLength=withBin?4:0
 const total=12+8+jsonLength+(withBin?8+binLength:0)
 const buffer=new ArrayBuffer(total)
 const view=new DataView(buffer)
 view.setUint32(0,0x46546c67,true)
 view.setUint32(4,2,true)
 view.setUint32(8,total,true)
 view.setUint32(12,jsonLength,true)
 view.setUint32(16,0x4e4f534a,true)
 const json=new Uint8Array(buffer,20,jsonLength)
 json.fill(32)
 json.set(text,0)
 if(withBin){
  const offset=20+jsonLength
  view.setUint32(offset,binLength,true)
  view.setUint32(offset+4,0x004e4942,true)
 }
 return buffer
}

const base={
 asset:{version:'2.0',generator:'HoloCAD regression fixture'},
 meshes:[{name:'airframe'}],
 nodes:[{name:'Root'}],
 skins:[{name:'Rig'}],
 materials:[{name:'Blue'}],
 scenes:[{nodes:[0]}],
 animations:[
  {name:'JointRotation',channels:[{},{}],samplers:[{}]},
  {name:'DeployPanel',channels:[{}],samplers:[{}]}
 ]
}

test('reports GLB2 structure, animations and rig without assuming a gameplay install',()=>{
 const valid=inspectHoloCADGLB(tinyGLB(base,true))
 assert.equal(valid.glbVersion,2)
 assert.equal(valid.meshes,1)
 assert.equal(valid.nodes,1)
 assert.equal(valid.skins,1)
 assert.equal(valid.animations,2)
 assert.equal(valid.materials,1)
 assert.equal(valid.scenes,1)
 assert.equal(valid.clips[0].name,'JointRotation')
 assert.equal(valid.clips[0].channels,2)
 assert.equal(valid.externalResources,0)
 assert.equal(valid.safeForOfflineStaging,true)
 assert.ok(valid.notes.some(note=>note.includes('rights')))
})

test('detects external resources but does not fetch or load them',()=>{
 const data={...base,buffers:[{uri:'https://example.invalid/mesh.bin',byteLength:40}],
  images:[{uri:'https://example.invalid/texture.png'}]}
 const result=inspectHoloCADGLB(tinyGLB(data))
 assert.equal(result.externalResources,2)
 assert.equal(result.safeForOfflineStaging,false)
 assert.ok(result.notes.some(note=>note.includes('external')))
})

test('rejects malformed GLB header, JSON version and chunks',()=>{
 const good=tinyGLB(base)
 const badMagic=good.slice(0)
 new DataView(badMagic).setUint32(0,0,false)
 assert.throws(()=>inspectHoloCADGLB(badMagic),/magic/)
 const badSize=good.slice(0)
 new DataView(badSize).setUint32(8,33,true)
 assert.throws(()=>inspectHoloCADGLB(badSize),/length/)
 const old=tinyGLB({...base,asset:{version:'1.0'}})
 assert.throws(()=>inspectHoloCADGLB(old),/asset_version/)
 const firstBin=good.slice(0)
 new DataView(firstBin).setUint32(16,0x004e4942,true)
 assert.throws(()=>inspectHoloCADGLB(firstBin),/first_glb_chunk/)
 const truncated=good.slice(0)
 new DataView(truncated).setUint32(12,0xffffffff,true)
 assert.throws(()=>inspectHoloCADGLB(truncated),/invalid_glb_chunk_length/)
 assert.throws(()=>inspectHoloCADGLB(new ArrayBuffer(3)),/truncated/)
})

test('asset inspector is no-network and has clear staging-only boundaries',()=>{
 const viewer=fs.readFileSync(new URL('../src/components/StreetVerseHoloCADLivingSystemsLab.tsx',import.meta.url),'utf8')
 const ui=fs.readFileSync(new URL('../src/components/HoloCADGLBAssetInspector.tsx',import.meta.url),'utf8')
 const engine=fs.readFileSync(new URL('../src/game/holocad/holocadGLBInspector.ts',import.meta.url),'utf8')
 assert.equal(HOLOCAD_GLB_MAX_BYTES,24*1024*1024)
 for(const token of [
  "lazy(()=>import('./HoloCADGLBAssetInspector'))",
  '📦 INSPECT GLB ASSET','showGLB&&<Suspense','<HoloCADGLBAssetInspector subject={subject} onClose'
 ]){
  assert.ok(viewer.includes(token),'GLB staging not mounted '+token)
 }
 for(const token of [
  'accept=".glb,model/gltf-binary"','file.arrayBuffer()',
  'inspectHoloCADGLB','No cloud upload','not render, retarget, publish'
 ]){
  assert.ok(ui.includes(token),'No-upload asset gate missing '+token)
 }
 assert.equal(ui.includes('fetch('),false)
 assert.equal(engine.includes('fetch('),false)
 assert.equal(ui.includes('localStorage'),false)
 assert.equal(ui.includes('GLTFLoader'),false,'No unreviewed 3D assets are loaded directly into StreetVerse gameplay')
})
