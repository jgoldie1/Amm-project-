import { useEffect, useState } from 'react'
import AniyahPayCenter from './AniyahPayCenter'

type Props={district?:string;assetStatus?:string;visited?:number;totalMissions?:number}
export default function StreetVerseNextLevelHUD({district='CHICAGO • DISTRICT 01',assetStatus='WORLD ACTIVE',visited=0,totalMissions=4}:Props){
 const [open,setOpen]=useState(true)
 const [showAniyahPay,setShowAniyahPay]=useState(false)
 useEffect(()=>{const fn=()=>setOpen(v=>!v);window.addEventListener('tryamm:streetverse-hud',fn);return()=>window.removeEventListener('tryamm:streetverse-hud',fn)},[])
 useEffect(()=>{;(window as any).__showAniyahPay=()=>setShowAniyahPay(true);return()=>{delete (window as any).__showAniyahPay}},[])
 const launch=(name:string)=>{const fn=(window as any)[name];if(typeof fn==='function')fn()}
 if(showAniyahPay)return <AniyahPayCenter onClose={()=>setShowAniyahPay(false)}/>
 if(!open)return <button onClick={()=>setOpen(true)} style={{position:'absolute',right:12,top:12,zIndex:30,border:'1px solid #4fe3ff77',borderRadius:999,background:'#06131ddd',color:'#4fe3ff',padding:'8px 11px',fontFamily:'monospace'}}>◈ HUD</button>
 return <aside style={{position:'absolute',right:10,top:10,zIndex:30,width:'min(330px,calc(100vw - 20px))',background:'linear-gradient(160deg,#04111dea,#0b0718e8)',border:'1px solid #4fe3ff55',borderRadius:16,padding:12,backdropFilter:'blur(10px)',boxShadow:'0 16px 50px #0009',fontFamily:'monospace',color:'#dff8ff'}}>
  <div style={{display:'flex',justifyContent:'space-between',gap:8}}><div><div style={{fontSize:8,letterSpacing:2,color:'#4fe3ff',fontWeight:900}}>STREETVERSE NEXT LEVEL</div><b style={{fontSize:12}}>{district}</b></div><button onClick={()=>setOpen(false)} style={{border:0,background:'transparent',color:'#789',cursor:'pointer'}}>×</button></div>
  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:7,marginTop:10}}><Metric label="WORLD" value={assetStatus}/><Metric label="MISSIONS" value={`${visited}/${totalMissions}`}/><Metric label="TIME" value="QUANTUM READY"/><Metric label="MEMORY" value="PERSISTENT"/></div>
  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:7,marginTop:9}}><Action label="◈ HoloGPT" onClick={()=>launch('__showHoloGPT')}/><Action label="📱 Holo Fon" onClick={()=>launch('__showHoloFon')}/><Action label="💸 Aniyah Pay" onClick={()=>setShowAniyahPay(true)}/><Action label="⌛ Quantum Time" onClick={()=>launch('__showQuantumTime')}/><Action label="⌕ Quantum Zoom" onClick={()=>launch('__showQuantumZoom')}/><Action label="◎ Holoverse" onClick={()=>launch('__showHoloverse')}/></div>
  <div style={{marginTop:9,fontSize:9,lineHeight:1.5,color:'#88a9b7'}}>Living-world HUD connects missions, Holo Fon, Aniyah Pay, WHERE + SCALE + WHEN + INTELLIGENCE without leaving StreetVerse. Real-money provider submission remains gated until server credentials and compliance checks are verified.</div>
 </aside>
}
function Metric({label,value}:{label:string;value:string}){return <div style={{background:'#071722bb',border:'1px solid #19384a',borderRadius:10,padding:8}}><div style={{fontSize:7,color:'#66899a'}}>{label}</div><div style={{fontSize:9,fontWeight:900,color:'#aef5ff',marginTop:3}}>{value}</div></div>}
function Action({label,onClick}:{label:string;onClick:()=>void}){return <button onClick={onClick} style={{background:'#0b1a25',border:'1px solid #4fe3ff44',borderRadius:10,padding:'9px 7px',color:'#8eeeff',fontFamily:'monospace',fontSize:9,fontWeight:900,cursor:'pointer'}}>{label}</button>}
