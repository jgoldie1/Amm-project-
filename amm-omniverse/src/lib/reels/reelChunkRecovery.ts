// Crash-resistant, per-chunk recovery for active MediaRecorder sessions.
// Browser storage is best-effort: quota errors and a sudden device power loss may
// still lose the most recent segment. A recovered partial container may need repair.
export type PartialReel={blob:Blob;count:number;bytes:number;startedAt:number;mimeType:string}
const DATABASE='tryamm-reel-recovery-v1'
const CHUNKS='recording_chunks'
const META='recording_meta'
function db():Promise<IDBDatabase>{
 return new Promise((resolve,reject)=>{
  if(typeof indexedDB==='undefined')return reject(new Error('Offline recording storage unavailable'))
  const req=indexedDB.open(DATABASE,2)
  req.onupgradeneeded=()=>{
   const d=req.result
   if(!d.objectStoreNames.contains('drafts'))d.createObjectStore('drafts',{keyPath:'id'})
   if(!d.objectStoreNames.contains(CHUNKS))d.createObjectStore(CHUNKS,{keyPath:'sequence'})
   if(!d.objectStoreNames.contains(META))d.createObjectStore(META,{keyPath:'id'})
  }
  req.onerror=()=>reject(req.error||new Error('Could not open local recording storage'))
  req.onsuccess=()=>resolve(req.result)
 })
}
function withStores<T>(mode:IDBTransactionMode,stores:string[],callback:(tx:IDBTransaction,resolve:(v:T)=>void,reject:(e:Error)=>void)=>void):Promise<T>{
 return db().then(d=>new Promise<T>((resolve,reject)=>{
  let completed=false
  const tx=d.transaction(stores,mode)
  const succeed=(value:T)=>{if(!completed){completed=true;resolve(value)}}
  const fail=(e:Error)=>{if(!completed){completed=true;reject(e)}}
  tx.onerror=()=>fail(tx.error||new Error('Local storage transaction failed'))
  tx.onabort=()=>fail(tx.error||new Error('Local storage transaction aborted'))
  tx.addEventListener('complete',()=>d.close())
  tx.addEventListener('abort',()=>d.close())
  callback(tx,succeed,fail)
 }))
}
type Chunk={sequence:number;blob:Blob}
type Metadata={id:'active';startedAt:number;mimeType:string}
export async function recoverPartialReel():Promise<PartialReel|null>{
 return withStores<PartialReel|null>('readonly',[CHUNKS,META],(tx,resolve)=>{
  const rows=tx.objectStore(CHUNKS).getAll()
  const info=tx.objectStore(META).get('active')
  let chunks:Chunk[]=[],meta:Metadata|undefined
  rows.onsuccess=()=>{chunks=rows.result as Chunk[]}
  info.onsuccess=()=>{meta=info.result as Metadata|undefined}
  tx.oncomplete=()=>{
   const valid=chunks.sort((a,b)=>a.sequence-b.sequence).filter(c=>c.blob?.size)
   const bytes=valid.reduce((sum,c)=>sum+c.blob.size,0)
   resolve(bytes?{blob:new Blob(valid.map(x=>x.blob),{type:meta?.mimeType||valid[0].blob.type||'video/webm'}),count:valid.length,bytes,startedAt:meta?.startedAt||0,mimeType:meta?.mimeType||'video/webm'}:null)
  }
 })
}
export async function beginChunkRecording(mimeType:string):Promise<void>{
 if(await recoverPartialReel())throw new Error('An unfinished recording exists. Save/share or clear its recovery copy before making a new recording.')
 return withStores<void>('readwrite',[CHUNKS,META],(tx,resolve)=>{
  tx.objectStore(META).put({id:'active',startedAt:Date.now(),mimeType} satisfies Metadata)
  tx.oncomplete=()=>resolve()
 })
}
export async function appendRecordingChunk(sequence:number,blob:Blob):Promise<void>{
 if(!blob.size)return
 return withStores<void>('readwrite',[CHUNKS],(tx,resolve)=>{
  tx.objectStore(CHUNKS).put({sequence,blob} satisfies Chunk)
  tx.oncomplete=()=>resolve()
 })
}
export async function clearPartialReel():Promise<void>{
 return withStores<void>('readwrite',[CHUNKS,META],(tx,resolve)=>{
  tx.objectStore(CHUNKS).clear()
  tx.objectStore(META).clear()
  tx.oncomplete=()=>resolve()
 })
}
