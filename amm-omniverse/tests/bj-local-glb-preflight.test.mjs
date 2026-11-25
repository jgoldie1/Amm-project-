import test from 'node:test'
import assert from 'node:assert/strict'
import {build} from 'esbuild'
import {createBJOriginalRiggedGLB} from '../scripts/build-bj-original-rigged-glb.mjs'
import {augmentBJ15Motion} from '../scripts/build-bj-v15-motion.mjs'

const result=await build({entryPoints:[new URL('../src/runtime/StreetVerseBJLocalAssetPreflight.ts',import.meta.url).pathname],bundle:true,platform:'node',format:'esm',write:false,logLevel:'silent'})
const {preflightBJLocalGLB}=await import('data:text/javascript;base64,'+Buffer.from(result.outputFiles[0].text).toString('base64'))
const asAB=bytes=>bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength)

test('BJ original fallback and enhanced motions contain usable embedded skin and walk animation',()=>{
 for(const bytes of [createBJOriginalRiggedGLB(),augmentBJ15Motion(createBJOriginalRiggedGLB())]){
  const result=preflightBJLocalGLB(asAB(bytes))
  assert.equal(result.ok,true)
  assert.ok(result.joints>=17)
  assert.ok(result.skinnedMeshCount>=1)
  assert.ok(result.animationNames.some(s=>/walk/i.test(s)))
 }
})

test('reject invalid GLB before any object URL allocation',()=>{
 const bytes=createBJOriginalRiggedGLB()
 for(const changed of [
  (()=>{const b=Buffer.from(bytes);b.write('nope',0);return b})(),
  (()=>{const b=Buffer.from(bytes);b.writeUInt32LE(b.length+1,8);return b})(),
  bytes.subarray(0,bytes.length-3),
 ]){
  assert.throws(()=>preflightBJLocalGLB(asAB(changed)),/BJ GLB preflight/)
 }
})

test('reject external URI and unskinned assets from otherwise valid GLB',()=>{
 const original=createBJOriginalRiggedGLB()
 const jsonLength=original.readUInt32LE(12)
 const originalJSON=JSON.parse(original.toString('utf8',20,20+jsonLength))
 // Re-serialize a modified GLB while preserving binary chunk.
 const modified=(patch)=>{
  const doc=structuredClone(originalJSON);patch(doc)
  const json=Buffer.from(JSON.stringify(doc))
  const padded=Buffer.concat([json,Buffer.alloc((4-json.length%4)%4,32)])
  const binary=original.subarray(20+jsonLength)
  const out=Buffer.alloc(20+padded.length+binary.length)
  out.write('glTF',0,'ascii');out.writeUInt32LE(2,4);out.writeUInt32LE(out.length,8)
  out.writeUInt32LE(padded.length,12);out.writeUInt32LE(0x4e4f534a,16)
  padded.copy(out,20);binary.copy(out,20+padded.length)
  return asAB(out)
 }
 assert.throws(()=>preflightBJLocalGLB(modified(doc=>{doc.images=[{uri:'https://example.org/track.png'}]})),/external image/)
 assert.throws(()=>preflightBJLocalGLB(modified(doc=>{doc.skins=[]})),/humanoid skin/)
 assert.throws(()=>preflightBJLocalGLB(modified(doc=>{doc.animations=[]})),/idle or walking/)
})
