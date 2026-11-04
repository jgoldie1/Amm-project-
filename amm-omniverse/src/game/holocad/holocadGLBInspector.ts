/**
 * HoloCAD LOCAL GLB/2 inspector: validates container metadata only.
 * Does not load or execute 3D content; does not authenticate license or
 * confirm skeleton/animation compatibility. No network requests.
 */
export const HOLOCAD_GLB_MAX_BYTES=24*1024*1024
export type HoloCADGLBInspection={
 glbVersion:2
 bytes:number
 meshes:number
 nodes:number
 skins:number
 animations:number
 materials:number
 scenes:number
 clips:Array<{name:string;channels:number}>
 externalResources:number
 safeForOfflineStaging:boolean
 notes:string[]
}
type ObjectRecord=Record<string,unknown>
const object=(v:unknown):v is ObjectRecord=>v!==null&&typeof v==='object'&&!Array.isArray(v)
const list=(v:unknown):unknown[]=>Array.isArray(v)?v:[]
const nameOf=(value:unknown)=>object(value)&&typeof value.name==='string'?value.name.slice(0,100):'(unnamed)'
const utf8=new TextDecoder('utf-8',{fatal:true})
const uint32=(v:DataView,offset:number)=>v.getUint32(offset,true)

export function inspectHoloCADGLB(buffer:ArrayBuffer):HoloCADGLBInspection{
 if(!(buffer instanceof ArrayBuffer)||buffer.byteLength<20)throw Error('invalid_or_truncated_glb')
 if(buffer.byteLength>HOLOCAD_GLB_MAX_BYTES)throw Error('glb_exceeds_24mib_local_limit')
 const view=new DataView(buffer)
 if(uint32(view,0)!==0x46546c67)throw Error('invalid_glb_magic')
 if(uint32(view,4)!==2)throw Error('unsupported_glb_version')
 if(uint32(view,8)!==buffer.byteLength)throw Error('glb_declared_length_mismatch')
 let offset=12
 let json:ObjectRecord|null=null
 let first=true
 let chunks=0
 let binChunks=0
 while(offset<buffer.byteLength){
  if(offset+8>buffer.byteLength)throw Error('truncated_glb_chunk_header')
  const length=uint32(view,offset)
  const type=uint32(view,offset+4)
  offset+=8
  if(length%4!==0||offset+length>buffer.byteLength)throw Error('invalid_glb_chunk_length')
  if(first){
   if(type!==0x4e4f534a)throw Error('first_glb_chunk_must_be_json')
   if(length>2*1024*1024)throw Error('glb_json_metadata_too_large')
   const string=utf8.decode(new Uint8Array(buffer,offset,length)).trim()
   let decoded:unknown
   try{decoded=JSON.parse(string)}catch{throw Error('invalid_glb_json')}
   if(!object(decoded))throw Error('glb_json_root_must_be_object')
   json=decoded
   first=false
  }else{
   if(type===0x004e4942)binChunks++
   else throw Error('unexpected_glb_chunk_type')
  }
  chunks++;offset+=length
 }
 if(offset!==buffer.byteLength||!json||chunks<1||binChunks>1)throw Error('invalid_glb_chunk_structure')
 const asset=json.asset
 if(!object(asset)||asset.version!=='2.0')throw Error('invalid_gltf_asset_version')
 const buffers=list(json.buffers),images=list(json.images)
 const uris=[...buffers,...images].filter(object).map(item=>item.uri)
 const externalResources=uris.filter(uri=>typeof uri==='string'&&!uri.startsWith('data:')).length
 const clips=list(json.animations).map(a=>({
  name:nameOf(a),
  channels:object(a)?list(a.channels).length:0
 }))
 const notes=[
  'GLB container only: real geometry, rig shape, rights and animation playback still require a separate visual test.',
  'No source ownership, artist consent, license, flight or medical safety can be inferred from file metadata.'
 ]
 if(externalResources)notes.push('Found '+externalResources+' external resource reference(s); do not load remotely without review.')
 if(!clips.length)notes.push('No animation clips declared in this model.')
 if(!list(json.skins).length)notes.push('No GLTF skin declared; this model may be static or use non-skinned animation.')
 return{
  glbVersion:2,bytes:buffer.byteLength,
  meshes:list(json.meshes).length,
  nodes:list(json.nodes).length,
  skins:list(json.skins).length,
  animations:clips.length,
  materials:list(json.materials).length,
  scenes:list(json.scenes).length,
  clips,externalResources,
  safeForOfflineStaging:externalResources===0,
  notes
 }
}
