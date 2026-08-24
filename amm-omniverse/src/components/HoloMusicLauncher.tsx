import { useMemo, useState } from 'react'
import { createHoloMusicSession, HOLO_MUSIC_FLOW, type HoloMusicContext } from '../music/HoloMusic'

const contexts:HoloMusicContext[]=['streetverse','my-world','kingdom','after-dark','creator-studio','live','store','vehicle']

export default function HoloMusicLauncher(){
  const [open,setOpen]=useState(false)
  const [context,setContext]=useState<HoloMusicContext>('streetverse')
  const session=useMemo(()=>createHoloMusicSession(context),[context])
  ;(window as any).__showHoloMusic=(next?:HoloMusicContext)=>{if(next&&contexts.includes(next))setContext(next);setOpen(true)}
  if(!open)return <button aria-label="Open Holo Music" onClick={()=>setOpen(true)} style={{position:'fixed',left:12,bottom:122,zIndex:8994,border:'1px solid #e8b94488',borderRadius:999,padding:'10px 14px',background:'linear-gradient(135deg,#21120d,#171129)',color:'#E8B944',fontSize:10,fontWeight:950,letterSpacing:1,cursor:'pointer',boxShadow:'0 8px 28px #0009'}}>♫ HOLO MUSIC</button>
  return <div role="dialog" aria-label="Holo Music" style={{position:'fixed',inset:0,zIndex:14020,background:'linear-gradient(160deg,#04050e,#0d0714)',color:'#fff',overflow:'auto',fontFamily:'Inter,system-ui,sans-serif'}}>
    <div style={{maxWidth:980,margin:'0 auto',padding:'22px 16px 80px'}}>
      <header style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'center'}}><div><div style={{color:'#4FE3FF',fontSize:10,fontWeight:950,letterSpacing:3}}>TRYAMM • HOLO MUSIC</div><h1 style={{margin:'5px 0'}}>Music across the living world</h1></div><button aria-label="Close Holo Music" onClick={()=>setOpen(false)} style={{width:44,height:44,borderRadius:'50%',border:'1px solid #42506a',background:'#101420',color:'#fff',fontSize:22}}>×</button></header>
      <p style={{color:'#9fb2c8',lineHeight:1.6}}>One rights-aware music layer for StreetVerse, vehicles, stores, creator content, LIVE, Kingdom, My World and Omniverse After Dark. Money-bearing attribution stays server verified.</p>
      <div style={{display:'flex',gap:8,flexWrap:'wrap',margin:'16px 0'}}>{contexts.map(c=><button key={c} onClick={()=>setContext(c)} style={{border:`1px solid ${context===c?'#4FE3FF':'#28364a'}`,background:context===c?'#0b2530':'#0b111b',color:'#fff',borderRadius:999,padding:'8px 11px',cursor:'pointer'}}>{c}</button>)}</div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(210px,1fr))',gap:10}}>
        <section style={card}><b>Active context</b><div style={{marginTop:8,color:'#4FE3FF'}}>{session.context}</div><div style={{fontSize:11,color:'#91a5ba',marginTop:6}}>Spatial audio: {session.spatial?'ON':'OFF'} • Quantum Beat: {session.quantumBeatSync?'SYNC':'OFF'}</div></section>
        <section style={card}><b>Creator connection</b><div style={small}>Tag artist + product + world location → record → edit → publish → attribution.</div></section>
        <section style={card}><b>Commerce connection</b><div style={small}>Music discovery can lead to tickets, merch, creator stores and licensed digital products without bypassing rights verification.</div></section>
        <section style={card}><b>World connection</b><div style={small}>Street audio, club interiors, vehicles, stores and events can share the same track/session contract and Quantum Beat timing.</div></section>
      </div>
      <div style={{marginTop:16,padding:14,border:'1px solid #28364a',borderRadius:16,background:'#070b12'}}>{HOLO_MUSIC_FLOW.map((step,i)=><div key={step} style={{display:'flex',gap:10,padding:'7px 0',fontSize:12,color:'#c8d5e4'}}><span style={{color:'#E8B944',fontWeight:950}}>{String(i+1).padStart(2,'0')}</span><span>{step}</span></div>)}</div>
    </div>
  </div>
}
const card:React.CSSProperties={padding:14,border:'1px solid #26364b',borderRadius:16,background:'#08111c'}
const small:React.CSSProperties={fontSize:11,color:'#91a5ba',lineHeight:1.55,marginTop:8}
