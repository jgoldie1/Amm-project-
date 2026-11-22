import {useEffect,useMemo,useState} from 'react'
import {STREETVERSE_DIRECTOR_MISSIONS,validateStreetVerseDirectorCatalog} from '../data/StreetVerse100MissionDirector'
type Report={schema:string;completed:string[];choices:Record<string,string>;deviceChecks:Record<string,boolean>;capabilities:Record<string,boolean>;verification:{live3D:false;ios:false;ipad:false;tv:false;ar:false;vr:false};exportedAt:string}
const KEY='tryamm.streetverse.director100.v1'
const btn:React.CSSProperties={minHeight:54,padding:'10px 12px',borderRadius:12,border:'1px solid #7dc4e0',background:'#16465b',color:'white',fontSize:15,fontWeight:800,touchAction:'manipulation'}
const read=()=>{try{const v=JSON.parse(localStorage.getItem(KEY)||'{}');return {completed:Array.isArray(v.completed)?v.completed.filter((id:unknown)=>typeof id==='string'&&STREETVERSE_DIRECTOR_MISSIONS.some(m=>m.id===id)):[],choices:v.choices&&typeof v.choices==='object'?v.choices:{}}}catch{return {completed:[],choices:{}}}}
export default function StreetVerseDirector100HUD(){
 const [open,setOpen]=useState(false)
 const [saved,setSaved]=useState(read)
 const [category,setCategory]=useState('All')
 const [selected,setSelected]=useState('SV-001')
 const [stage,setStage]=useState(0)
 const [deviceChecks,setDeviceChecks]=useState<Record<string,boolean>>({})
 const [captureLength,setCaptureLength]=useState(30)
 const [message,setMessage]=useState('Missions are scripted previews until production gameplay is verified.')
 const catalog=useMemo(()=>STREETVERSE_DIRECTOR_MISSIONS.filter(m=>category==='All'||m.category===category),[category])
 const mission=STREETVERSE_DIRECTOR_MISSIONS.find(m=>m.id===selected)||STREETVERSE_DIRECTOR_MISSIONS[0]
 useEffect(()=>{try{localStorage.setItem(KEY,JSON.stringify(saved))}catch{}},[saved])
 const markComplete=(id:string)=>setSaved(s=>({...s,completed:s.completed.includes(id)?s.completed:[...s.completed,id]}))
 const choose=(choice:string)=>{setSaved(s=>({...s,choices:{...s.choices,[selected]:choice}}));setMessage('Recorded scripted choice '+choice+' for '+selected+'. No server state changed.')}
 const capabilities=()=>({
  touch:'ontouchstart' in window||navigator.maxTouchPoints>0,
  pointer:typeof PointerEvent!=='undefined',
  recorder:typeof MediaRecorder!=='undefined',
  canvasCapture:typeof HTMLCanvasElement!=='undefined'&&'captureStream' in HTMLCanvasElement.prototype,
  xrApi:'xr' in navigator,
  fullscreen:!!document.documentElement.requestFullscreen,
  landscape:window.innerWidth>window.innerHeight,
  tvRemoteKeyboard:typeof KeyboardEvent!=='undefined'
 })
 const exportReport=()=>{
  const report:Report={schema:'streetverse.director100.device-preview.v1',completed:saved.completed,choices:saved.choices,deviceChecks,capabilities:capabilities(),verification:{live3D:false,ios:false,ipad:false,tv:false,ar:false,vr:false},exportedAt:new Date().toISOString()}
  const u=URL.createObjectURL(new Blob([JSON.stringify(report,null,2)],{type:'application/json'}))
  const a=document.createElement('a');a.href=u;a.download='StreetVerse_100_Mission_Device_Report.json';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1000)
 }
 return <aside data-streetverse-director100="true" style={{position:'fixed',left:8,bottom:'max(10px,env(safe-area-inset-bottom))',zIndex:42015,color:'white',fontFamily:'system-ui'}}>
  <button style={btn} aria-expanded={open} onClick={()=>setOpen(x=>!x)}>🎬 100 MISSIONS / STUDIO</button>
  {open&&<section role="region" aria-label="100 mission director and device tests" style={{width:'min(400px,calc(100vw - 16px))',maxHeight:'65dvh',overflowY:'auto',marginTop:8,background:'#081826f7',borderRadius:14,border:'1px solid #5594ac',padding:12,display:'grid',gap:10}}>
   <h2 style={{fontSize:20,margin:0}}>StreetVerse Director 100</h2>
   <div role="status">{saved.completed.length}/100 scripted completions · Catalog {validateStreetVerseDirectorCatalog().unique?'unique':'invalid'}</div>
   <label>Mission category<select style={{width:'100%',minHeight:48}} value={category} onChange={e=>setCategory(e.target.value)}><option>All</option>{[...new Set(STREETVERSE_DIRECTOR_MISSIONS.map(m=>m.category))].map(c=><option key={c}>{c}</option>)}</select></label>
   <label>Mission<select style={{width:'100%',minHeight:48}} value={selected} onChange={e=>{setSelected(e.target.value);setStage(0)}}>{catalog.map(m=><option key={m.id} value={m.id}>{m.id} {m.title}</option>)}</select></label>
   <div><strong>{mission.title}</strong><div>{mission.location} · {mission.stage[Math.min(stage,3)]}</div></div>
   <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}><button style={btn} onClick={()=>{if(stage<3)setStage(x=>x+1);else markComplete(selected)}}>NEXT ACTION</button><button style={btn} onClick={()=>markComplete(selected)}>ONE PUSH SCRIPT</button></div>
   <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:5}}>{['A','B','C','D'].map(x=><button key={x} style={btn} onClick={()=>choose(x)}>{x}</button>)}</div>
   <label>Movie / reel timeline<select style={{width:'100%',minHeight:48}} value={captureLength} onChange={e=>setCaptureLength(Number(e.target.value))}>{[30,60,120,300,900,1800,3600,7200].map(n=><option key={n} value={n}>{n===30?'30 sec':n<60?n+' sec':n/60+' min'}</option>)}</select></label>
   <button style={btn} onClick={()=>{window.dispatchEvent(new CustomEvent('tryamm:reel-capture-toggle'));setMessage('Existing gameplay recorder remains 30 sec. Selected '+captureLength+' sec is a movie planning duration, not a verified rendered file.')}}>🎥 RECORD AVAILABLE 30s REEL</button>
   <button style={btn} onClick={()=>{const x=capabilities();setMessage('Capability probe: '+Object.entries(x).map(([k,v])=>k+' '+(v?'available':'unavailable')).join(' · '))}}>TEST DEVICE CAPABILITIES</button>
   <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>{['iPhone','iPad','Android tablet','TV/remote','AR headset','VR headset'].map(d=><label key={d} style={{minHeight:48}}><input type="checkbox" checked={!!deviceChecks[d]} onChange={e=>setDeviceChecks(s=>({...s,[d]:e.target.checked}))}/>{d} manual test</label>)}</div>
   <button style={btn} onClick={exportReport}>EXPORT REPORT TO CHATGPT</button>
   <p role="status" style={{fontSize:13,lineHeight:1.5}}>{message}</p>
   <small>Checkboxes are self-reported. This panel does not certify hardware support. Never enter health information. No production video, CG/stunt rendering, clinical service, or shared mission persistence is implied.</small>
  </section>}
 </aside>
}
