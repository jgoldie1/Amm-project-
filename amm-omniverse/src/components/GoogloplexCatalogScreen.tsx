import React,{useEffect,useMemo,useState,useRef} from 'react'
import {catalogStats,searchGoogloplexCatalog,installCatalogMemory,catalogMemoryNotice,catalogMemory,businessMemory,reloadCatalogMemory,saveCatalogMemory,restoreCatalogMemory,deleteCatalogMemory,rememberCatalogRecord} from '../runtime/GoogloplexCatalogMemory'
export default function GoogloplexCatalogScreen({onClose}:{onClose?:()=>void}){
 const draft=useRef(false),scope=useRef(-1),revision=useRef<number|null>(null)
 const [q,setQ]=useState(''),[tick,setTick]=useState(0),[busy,setBusy]=useState(false),[notice,setNotice]=useState(''),[notes,setNotes]=useState(''),[source,setSource]=useState(''),[title,setTitle]=useState('')
 useEffect(()=>{
  const update=()=>{
   const switched=scope.current!==catalogMemory.generation
   const reloaded=revision.current!==businessMemory.row?.revision
   scope.current=catalogMemory.generation;revision.current=businessMemory.row?.revision
   if(switched||(!draft.current&&reloaded)){
    setNotes(typeof businessMemory.row?.payload?.notes==='string'?businessMemory.row.payload.notes:'');setSource(typeof businessMemory.row?.payload?.source==='string'?businessMemory.row.payload.source:'');draft.current=false
   }
   if(switched){setTitle('');setQ('')}
   setTick(x=>x+1);setNotice(catalogMemoryNotice())
  }
  window.addEventListener('tryamm:catalog-memory-changed',update);installCatalogMemory();update()
  return()=>window.removeEventListener('tryamm:catalog-memory-changed',update)
 },[])
 const rows=useMemo(()=>searchGoogloplexCatalog(q),[q,tick]),stats=catalogStats()
 async function run(work:()=>Promise<unknown>){
  const generation=catalogMemory.generation;setBusy(true);setNotice('Working…')
  try{await work();if(generation===catalogMemory.generation){setTick(x=>x+1);setNotice('Done.')}}catch(error){if(generation===catalogMemory.generation)setNotice((error as Error).message)}finally{setBusy(false)}
 }
 function download(){
  const data={exportedAt:new Date().toISOString(),catalog:catalogMemory.row,business:businessMemory.row}
  const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'})),a=document.createElement('a')
  a.href=url;a.download='TRYAMM-private-memory.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1500)
 }
 const ready=catalogMemory.ready&&businessMemory.ready
 return <section aria-label="Googloplex Memory Catalog" style={{position:'fixed',inset:'8% 4%',zIndex:80,overflow:'auto',background:'rgba(4,10,20,.96)',color:'white',padding:16,borderRadius:18}}>
  <h2>Googloplex Memory</h2>{onClose&&<button onClick={onClose}>Close memory</button>}<p>{stats.total} catalog records · private metadata, not bulk media storage</p>
  <p>Memory belongs to your signed-in account. Three bounded documents store world state, catalog records and business notes. Saved text never grants permission to spend, publish or contact customers.</p>
  <p role="status">{notice}</p>
  <button disabled={busy||!catalogMemory.owner} onClick={()=>void run(reloadCatalogMemory)}>Reload saved memory</button>
  <button disabled={busy||!ready} onClick={download}>Export saved memory</button>
  <h3>Business knowledge</h3>
  <label>Business names, approved prices and decisions<textarea maxLength={20000} value={notes} onChange={e=>{draft.current=true;setNotes(e.target.value)}} style={{width:'100%',minHeight:120}}/></label>
  <label>Source or reference<input maxLength={1000} value={source} onChange={e=>{draft.current=true;setSource(e.target.value)}}/></label>
  <p>These are owner-entered notes, not independently verified facts. Include the business name with each entry. Do not put passwords or payment-card details here.</p>
  <button disabled={busy||!ready} onClick={()=>void run(async()=>{await businessMemory.save({notes,source,provenance:'owner-entered',savedAt:new Date().toISOString()});draft.current=false})}>Save business notes</button>
  <button disabled={busy||!ready||!businessMemory.row?.previous_payload} onClick={()=>void run(async()=>{const row=await businessMemory.save(businessMemory.row.previous_payload);if(row){setNotes(typeof row.payload.notes==='string'?row.payload.notes:'');setSource(typeof row.payload.source==='string'?row.payload.source:'')}})}>Restore previous notes</button>
  <button disabled={busy||!ready} onClick={()=>{if(window.confirm('Delete your saved business notes and their previous revision?'))void run(async()=>{if(await businessMemory.remove()){setNotes('');setSource('')}})}}>Delete business notes</button>
  <h3>Catalog</h3>
  <label>New reference title<input maxLength={200} value={title} onChange={e=>setTitle(e.target.value)}/></label>
  <button disabled={busy||!ready||!title.trim()} onClick={()=>{try{rememberCatalogRecord({id:crypto.randomUUID(),title:title.trim(),kind:'reference',tags:[],status:'reference',rights:'Review before reuse',updatedAt:new Date().toISOString()});setTitle('');setTick(x=>x+1)}catch(error){setNotice((error as Error).message)}}}>Add reference locally</button>
  <button disabled={busy||!ready} onClick={()=>void run(saveCatalogMemory)}>Save catalog</button>
  <button disabled={busy||!ready||!catalogMemory.row?.previous_payload} onClick={()=>void run(restoreCatalogMemory)}>Restore previous catalog</button>
  <button disabled={busy||!ready} onClick={()=>{if(window.confirm('Delete your saved catalog and its previous revision?'))void run(deleteCatalogMemory)}}>Delete catalog</button>
  <label>Search catalog <input value={q} onChange={e=>setQ(e.target.value)} placeholder="dance, Chicago, vehicle, ready…" style={{minHeight:44,width:'100%'}} /></label>
  <div role="list">{rows.map(r=><article role="listitem" key={r.id} style={{padding:12,marginTop:8,border:'1px solid #667',borderRadius:12}}>
   <strong>{r.title}</strong><div>{r.kind} · {r.status} · {r.rights}{r.city?` · ${r.city}`:''}</div><small>{r.tags.join(' · ')}</small>
  </article>)}</div>
 </section>
}
