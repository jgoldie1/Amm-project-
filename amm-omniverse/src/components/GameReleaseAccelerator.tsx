import { useMemo, useState } from 'react'

const enabled=()=>import.meta.env.VITE_GAME_ACCELERATOR_ENABLED==='true'
type Gate={id:string;label:string;proof:string;open:()=>void}
export default function GameReleaseAccelerator(){
 const [open,setOpen]=useState(false)
 const gates=useMemo<Gate[]>(()=>[
  {id:'gameverse',label:'GameVerse + StreetVerse',proof:'Character/world/mission runtime, World Memory and gameplay entry.',open:()=>window.dispatchEvent(new Event('tryamm:gameverse-open'))},
  {id:'reality',label:'District 01 Reality Lab',proof:'7-room proof spine, 14 immersive experiences, save/rejoin, gamepad, accessibility and authoritative multiplayer.',open:()=>call('__showRealityLab')},
  {id:'movie',label:'Movie / Reel Studio',proof:'Create scene → timeline → save/reopen → export-capable browser path.',open:()=>window.dispatchEvent(new Event('tryamm:movie-studio-open'))},
  {id:'live',label:'LIVE + PK',proof:'Authenticated LIVE, PK, internal team backchannel and creator replay path.',open:()=>call('__showTryAMMLive')},
  {id:'immersive',label:'AR • VR • MR',proof:'Immersive world viewport and Reality Lab handoff.',open:()=>call('__showImmersiveWorlds')},
  {id:'holo',label:'Holoverse',proof:'Holographic world gateway on the shared TRYAMM identity/state path.',open:()=>call('__showHoloverse')},
  {id:'sports',label:'Summer + Winter Global Games',proof:'Living Sports prototype and global games program inside GameVerse.',open:()=>window.dispatchEvent(new CustomEvent('tryamm:gameverse-open',{detail:{world:'living-sports'}}))},
 ],[])
 if(!enabled())return null
 const runtime=[['Reality Lab',typeof (window as any).__showRealityLab==='function'],['LIVE',typeof (window as any).__showTryAMMLive==='function'],['Immersive',typeof (window as any).__showImmersiveWorlds==='function'],['Holoverse',typeof (window as any).__showHoloverse==='function']]
 return <><button aria-label="Open Game Release Accelerator" onClick={()=>setOpen(true)} style={{position:'fixed',left:12,bottom:118,zIndex:9001,border:'1px solid #4fe3ff88',borderRadius:999,padding:'10px 14px',background:'#071b28',color:'#fff',fontWeight:900,cursor:'pointer'}}>⚡ GAME RELEASE</button>{open&&<div role="dialog" aria-label="Game Release Accelerator" style={{position:'fixed',inset:0,zIndex:12320,overflowY:'auto',background:'radial-gradient(circle at top,#10283b,#04050e 58%,#010205)',color:'#fff',padding:18}}><div style={{maxWidth:1180,margin:'0 auto'}}><header style={{display:'flex',justifyContent:'space-between',gap:12}}><div><div style={{fontSize:10,color:'#4fe3ff',fontWeight:900,letterSpacing:3}}>TRYAMM • FINISH-AND-PROVE</div><h1 style={{margin:'6px 0'}}>Game Release Accelerator</h1><p style={muted}>One cockpit for the active release slice. It does not mark a provider/device gate green merely because the UI exists.</p></div><button aria-label="Close Game Release Accelerator" onClick={()=>setOpen(false)} style={close}>×</button></header><section style={panel}><h2>Runtime wiring</h2><div style={grid}>{runtime.map(([n,ok])=><article key={String(n)} style={card}><b>{n}</b><strong style={{color:ok?'#78ffb4':'#ff8d8d'}}>{ok?'MOUNTED':'MISSING'}</strong></article>)}</div></section><section style={panel}><h2>Parallel proof lanes</h2><div style={grid}>{gates.map(g=><article key={g.id} style={card}><b>{g.label}</b><p style={muted}>{g.proof}</p><button onClick={g.open}>OPEN / PROVE</button></article>)}</div></section><section style={panel}><h2>Release truth</h2><p style={muted}>BUILD GREEN → E2E GREEN → AUTHENTICATED SAVE/REJOIN → TWO REAL ACCOUNTS/DEVICES → LIVE/PK → MOVIE SAVE/REOPEN/EXPORT → MOBILE/ACCESSIBILITY/PERFORMANCE → DEPLOY → PRODUCTION SMOKE. Physical controllers, XR hardware and external provider credentials still require real evidence.</p></section></div></div>}</>
}
function call(name:string){const fn=(window as any)[name];if(typeof fn==='function')fn()}
const panel={border:'1px solid #25415a',borderRadius:18,padding:16,margin:'14px 0',background:'#08111b'} as const
const grid={display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:10} as const
const card={border:'1px solid #26394d',borderRadius:14,padding:13,background:'#0a1420',display:'grid',gap:7} as const
const muted={color:'#a9b7c8',lineHeight:1.55} as const
const close={width:44,height:44,borderRadius:'50%',border:'1px solid #4a5e73',background:'#0b1320',color:'#fff',fontSize:22} as const
