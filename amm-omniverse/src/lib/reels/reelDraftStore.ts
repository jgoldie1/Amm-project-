// Local recovery for unfinished reels. IndexedDB keeps blobs across reloads without
// sending private camera recordings to remote services.
export type ReelDraft={id:string;blob:Blob;createdAt:number;mimeType:string}
const DB='tryamm-reel-recovery-v1',STORE='drafts';
function openDb():Promise<IDBDatabase>{
 return new Promise((resolve,reject)=>{
  if(typeof indexedDB==='undefined')return reject(new Error('Offline reel recovery is not supported on this browser'));
  const req=indexedDB.open(DB,1);
  req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains(STORE))req.result.createObjectStore(STORE,{keyPath:'id'})};
  req.onsuccess=()=>resolve(req.result);
  req.onerror=()=>reject(req.error||new Error('Offline recovery storage failed'));
 })
}
async function transaction<T>(mode:IDBTransactionMode,action:(store:IDBObjectStore,resolve:(value:T)=>void,reject:(error:Error)=>void)=>void):Promise<T>{
 const db=await openDb();
 try{return await new Promise<T>((resolve,reject)=>{
  const tx=db.transaction(STORE,mode),store=tx.objectStore(STORE);
  tx.onerror=()=>reject(tx.error||new Error('Reel draft storage transaction failed'));
  action(store,resolve,reject);
 })}finally{db.close()}
}
export async function saveReelDraft(blob:Blob):Promise<void>{
 if(!blob.size)throw new Error('Cannot recover an empty reel');
 return transaction<void>('readwrite',(store,resolve,reject)=>{
  const req=store.put({id:'latest',blob,createdAt:Date.now(),mimeType:blob.type||'video/webm'} satisfies ReelDraft);
  req.onsuccess=()=>resolve();req.onerror=()=>reject(req.error||new Error('Could not save the reel draft'))
 })
}
export async function loadReelDraft():Promise<ReelDraft|null>{
 return transaction<ReelDraft|null>('readonly',(store,resolve,reject)=>{
  const req=store.get('latest');
  req.onsuccess=()=>resolve(req.result||null);req.onerror=()=>reject(req.error||new Error('Could not recover the reel draft'))
 })
}
export async function clearReelDraft():Promise<void>{
 return transaction<void>('readwrite',(store,resolve,reject)=>{
  const req=store.delete('latest');req.onsuccess=()=>resolve();req.onerror=()=>reject(req.error||new Error('Could not clear the reel draft'))
 })
}
