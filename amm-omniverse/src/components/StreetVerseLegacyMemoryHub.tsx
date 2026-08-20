import { useState } from 'react'
import { HARDBALL_MEMORY_BEATS, HARDBALL_REFERENCE, STUBBS_HARDBALL_MEMORY } from '../game/story/HardballLegacyMemory'
import { INDIANA_CHICAGO_LINKS, INDIANA_LIVING_WORLD } from '../game/world/IndianaLivingWorld'
import { LOTTIE_LIBRARY_2, STREETVERSE_REUSABLE_ASSETS } from '../game/assets/StreetVerseAssetReuseRegistry'
import { EVE_STREETVERSE_GUARDRAILS } from '../game/ai/EveStreetVerseDirector'
import { runLegacyBackendSmoke } from '../services/streetVerseLegacyApi'

export default function StreetVerseLegacyMemoryHub() {
  const [open, setOpen] = useState(false)
  const [smoke, setSmoke] = useState('NOT RUN')
  const runSmoke = async () => {
    setSmoke('RUNNING')
    try { const r = await runLegacyBackendSmoke(); setSmoke(r.ok ? 'GREEN' : 'FAILED') }
    catch { setSmoke('API NOT CONNECTED') }
  }

  return <>
    <button type="button" aria-label="Open StreetVerse legacy memory" onClick={()=>setOpen(true)} style={{position:'fixed',left:12,bottom:226,zIndex:8998,border:'1px solid #4fe3ff88',borderRadius:999,background:'linear-gradient(135deg,#102b36,#18101f)',color:'#fff',padding:'10px 14px',fontFamily:'monospace',fontSize:10,fontWeight:900,cursor:'pointer'}}>🎬 LEGACY MEMORY</button>
    {open && <div role="dialog" aria-modal="true" aria-label="StreetVerse Legacy Memory" style={{position:'fixed',inset:0,zIndex:10120,overflowY:'auto',background:'radial-gradient(circle at top,#102532,#05070c 55%,#020204)',color:'#fff',padding:16}}>
      <div style={{maxWidth:1100,margin:'0 auto'}}>
        <header style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'center'}}><div><div style={{fontSize:10,color:'#4fe3ff',letterSpacing:3,fontWeight:900}}>MEET THE STUBBS • LEGACY CHAPTER</div><h1>The Day the Camera Caught the Block</h1></div><button aria-label="Close" onClick={()=>setOpen(false)} style={close}>×</button></header>
        <section style={panel}><h2>Rights-safe Hardball memory</h2><p style={muted}>Reference: {HARDBALL_REFERENCE.title} ({HARDBALL_REFERENCE.year}), Chicago. The shipped game uses an original recreation until documented clip, likeness and trademark rights exist.</p><p style={warn}>{HARDBALL_REFERENCE.sourceUse}</p><div style={grid}>{HARDBALL_MEMORY_BEATS.map((b,i)=><article key={b.id} style={card}><strong>{i+1}. {b.label}</strong><p style={mutedSmall}>{b.objective}</p></article>)}</div><h3>Your memory layer</h3><ul>{STUBBS_HARDBALL_MEMORY.playerAuthoredMemory.map(x=><li key={x}>{x}</li>)}</ul><h3>Original recreation</h3><ul>{STUBBS_HARDBALL_MEMORY.safeRecreation.map(x=><li key={x}>{x}</li>)}</ul></section>
        <section style={panel}><h2>Reusable Asset + Lottie Library 2.0</h2><p style={muted}>Runtime: {LOTTIE_LIBRARY_2.runtime}. Reuse first, generate only what is missing, and always provide reduced-motion fallbacks.</p><div style={grid}>{STREETVERSE_REUSABLE_ASSETS.map(a=><article key={a.id} style={card}><strong>{a.id}</strong><p style={mutedSmall}>{a.kind} • {a.reuse} • {a.source}</p><p style={mutedSmall}>{a.notes}</p></article>)}</div></section>
        <section style={panel}><h2>Indiana is now in StreetVerse</h2><p style={muted}>{INDIANA_LIVING_WORLD.name} connects Chicago to Gary/Northwest Indiana, Indianapolis, South Bend, Fort Wayne, Bloomington and Evansville.</p><div style={grid}>{INDIANA_LIVING_WORLD.hubs.map(h=><article key={h.id} style={card}><strong>{h.name}</strong><p style={mutedSmall}>{h.identity}</p><p style={mutedSmall}>{h.missions.join(' • ')}</p></article>)}</div><div style={chips}>{INDIANA_CHICAGO_LINKS.map(x=><span key={x} style={chip}>{x}</span>)}</div></section>
        <section style={panel}><h2>Eve + advanced AI assistance</h2><ul>{EVE_STREETVERSE_GUARDRAILS.map(x=><li key={x}>{x}</li>)}</ul><button onClick={runSmoke} style={action}>RUN LEGACY API SMOKE</button><strong style={{marginLeft:12}}>STATUS: {smoke}</strong></section>
      </div>
    </div>}
  </>
}

const panel={border:'1px solid #26384d',borderRadius:20,padding:18,margin:'14px 0',background:'linear-gradient(150deg,#08121d,#070811)'} as const
const card={border:'1px solid #2b3d52',borderRadius:14,padding:12,background:'#0b121d'} as const
const grid={display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(230px,1fr))',gap:10} as const
const chips={display:'flex',gap:7,flexWrap:'wrap'} as const
const chip={border:'1px solid #36516a',borderRadius:999,padding:'6px 9px',fontSize:10,background:'#0b1824'} as const
const muted={color:'#aab8c8',lineHeight:1.6} as const
const mutedSmall={color:'#8395aa',fontSize:11,lineHeight:1.5} as const
const warn={color:'#e8b944',lineHeight:1.5,fontWeight:800} as const
const close={width:46,height:46,borderRadius:'50%',border:'1px solid #46566a',background:'#0d1420',color:'#fff',fontSize:24} as const
const action={minHeight:44,borderRadius:10,border:'1px solid #78ffb4',background:'#0d2b20',color:'#fff',padding:'0 14px',fontWeight:900} as const
