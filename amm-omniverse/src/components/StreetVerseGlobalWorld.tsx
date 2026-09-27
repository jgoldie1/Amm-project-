import {useMemo} from 'react'
import {STREETVERSE_GLOBAL_CITIES,getStreetVerseCity} from '../data/StreetVerseGlobalRegistry'
import {compileGlobalWorld,GLOBAL_WORLD_COMPILER} from '../data/GlobalWorldCompiler'

export default function StreetVerseGlobalWorld({onClose,onEnterChicago}:{onClose:()=>void;onEnterChicago?:()=>void}){
 const params=typeof window!=='undefined'?new URLSearchParams(window.location.search):new URLSearchParams()
 const city=useMemo(()=>getStreetVerseCity(params.get('city')||'chicago'),[])
 const plan=useMemo(()=>compileGlobalWorld(city.id),[city.id])
 const openCity=(id:string)=>{
  if(id==='chicago'&&onEnterChicago){onEnterChicago();return}
  const url=new URL(window.location.href)
  url.searchParams.set('city',id)
  url.searchParams.set('global','1')
  window.location.assign(url.toString())
 }
 return <main role="dialog" aria-modal="true" aria-label="StreetVerse Global" style={{position:'fixed',inset:0,zIndex:15950,overflow:'auto',background:'radial-gradient(circle at top,#0b2340,#03050a 48%)',color:'#fff',padding:'14px 14px 32px',fontFamily:'Inter,system-ui,sans-serif'}}>
  <header style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'center'}}>
   <div><div style={{fontSize:10,fontWeight:900,letterSpacing:2,color:'#58e8ff'}}>STREETVERSE GLOBAL</div><h1 style={{margin:'3px 0',fontSize:26}}>One Passport. Many Cities.</h1></div>
   <button onClick={onClose} aria-label="Close StreetVerse Global" style={closeBtn}>×</button>
  </header>
  <section style={{marginTop:12,padding:14,border:'1px solid #284b68',borderRadius:16,background:'#07111ddd'}}>
   <div style={{fontSize:11,color:'#9bc8e8'}}>CURRENT CITY</div>
   <h2 style={{margin:'4px 0'}}>{city.name}, {city.country}</h2>
   <div style={{fontSize:12,opacity:.8}}>Status: {city.status}. Shared TRYAMM Passport, media, commerce, Radio/News, Holo Ads and ledger follow the user between eligible cities.</div>
  </section>
  <section style={{marginTop:14,padding:12,border:'1px solid #4a3d74',borderRadius:14,background:'#100b20'}}>
   <b style={{color:'#c7a8ff'}}>GLOBAL WORLD COMPILER</b>
   <div style={{fontSize:11,lineHeight:1.5,marginTop:5}}>Mode: {GLOBAL_WORLD_COMPILER.mode} • {plan.modules.length} shared build stages • {plan.sharedSystems.length} shared platform systems. City-specific work stays in manifests instead of forking separate games.</div>
   <div style={{display:'flex',gap:6,flexWrap:'wrap',marginTop:8}}>{plan.modules.map(m=><span key={m.stage} style={{fontSize:9,padding:'4px 7px',border:'1px solid #443864',borderRadius:999}}>{m.stage.toUpperCase()}</span>)}</div>
  </section>
  <h2 style={{fontSize:17,marginTop:18}}>CITY GRID</h2>
  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:10}}>
   {STREETVERSE_GLOBAL_CITIES.map(c=><article key={c.id} style={{border:c.id===city.id?'1px solid #58e8ff':'1px solid #27384c',borderRadius:14,padding:12,background:'#08111b'}}>
    <div style={{display:'flex',justifyContent:'space-between',gap:8}}><b>{c.name}</b><span style={{fontSize:10,opacity:.7}}>{c.status.toUpperCase()}</span></div>
    <div style={{fontSize:11,opacity:.65,marginTop:3}}>{c.region} • {c.country}</div>
    <div style={{fontSize:11,lineHeight:1.45,marginTop:8}}>{c.features.join(' • ')}</div>
    <button onClick={()=>openCity(c.id)} style={actionBtn}>{c.id==='chicago'?'ENTER CHICAGO':c.status==='building'?'OPEN BUILD':'VIEW CITY PLAN'}</button>
   </article>)}
  </div>
  <section style={{marginTop:16,padding:12,border:'1px solid #32503d',borderRadius:14,background:'#07140e'}}>
   <b style={{color:'#79ffad'}}>GLOBAL ECONOMY BRIDGE</b>
   <div style={{fontSize:12,lineHeight:1.5,marginTop:5}}>StreetVerse city → local business/mission → Radio/News/Holo LIVE → QR/Business Passport → Marketplace/Holo Ads → verified payment → internal ledger → Replay/Reels/TRYAMM TV.</div>
  </section>
 </main>
}
const closeBtn:React.CSSProperties={width:44,height:44,borderRadius:13,border:'1px solid #3a4d60',background:'#0c1420',color:'#fff',fontSize:24}
const actionBtn:React.CSSProperties={width:'100%',marginTop:10,border:'1px solid #3f718d',borderRadius:10,padding:'10px 8px',background:'#10283a',color:'#fff',fontSize:10,fontWeight:900}
