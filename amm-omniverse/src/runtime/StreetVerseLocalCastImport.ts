import {STREETVERSE_RECOVERED_CAST} from '../data/StreetVerseRecoveredCastAssets'

type CastRole='bj'|'jacobie'|'lateasia'
type Asset=typeof STREETVERSE_RECOVERED_CAST[CastRole]
const roles=Object.keys(STREETVERSE_RECOVERED_CAST) as CastRole[]
const localUrls=new Map<CastRole,string>()
const MAX_ARCHIVE_BYTES=30_000_000

/** Session-only browser archive import. No network upload, persistence, or public asset hosting. */
export function localRecoveredCastUrl(role:CastRole):string|null{return localUrls.get(role)||null}

function verifyGltf(bytes:Uint8Array,asset:Asset){
 if(bytes.byteLength!==asset.bytes)throw new Error(asset.name+': unexpected file size')
 const data=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength)
 if(data.getUint32(0,true)!==0x46546c67||data.getUint32(4,true)!==2||data.getUint32(8,true)!==bytes.byteLength)throw new Error(asset.name+': invalid GLB header')
 let offset=12,doc:Record<string,unknown>|null=null
 while(offset+8<=bytes.byteLength){
   const length=data.getUint32(offset,true),kind=data.getUint32(offset+4,true)
   offset+=8
   if(length>bytes.byteLength-offset)throw new Error(asset.name+': truncated GLB')
   if(kind===0x4e4f534a)doc=JSON.parse(new TextDecoder().decode(bytes.subarray(offset,offset+length))) as Record<string,unknown>
   offset+=length
 }
 if(!doc||offset!==bytes.byteLength||!Array.isArray(doc.meshes)||!doc.meshes.length||!Array.isArray(doc.skins)||!doc.skins.length||!Array.isArray(doc.animations)||doc.animations.length<asset.animationCount)throw new Error(asset.name+': rig or animation data is incomplete')
}

async function extract(zip:Uint8Array):Promise<Map<CastRole,Uint8Array>>{
 const d=new DataView(zip.buffer,zip.byteOffset,zip.byteLength)
 const u16=(o:number)=>d.getUint16(o,true),u32=(o:number)=>d.getUint32(o,true)
 let end=-1
 for(let i=zip.length-22;i>=Math.max(0,zip.length-65557);i--){if(u32(i)===0x06054b50){end=i;break}}
 if(end<0)throw new Error('The selected file is not a ZIP archive')
 const count=u16(end+10),offset=u32(end+16)
 if(count!==3&&count!==4)throw new Error('Expected exactly three original GLBs (and optional manifest)')
 if(offset>=zip.length)throw new Error('Invalid ZIP directory offset')
 const byFilename=new Map(roles.map(role=>[STREETVERSE_RECOVERED_CAST[role].filename,role]))
 let cursor=offset,manifest=false
 const found=new Map<CastRole,Uint8Array>()
 for(let i=0;i<count;i++){
  if(cursor+46>zip.length||u32(cursor)!==0x02014b50)throw new Error('Invalid ZIP directory')
  const method=u16(cursor+10),size=u32(cursor+24),packed=u32(cursor+20)
  const n=u16(cursor+28),extra=u16(cursor+30),comment=u16(cursor+32),local=u32(cursor+42)
  const name=new TextDecoder().decode(zip.subarray(cursor+46,cursor+46+n))
  cursor+=46+n+extra+comment
  if(name==='asset-manifest.json'&&!manifest){manifest=true;continue}
  const role=byFilename.get(name)
  if(!role||found.has(role))throw new Error('Unexpected or duplicate archive entry: '+name)
  const asset=STREETVERSE_RECOVERED_CAST[role]
  if(size!==asset.bytes||packed>MAX_ARCHIVE_BYTES||local+30>zip.length||u32(local)!==0x04034b50)throw new Error('Invalid GLB ZIP entry '+name)
  const start=local+30+u16(local+26)+u16(local+28)
  if(start+packed>zip.length)throw new Error('Truncated archive entry '+name)
  const chunk=zip.subarray(start,start+packed)
  let raw:Uint8Array
  if(method===0)raw=chunk.slice()
  else if(method===8){
   if(typeof DecompressionStream==='undefined')throw new Error('This browser cannot decompress ZIP files. Use Chrome on the Chromebook.')
   const stream=new Blob([new Uint8Array(chunk)]).stream().pipeThrough(new DecompressionStream('deflate-raw'))
   raw=new Uint8Array(await new Response(stream).arrayBuffer())
  }else throw new Error('Unsupported ZIP compression: '+method)
  if(raw.length!==asset.bytes)throw new Error('Decompressed file size mismatch: '+name)
  verifyGltf(raw,asset)
  const digest=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new Uint8Array(raw)))).map(b=>b.toString(16).padStart(2,'0')).join('')
  if(digest!==asset.sha256)throw new Error('Original character hash mismatch: '+name)
  found.set(role,raw)
 }
 if(found.size!==3)throw new Error('ZIP must contain BJ V15, Jacobie and LaTeasia originals')
 return found
}

/** Apply only after every file passes cryptographic hash and GLB structure checks. */
export async function importOriginalCastZip(file:File):Promise<void>{
 if(file.size>MAX_ARCHIVE_BYTES)throw new Error('ZIP exceeds the 30 MB safety limit')
 if(!crypto?.subtle)throw new Error('Secure browser context required for SHA-256 verification')
 const zip=new Uint8Array(await file.arrayBuffer())
 const files=await extract(zip)
 const urls=new Map<CastRole,string>()
 try{
  for(const [role,bytes] of files)urls.set(role,URL.createObjectURL(new Blob([new Uint8Array(bytes)],{type:'model/gltf-binary'})))
  for(const [role,url] of urls){const prior=localUrls.get(role);localUrls.set(role,url);if(prior)URL.revokeObjectURL(prior)}
  window.dispatchEvent(new CustomEvent('tryamm:streetverse-recovered-cast-local-import',{detail:{roles,verified:true,sessionOnly:true}}))
 }catch(e){for(const url of urls.values())URL.revokeObjectURL(url);throw e}
}
