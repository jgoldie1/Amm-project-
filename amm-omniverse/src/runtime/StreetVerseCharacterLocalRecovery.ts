/** User-controlled, device-local original character recovery.
 * No upload to backend; avoids broken published GLB URLs. IndexedDB can be evicted
 * by private browsing/storage pressure, so report successful storage only after readback.
 */
import {STREETVERSE_RECOVERED_THREE_CAST} from '../data/StreetVerseRecoveredThreeCast'
const DB='streetverse-character-local-assets-v1'
const STORE='glbs'
export type CastImportResult={name:string;id:string;size:number;stored:boolean;error?:string}
export const CAST_FILES=STREETVERSE_RECOVERED_THREE_CAST.map(x=>({id:x.id,name:x.name,file:x.url.split('/').pop()!}))
const CAST_IMPORT_ALIASES:Record<string,string>={
 'LaTeasia_Monroe_Textured_Seven_Motion_Recovery.glb':'lateasia-monroe',
}
const LATEASIA_TEXTURED_SHA256='e5799b3daf6ebb26cd12c6f7a7f5ba9c4a3c6711d4a6e00eeb9a2263d27762fa'
async function verifyTexturedRecovery(filename:string,bytes:ArrayBuffer){
 if(filename.split('/').pop()!=='LaTeasia_Monroe_Textured_Seven_Motion_Recovery.glb')return
 if(!globalThis.crypto?.subtle)throw Error('Secure browser required to verify the recovery GLB')
 const hash=await crypto.subtle.digest('SHA-256',bytes)
 const hex=Array.from(new Uint8Array(hash),n=>n.toString(16).padStart(2,'0')).join('')
 if(hex!==LATEASIA_TEXTURED_SHA256)throw Error('Textured LaTeasia file does not match the verified Library recovery')
}
function characterForFilename(filename:string){
 const base=filename.split('/').pop()||''
 const alias=CAST_IMPORT_ALIASES[base]
 return alias?CAST_FILES.find(x=>x.id===alias):CAST_FILES.find(x=>x.file===base)
}
function dbOpen():Promise<IDBDatabase>{
 return new Promise((resolve,reject)=>{
  const request=indexedDB.open(DB,1)
  request.onupgradeneeded=()=>{const db=request.result;if(!db.objectStoreNames.contains(STORE))db.createObjectStore(STORE)}
  request.onsuccess=()=>resolve(request.result)
  request.onerror=()=>reject(request.error||Error('IndexedDB unavailable'))
 })
}
async function storeAsset(name:string,bytes:ArrayBuffer){
 const db=await dbOpen()
 try{
  await new Promise<void>((resolve,reject)=>{
   const tx=db.transaction(STORE,'readwrite')
   tx.objectStore(STORE).put(bytes,name)
   tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error||Error('Save failed'));tx.onabort=()=>reject(tx.error||Error('Save aborted'))
  })
 }finally{db.close()}
}
export async function storeLocalCastAsset(id:string,bytes:ArrayBuffer):Promise<void>{
 const entry=CAST_FILES.find(x=>x.id===id)
 if(!entry)throw Error('Unknown StreetVerse character')
 if(!checkGLB(bytes))throw Error('Invalid GLB file')
 await storeAsset(entry.file,bytes)
 const stored=await readLocalCastAsset(id)
 if(!stored||stored.byteLength!==bytes.byteLength)throw Error('Device storage verification failed')
}

export async function readLocalCastAsset(id:string):Promise<ArrayBuffer|null>{
 const entry=CAST_FILES.find(x=>x.id===id)
 if(!entry||typeof indexedDB==='undefined')return null
 const db=await dbOpen()
 try{
  return await new Promise((resolve,reject)=>{
   const req=db.transaction(STORE,'readonly').objectStore(STORE).get(entry.file)
   req.onsuccess=()=>resolve(req.result instanceof ArrayBuffer?req.result:null)
   req.onerror=()=>reject(req.error||Error('Read failed'))
  })
 }finally{db.close()}
}
function checkGLB(bytes:ArrayBuffer){
 return bytes.byteLength>20&&new DataView(bytes).getUint32(0,true)===0x46546c67&&new DataView(bytes).getUint32(4,true)===2
}
async function loadZipEntries(zip:ArrayBuffer):Promise<Array<{filename:string;bytes:ArrayBuffer}>>{
 const v=new DataView(zip),out:Array<{filename:string;bytes:ArrayBuffer}>=[]
 // Read ZIP central directory; avoid inflated, fake or arbitrary-size input.
 let end=-1
 for(let i=zip.byteLength-22;i>=Math.max(0,zip.byteLength-65557);i--){
  if(v.getUint32(i,true)===0x06054b50){end=i;break}
 }
 if(end<0)throw Error('Not a ZIP archive')
 const count=v.getUint16(end+10,true),start=v.getUint32(end+16,true)
 if(count>500)throw Error('Too many ZIP entries')
 let pos=start
 for(let i=0;i<count;i++){
  if(pos+46>zip.byteLength||v.getUint32(pos,true)!==0x02014b50)throw Error('Broken ZIP directory')
  const method=v.getUint16(pos+10,true),size=v.getUint32(pos+20,true),raw=v.getUint32(pos+24,true)
  const nameSize=v.getUint16(pos+28,true),extra=v.getUint16(pos+30,true),comment=v.getUint16(pos+32,true)
  const local=v.getUint32(pos+42,true)
  const filename=new TextDecoder().decode(new Uint8Array(zip,pos+46,nameSize))
  pos+=46+nameSize+extra+comment
  if(!characterForFilename(filename))continue
  if(raw>12_000_000||size>15_000_000)throw Error('Character file exceeds 15 MB limit')
  if(local+30>zip.byteLength||v.getUint32(local,true)!==0x04034b50)throw Error('Invalid ZIP local header')
  const dataStart=local+30+v.getUint16(local+26,true)+v.getUint16(local+28,true)
  if(dataStart+size>zip.byteLength)throw Error('Truncated ZIP data')
  const payload=new Uint8Array(zip.slice(dataStart,dataStart+size))
  let decoded:ArrayBuffer
  if(method===0)decoded=payload.buffer
  else if(method===8){
   if(typeof DecompressionStream==='undefined')throw Error('ZIP decompression unavailable. Unzip with Files, then import individual GLBs.')
   try{
    const stream=new Blob([payload]).stream().pipeThrough(new DecompressionStream('deflate-raw'))
    decoded=await new Response(stream).arrayBuffer()
   }catch{throw Error('This browser cannot unpack deflate ZIP. Unzip in Files and select the three GLBs.')}
  }else throw Error('Unsupported ZIP compression')
  if(decoded.byteLength!==raw||!checkGLB(decoded))throw Error('Corrupt original character model: '+filename)
  out.push({filename,bytes:decoded})
 }
 return out
}
export async function importStreetVerseCharacterFiles(files:FileList|File[]):Promise<CastImportResult[]>{
 const result:CastImportResult[]=[]
 if(typeof indexedDB==='undefined')throw Error('This browser does not support persistent device storage')
 for(const file of Array.from(files)){
  let entries:Array<{filename:string;bytes:ArrayBuffer}>=[]
  if(file.name.toLowerCase().endsWith('.zip'))entries=await loadZipEntries(await file.arrayBuffer())
  else if(file.name.toLowerCase().endsWith('.glb'))entries=[{filename:file.name,bytes:await file.arrayBuffer()}]
  for(const item of entries){
   const info=characterForFilename(item.filename)
   if(!info)continue
   try{
    if(!checkGLB(item.bytes))throw Error('Invalid GLB')
    await verifyTexturedRecovery(item.filename,item.bytes)
    await storeAsset(info.file,item.bytes)
    const stored=await readLocalCastAsset(info.id)
    if(!stored||stored.byteLength!==item.bytes.byteLength)throw Error('Device storage verification failed')
    result.push({id:info.id,name:info.name,size:item.bytes.byteLength,stored:true})
   }catch(e){result.push({id:info.id,name:info.name,size:item.bytes.byteLength,stored:false,error:String(e)})}
  }
 }
 if(!result.length)throw Error('No matching restored character models found in the selected files')
 return result
}
