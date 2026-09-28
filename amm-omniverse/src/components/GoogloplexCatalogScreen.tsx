import React,{useMemo,useState} from 'react'
import {catalogStats,searchGoogloplexCatalog} from '../runtime/GoogloplexCatalogMemory'
export default function GoogloplexCatalogScreen(){
 const [q,setQ]=useState(''),[tick,setTick]=useState(0)
 const rows=useMemo(()=>searchGoogloplexCatalog(q),[q,tick]),stats=catalogStats()
 return <section aria-label="Googloplex Memory Catalog" style={{position:'fixed',inset:'8% 4%',zIndex:80,overflow:'auto',background:'rgba(4,10,20,.96)',color:'white',padding:16,borderRadius:18}}>
  <h2>Googloplex Memory</h2><p>{stats.total} catalog records • metadata index, not bulk media memory</p>
  <label>Search catalog <input value={q} onChange={e=>setQ(e.target.value)} placeholder="dance, Chicago, vehicle, ready…" style={{minHeight:44,width:'100%'}} /></label>
  <button style={{minHeight:44,marginTop:8}} onClick={()=>setTick(x=>x+1)}>Refresh</button>
  <div role="list">{rows.map(r=><article role="listitem" key={r.id} style={{padding:12,marginTop:8,border:'1px solid #667',borderRadius:12}}>
   <strong>{r.title}</strong><div>{r.kind} • {r.status} • {r.rights}{r.city?` • ${r.city}`:''}</div><small>{r.tags.join(' • ')}</small>
  </article>)}</div>
 </section>
}
