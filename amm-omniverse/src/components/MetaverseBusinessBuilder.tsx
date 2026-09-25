import { useEffect, useState } from 'react'

type Snapshot={state:any;missions:any[];features:string[]}

export default function MetaverseBusinessBuilder(){
  const [open,setOpen]=useState(false)
  const [snap,setSnap]=useState<Snapshot|null>(null)
  useEffect(()=>{
    const onState=(e:Event)=>setSnap((e as CustomEvent<Snapshot>).detail)
    const onOpen=()=>{setOpen(true);window.dispatchEvent(new CustomEvent('tryamm:metaverse-business-request'))}
    window.addEventListener('tryamm:metaverse-business-state',onState)
    window.addEventListener('tryamm:metaverse-business-open',onOpen)
    window.dispatchEvent(new CustomEvent('tryamm:metaverse-business-request'))
    return()=>{window.removeEventListener('tryamm:metaverse-business-state',onState);window.removeEventListener('tryamm:metaverse-business-open',onOpen)}
  },[])
  if(!open)return <button onClick={()=>setOpen(true)} style={{position:'fixed',right:18,bottom:220,zIndex:9997,background:'rgba(232,185,68,.12)',border:'1px solid rgba(232,185,68,.5)',color:'#ffd86a',borderRadius:9,padding:'8px 11px',cursor:'pointer'}}>🏪 Start a Business</button>
  const s=snap?.state||{}
  return <div style={{position:'fixed',inset:0,zIndex:9999,background:'rgba(0,0,0,.72)',display:'flex',alignItems:'center',justifyContent:'center',padding:16}}><div style={{width:'min(900px,96vw)',maxHeight:'90vh',overflow:'auto',background:'#04050e',border:'1px solid rgba(232,185,68,.5)',borderRadius:16,padding:16,color:'white'}}>
    <div style={{display:'flex',justifyContent:'space-between',gap:10}}><div><div style={{fontSize:22,fontWeight:900}}>Living World Business Builder</div><div style={{fontSize:12,color:'#ffd86a'}}>{s.city||'Chicago'}, {s.country||'United States'} · Stage: {s.stage||'idea'}</div></div><button onClick={()=>setOpen(false)}>Close</button></div>
    <p style={{fontSize:13,color:'#c8d3df'}}>Start inside StreetVerse, source low-MOQ products, test samples, protect supplier relationships, build a brand, open a virtual storefront, launch with creators, and expand city by city without losing your business history.</p>
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:10}}>{(snap?.missions||[]).map(m=><div key={m.id} style={{background:'rgba(255,255,255,.03)',border:'1px solid rgba(79,227,255,.2)',borderRadius:10,padding:10}}><strong>{m.label}</strong><div style={{fontSize:12,color:'#9fb2c4',marginTop:5}}>{m.description}</div></div>)}</div>
    <div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:14}}><button onClick={()=>window.dispatchEvent(new CustomEvent('tryamm:metaverse-business-find-suppliers'))}>Find Low-MOQ Suppliers</button><button onClick={()=>window.dispatchEvent(new CustomEvent('tryamm:metaverse-business-open-insights'))}>Open OmniBI</button><button onClick={()=>window.dispatchEvent(new CustomEvent('tryamm:metaverse-business-open-marketplace'))}>Open Marketplace</button></div>
  </div></div>
}
