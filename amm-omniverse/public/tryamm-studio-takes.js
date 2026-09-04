(()=>{
  const VERSION='20260903-studio-takes-v1'
  const DB='tryamm-studio-take-vault',STORE='takes',MAX_SLOTS=64
  let dbPromise=null,recorder=null,chunks=[],stream=null,recordingMeta=null,startedAt=0
  const uid=()=>`TAKE-${Date.now()}-${Math.random().toString(36).slice(2,7)}`
  function db(){
    if(dbPromise)return dbPromise
    dbPromise=new Promise((resolve,reject)=>{const r=indexedDB.open(DB,1);r.onupgradeneeded=()=>{const d=r.result;if(!d.objectStoreNames.contains(STORE)){const s=d.createObjectStore(STORE,{keyPath:'id'});s.createIndex('trackId','trackId',{unique:false});s.createIndex('slot','slot',{unique:false});s.createIndex('createdAt','createdAt',{unique:false})}};r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)})
    return dbPromise
  }
  async function put(item){const d=await db();return new Promise((resolve,reject)=>{const tx=d.transaction(STORE,'readwrite'),r=tx.objectStore(STORE).put(item);r.onsuccess=()=>resolve(item);r.onerror=()=>reject(r.error)})}
  async function get(id){const d=await db();return new Promise((resolve,reject)=>{const r=d.transaction(STORE).objectStore(STORE).get(id);r.onsuccess=()=>resolve(r.result||null);r.onerror=()=>reject(r.error)})}
  async function list(){const d=await db();return new Promise((resolve,reject)=>{const r=d.transaction(STORE).objectStore(STORE).getAll();r.onsuccess=()=>resolve((r.result||[]).sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt))));r.onerror=()=>reject(r.error)})}
  async function remove(id){const d=await db();return new Promise((resolve,reject)=>{const r=d.transaction(STORE,'readwrite').objectStore(STORE).delete(id);r.onsuccess=()=>resolve(true);r.onerror=()=>reject(r.error)})}
  async function clear(){const d=await db();return new Promise((resolve,reject)=>{const r=d.transaction(STORE,'readwrite').objectStore(STORE).clear();r.onsuccess=()=>resolve(true);r.onerror=()=>reject(r.error)})}
  function bestMime(){const choices=['audio/mp4','audio/webm;codecs=opus','audio/webm','audio/ogg;codecs=opus'];return choices.find(t=>window.MediaRecorder?.isTypeSupported?.(t))||''}
  function ext(type=''){if(type.includes('mp4'))return 'm4a';if(type.includes('ogg'))return 'ogg';if(type.includes('webm'))return 'webm';return 'audio'}
  async function start(input={}){
    if(recorder?.state==='recording')throw new Error('already-recording')
    if(!navigator.mediaDevices?.getUserMedia||!window.MediaRecorder)throw new Error('browser-recording-not-supported')
    const slot=Math.max(1,Math.min(MAX_SLOTS,Number(input.slot)||1));stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:false,noiseSuppression:false,autoGainControl:false},video:false})
    const mime=bestMime();recorder=mime?new MediaRecorder(stream,{mimeType:mime}):new MediaRecorder(stream);chunks=[];startedAt=Date.now();recordingMeta={id:uid(),slot,trackId:String(input.trackId||''),name:String(input.name||`Take ${slot}`),createdAt:new Date().toISOString(),source:'microphone',mimeType:recorder.mimeType||mime||'audio/webm'}
    recorder.ondataavailable=e=>{if(e.data?.size)chunks.push(e.data)}
    recorder.start(500)
    window.dispatchEvent(new CustomEvent('tryamm:studio-recording-started',{detail:{slot,trackId:recordingMeta.trackId,mimeType:recordingMeta.mimeType}}))
    return {...recordingMeta}
  }
  async function stop(){
    if(!recorder||recorder.state!=='recording')throw new Error('not-recording')
    const done=new Promise((resolve,reject)=>{recorder.onstop=async()=>{try{const blob=new Blob(chunks,{type:recordingMeta.mimeType||chunks[0]?.type||'audio/webm'}),durationMs=Date.now()-startedAt,item={...recordingMeta,mimeType:blob.type||recordingMeta.mimeType,size:blob.size,durationMs,blob};await put(item);resolve({...item,blob:undefined})}catch(e){reject(e)}finally{stream?.getTracks?.().forEach(t=>t.stop());stream=null;recorder=null;chunks=[];recordingMeta=null}}});recorder.stop();const out=await done;window.dispatchEvent(new CustomEvent('tryamm:studio-recording-saved',{detail:out}));return out
  }
  function cancel(){if(recorder?.state==='recording'){recorder.onstop=()=>{};recorder.stop()}stream?.getTracks?.().forEach(t=>t.stop());stream=null;recorder=null;chunks=[];recordingMeta=null;return true}
  async function importFile(file,input={}){
    if(!(file instanceof Blob))throw new Error('file-required')
    const slot=Math.max(1,Math.min(MAX_SLOTS,Number(input.slot)||1)),item={id:uid(),slot,trackId:String(input.trackId||''),name:String(input.name||file.name||`Imported Take ${slot}`),createdAt:new Date().toISOString(),source:'import',mimeType:file.type||'application/octet-stream',size:file.size,durationMs:0,originalFileName:file.name||'',blob:file};await put(item);window.dispatchEvent(new CustomEvent('tryamm:studio-take-imported',{detail:{...item,blob:undefined}}));return {...item,blob:undefined}
  }
  async function objectUrl(id){const item=await get(id);return item?.blob?URL.createObjectURL(item.blob):null}
  async function download(id){const item=await get(id);if(!item?.blob)return false;const a=document.createElement('a'),e=ext(item.mimeType);a.href=URL.createObjectURL(item.blob);a.download=`${(item.name||item.id).replace(/[^a-z0-9-_]+/gi,'-')}.${e}`;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1200);return true}
  async function manifest(){const items=await list();return items.map(({blob,...x})=>x)}
  window.TRYAMMStudioTakes={version:VERSION,maxSlots:MAX_SLOTS,start,stop,cancel,importFile,list,get,remove,clear,objectUrl,download,manifest,isRecording:()=>recorder?.state==='recording',recordingSupported:Boolean(navigator.mediaDevices?.getUserMedia&&window.MediaRecorder),storage:'IndexedDB-local-browser-only'}
  window.dispatchEvent(new CustomEvent('tryamm:studio-takes-ready',{detail:{version:VERSION,maxSlots:MAX_SLOTS,recordingSupported:Boolean(navigator.mediaDevices?.getUserMedia&&window.MediaRecorder),storage:'IndexedDB-local-browser-only',cloudSync:false,multitrackMixEngine:false}}))
})()
