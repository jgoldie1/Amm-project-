/**
 * Device-local BJ GLB preflight. Checks real glTF 2 binary structure before
 * creating an object URL or invoking GLTFLoader. No network requests.
 * Structural validation is not a claim of visual playback or likeness.
 */
export type BJLocalAssetEvidence={
 ok:true
 meshCount:number
 skinnedMeshCount:number
 joints:number
 animationNames:string[]
 facialTargets:number
 bytes:number
}
export function preflightBJLocalGLB(buffer:ArrayBuffer):BJLocalAssetEvidence{
 const bad=(message:string):never=>{throw new Error('BJ GLB preflight: '+message)}
 if(buffer.byteLength<32||buffer.byteLength>30_000_000)bad('size out of range')
 const view=new DataView(buffer)
 if(view.getUint32(0,true)!==0x46546c67||view.getUint32(4,true)!==2||view.getUint32(8,true)!==buffer.byteLength)bad('invalid glTF v2 header')
 let off=12
 const decoder=new TextDecoder('utf-8',{fatal:true})
 let doc:any=null
 let binaryLength=-1
 let chunks=0
 while(off+8<=buffer.byteLength){
  const len=view.getUint32(off,true),kind=view.getUint32(off+4,true)
  off+=8
  if(len%4!==0||len>buffer.byteLength-off)bad('malformed chunk boundary')
  if(chunks===0&&kind!==0x4e4f534a)bad('first chunk is not JSON')
  if(chunks===1&&kind!==0x004e4942)bad('second chunk is not BIN')
  if(chunks>1)bad('unexpected extra chunk')
  if(kind===0x4e4f534a){
   if(len>4_000_000)bad('JSON too large')
   try{doc=JSON.parse(decoder.decode(new Uint8Array(buffer,off,len)).trim())}
   catch{bad('invalid JSON')}
  }else if(kind===0x004e4942){binaryLength=len}
  off+=len
  chunks++
 }
 if(off!==buffer.byteLength||chunks!==2||!doc||binaryLength<0)bad('missing or truncated data')
 if(doc.asset?.version!=='2.0')bad('unsupported asset version')
 const bounded=(items:any,max:number)=>Array.isArray(items)&&items.length<=max
 if(!bounded(doc.nodes,1500)||!bounded(doc.meshes,600)||!bounded(doc.accessors,7000)||!bounded(doc.bufferViews,7000)||!bounded(doc.animations,120)||!bounded(doc.skins,40))bad('unexpected or excessive model structure')
 if(!Array.isArray(doc.buffers)||doc.buffers.length!==1||doc.buffers[0].uri!==undefined||!Number.isInteger(doc.buffers[0].byteLength)||doc.buffers[0].byteLength>binaryLength)bad('external or invalid buffers')
 for(const resource of [...(doc.images||[]),...(doc.shaders||[])]){
  if(typeof resource.uri==='string')bad('external image or shader reference blocked')
 }
 // No remote links are allowed in any extension payload; runtime is an offline preview.
 const external=(value:any):boolean=>{
  if(!value||typeof value!=='object')return false
  if(Array.isArray(value))return value.some(external)
  for(const [key,v] of Object.entries(value)){
   if(key==='uri'&&typeof v==='string')return true
   if(external(v))return true
  }
  return false
 }
 if(external(doc.extensions||{}))bad('external extension link blocked')
 for(const resource of doc.bufferViews){
  if(resource.buffer!==0||!Number.isInteger(resource.byteLength)||resource.byteLength<0||!Number.isInteger(resource.byteOffset||0)||resource.byteOffset+resource.byteLength>binaryLength)bad('invalid buffer view')
 }
 const joints=(doc.skins||[]).reduce((n:number,s:any)=>Math.max(n,Array.isArray(s.joints)?s.joints.length:0),0)
 if(joints<15)bad('no verified humanoid skin')
 const skinned=(doc.nodes||[]).filter((n:any)=>Number.isInteger(n.skin)&&Number.isInteger(n.mesh))
 const weights=(doc.meshes||[]).some((m:any)=>(m.primitives||[]).some((p:any)=>Number.isInteger(p.attributes?.JOINTS_0)&&Number.isInteger(p.attributes?.WEIGHTS_0)))
 if(!skinned.length||!weights)bad('no deformable skinned mesh weights')
 const animations=(doc.animations||[]).filter((a:any)=>Array.isArray(a.channels)&&a.channels.length>0)
 const names=animations.map((a:any)=>String(a.name||'unnamed'))
 if(!names.some((n:string)=>/idle|stand|breath/i.test(n))||!names.some((n:string)=>/walk|locomotion/i.test(n)))bad('missing idle or walking animation')
 const facialTargets=new Set<string>()
 for(const mesh of doc.meshes||[])for(const target of mesh.extras?.targetNames||[])if(typeof target==='string')facialTargets.add(target)
 return {ok:true,meshCount:doc.meshes.length,skinnedMeshCount:skinned.length,joints,animationNames:names,facialTargets:facialTargets.size,bytes:buffer.byteLength}
}
