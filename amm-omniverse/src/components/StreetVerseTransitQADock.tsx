import {useEffect,useState} from 'react'
import {STREETVERSE_TRANSIT_STOPS,STREETVERSE_TRANSIT_RECOMMENDED_ROUTE,smokeTestTransit,planStreetVerseTransit,type TransitLeg} from '../runtime/StreetVerseTransitDirector.mjs'
const btn:React.CSSProperties={minHeight:48,padding:'8px 13px',borderRadius:11,border:'1px solid #91e6ff',background:'#10334e',color:'#fff',fontWeight:850,cursor:'pointer',touchAction:'manipulation'}
/** On-device transit audit and travel planning. Neither CTA telemetry nor actual player boarding. */
export default function StreetVerseTransitQADock(){
 const [open,setOpen]=useState(false),[from,setFrom]=useState('circle-park'),[to,setTo]=useState('west-side-el')
 const [result,setResult]=useState<TransitLeg|null>(null),[notice,setNotice]=useState('Preview only: the existing train model is not yet a boarded/saved player route.')
 const save=(body:unknown)=>{
  const blob=new Blob([JSON.stringify(body,null,2)],{type:'application/json'})
  const url=URL.createObjectURL(blob),anchor=document.createElement('a');anchor.href=url;anchor.download='streetverse-chicago-el-global-transit-test.json';anchor.click();setTimeout(()=>URL.revokeObjectURL(url),1200)
 }
 useEffect(()=>{
  const listener=(e:Event)=>setResult((e as CustomEvent<TransitLeg>).detail)
  window.addEventListener('tryamm:streetverse-transit-result',listener)
  return()=>window.removeEventListener('tryamm:streetverse-transit-result',listener)
 },[])
 const check=()=>{const p=planStreetVerseTransit(from,to);setResult(p);setNotice(p.ok?'Planned only. Player position and inventory have not changed.':'Select two different valid stops.')}
 const test=()=>{const report=smokeTestTransit();setResult(report.legs[0]||null);setNotice(report.allPlansValid?'7/7 proposed route legs validated. No train boarding, streaming or server save certified.':'Some simulated route legs failed.');try{save(report)}catch{setNotice('Test ran but JSON export is unavailable.')} }
 return <aside aria-label="StreetVerse CTA L and global transport QA" style={{position:'fixed',top:'calc(env(safe-area-inset-top) + 262px)',left:10,zIndex:14975,maxWidth:'min(310px,calc(100vw - 22px))'}}>
  <button style={btn} aria-expanded={open} onClick={()=>setOpen(v=>!v)}>🚆 CHICAGO L / GLOBAL TRANSIT</button>
  {open&&<div style={{display:'grid',gap:9,marginTop:5,padding:13,background:'#061625f5',color:'#fff',border:'1px solid #63bceb',borderRadius:14,maxHeight:'55dvh',overflowY:'auto',fontFamily:'system-ui',fontSize:13}}>
   <strong>Existing moving L train + passenger manifest</strong>
   <small>3D train is part of existing Chicago code. Boarding, door/hand grips, global arrival scenes and live arrivals are not certified.</small>
   <label>From<select aria-label="Transit origin" style={{display:'block',width:'100%',minHeight:44,background:'#12394a',color:'#fff'}} value={from} onChange={e=>setFrom(e.target.value)}>{STREETVERSE_TRANSIT_STOPS.map(s=><option key={s.id} value={s.id}>{s.label}</option>)}</select></label>
   <label>To<select aria-label="Transit destination" style={{display:'block',width:'100%',minHeight:44,background:'#12394a',color:'#fff'}} value={to} onChange={e=>setTo(e.target.value)}>{STREETVERSE_TRANSIT_STOPS.map(s=><option key={s.id} value={s.id}>{s.label}</option>)}</select></label>
   <button style={btn} onClick={check}>PLAN FICTIONAL TRAVEL</button>
   <button style={btn} onClick={test}>ONE PUSH • TEST 7 LEGS + EXPORT JSON</button>
   <small role="status" aria-live="polite">{notice} {result?.routeType||''}</small>
   <small>Suggested plan: {STREETVERSE_TRANSIT_RECOMMENDED_ROUTE.map(id=>STREETVERSE_TRANSIT_STOPS.find(s=>s.id===id)?.label.split(' •')[0]).join(' → ')}</small>
   <button style={btn} onClick={()=>setOpen(false)}>CLOSE</button>
  </div>}
 </aside>
}
