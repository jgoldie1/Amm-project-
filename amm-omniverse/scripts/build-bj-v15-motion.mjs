#!/usr/bin/env node
/**
 * Original TRYAMM V15 motion enhancer.
 * Preserves the recovered GLB's mesh, skin, textures and facial morphs.
 * Adds a distinctly named retimed-walk run *placeholder*, not motion capture.
 *
 * Usage:
 * node scripts/build-bj-v15-motion.mjs <recovered-BJ-V15.glb> <out.glb>
 * Never silently publish a private likeness or modify the original source.
 */
import fs from 'node:fs'
import path from 'node:path'
import {fileURLToPath} from 'node:url'

const JSON_CHUNK=0x4e4f534a, BIN_CHUNK=0x004e4942
const pad4=n=>(n+3)&~3
export function augmentBJ15Motion(input){
 const bytes=Buffer.from(input)
 if(bytes.length<32||bytes.toString('ascii',0,4)!=='glTF'||bytes.readUInt32LE(4)!==2||bytes.readUInt32LE(8)!==bytes.length)throw Error('Invalid GLB v2')
 let offset=12;const chunks=[]
 while(offset+8<=bytes.length){
  const length=bytes.readUInt32LE(offset),type=bytes.readUInt32LE(offset+4);offset+=8
  if(offset+length>bytes.length)throw Error('Truncated GLB chunk')
  chunks.push({type,data:bytes.subarray(offset,offset+length)});offset+=length
 }
 if(offset!==bytes.length||chunks.length!==2||chunks[0].type!==JSON_CHUNK||chunks[1].type!==BIN_CHUNK)throw Error('Only canonical two-chunk GLBs supported')
 const source=JSON.parse(chunks[0].data.toString('utf8'))
 if(!Array.isArray(source.skins)||source.skins.every(s=>(s.joints||[]).length<15))throw Error('Expected genuine V15 humanoid skeleton')
 const walk=(source.animations||[]).find(a=>/walk/i.test(a.name||'')&&a.channels?.length>0)
 if(!walk)throw Error('Source has no walking animation to retime')
 if(source.animations.some(a=>a.name==='BJ_Run_Cycle_Fallback_From_Walk_0p68x'))return bytes
 const doc=structuredClone(source),binParts=[Buffer.from(chunks[1].data)]
 let binarySize=binParts[0].length
 const remap=new Map()
 for(const oldIndex of [...new Set(walk.samplers.map(s=>s.input))]){
  const accessor=doc.accessors[oldIndex],view=doc.bufferViews[accessor?.bufferView]
  if(!accessor||!view||accessor.componentType!==5126||accessor.type!=='SCALAR'||view.byteStride&&view.byteStride!==4)throw Error('Unsupported animation time accessor')
  const count=accessor.count,from=(view.byteOffset||0)+(accessor.byteOffset||0)
  if(from<0||from+4*count>binParts[0].length||count<2)throw Error('Animation time data out of bounds')
  const times=new Float32Array(count)
  let previous=-Infinity
  for(let i=0;i<count;i++){const t=binParts[0].readFloatLE(from+i*4);if(!Number.isFinite(t)||t<previous)throw Error('Bad animation time');times[i]=t*.68;previous=t}
  const alignment=pad4(binarySize)-binarySize
  if(alignment){binParts.push(Buffer.alloc(alignment));binarySize+=alignment}
  const packed=Buffer.alloc(count*4)
  for(let i=0;i<count;i++)packed.writeFloatLE(times[i],i*4)
  const viewIndex=doc.bufferViews.push({buffer:0,byteOffset:binarySize,byteLength:packed.length})-1
  binParts.push(packed);binarySize+=packed.length
  const copy={...accessor,bufferView:viewIndex,min:[times[0]],max:[times[times.length-1]]}
  delete copy.byteOffset
  const newIndex=doc.accessors.push(copy)-1
  remap.set(oldIndex,newIndex)
 }
 const added=structuredClone(walk)
 added.name='BJ_Run_Cycle_Fallback_From_Walk_0p68x'
 added.extras={status:'retimed-walk-not-captured-running',sourceClip:walk.name,createdBy:'TRYAMM'}
 for(const sampler of added.samplers)sampler.input=remap.get(sampler.input)
 doc.animations.push(added)
 doc.asset={...doc.asset,generator:'TRYAMM V15 motion enhancer',extras:{...doc.asset?.extras,derivedFrom:'recovered V15 GLB',runFallback:'retimed-walk',likenessCertified:false}}
 const tail=pad4(binarySize)-binarySize
 if(tail){binParts.push(Buffer.alloc(tail));binarySize+=tail}
 const bin=Buffer.concat(binParts)
 doc.buffers[0].byteLength=bin.length
 const rawJson=Buffer.from(JSON.stringify(doc))
 const paddedJson=Buffer.concat([rawJson,Buffer.alloc(pad4(rawJson.length)-rawJson.length,0x20)])
 const total=12+8+paddedJson.length+8+bin.length
 const output=Buffer.alloc(total)
 output.write('glTF',0,'ascii');output.writeUInt32LE(2,4);output.writeUInt32LE(total,8)
 output.writeUInt32LE(paddedJson.length,12);output.writeUInt32LE(JSON_CHUNK,16);paddedJson.copy(output,20)
 const at=20+paddedJson.length
 output.writeUInt32LE(bin.length,at);output.writeUInt32LE(BIN_CHUNK,at+4);bin.copy(output,at+8)
 return output
}
const executable=process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)
if(executable){
 const [source,target]=process.argv.slice(2)
 if(!source||!target){console.error('Usage: node scripts/build-bj-v15-motion.mjs SOURCE.glb TARGET.glb');process.exitCode=2}
 else{
  const bytes=augmentBJ15Motion(fs.readFileSync(source))
  fs.mkdirSync(path.dirname(target),{recursive:true})
  fs.writeFileSync(target,bytes)
  console.log(JSON.stringify({target,bytes:bytes.length,status:'rigged-motion-preview',photorealisticCertified:false,runIsRetimedWalk:true}))
 }
}
