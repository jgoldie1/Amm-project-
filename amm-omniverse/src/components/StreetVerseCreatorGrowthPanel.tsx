import {useEffect,useState} from 'react'
import {requestCreatorCode,requestCreatorJoin} from '../data/streetVerseCreatorGrowth'
import {requestDiscordShare} from '../data/streetVerseDiscordCommunity'
export default function StreetVerseCreatorGrowthPanel({onClose}:{onClose:()=>void}){
 const [code,setCode]=useState('')
 const [workweek,setWorkweek]=useState<any>(null)
 useEffect(()=>{const onState=(e:Event)=>setWorkweek((e as CustomEvent<any>).detail||null);addEventListener('tryamm:creator-workweek-state',onState);dispatchEvent(new CustomEvent('tryamm:creator-workweek-request'));return()=>removeEventListener('tryamm:creator-workweek-state',onState)},[])
 return <section aria-label="StreetVerse Global creator growth" style={{position:'absolute',inset:12,zIndex:46,overflow:'auto',padding:14,borderRadius:16,background:'#07121bf2',color:'#fff'}}>
  <button onClick={onClose} style={{minHeight:44,borderRadius:12,fontWeight:900}}>← GAME</button>
  <h2>STREETVERSE GLOBAL • CREATOR PASS</h2>
  <p>Invite players into LIVE RP, PK and first-mission sessions. Valid joins and completions are tracked server-side.</p>
  <section style={{marginBottom:12,padding:10,border:'1px solid #28506a',borderRadius:12,background:'#081923'}}><div style={{fontSize:10,color:'#72e8ff',fontWeight:950}}>CREATOR WORKWEEK</div><div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:5,marginTop:7}}><div><b>{((workweek?.liveMinutes||0)/60).toFixed(1)}h</b><small style={{display:'block',opacity:.65}}>LIVE</small></div><div><b>{workweek?.liveSessions||0}</b><small style={{display:'block',opacity:.65}}>SESSIONS</small></div><div><b>{workweek?.reelsPublished||0}</b><small style={{display:'block',opacity:.65}}>REELS</small></div><div><b>{workweek?.discoveryScore||0}</b><small style={{display:'block',opacity:.65}}>DISCOVERY</small></div></div><div style={{display:'flex',gap:5,marginTop:8}}>{[20,30,40].map(h=><button key={h} onClick={()=>dispatchEvent(new CustomEvent('tryamm:creator-workweek-target',{detail:{hours:h}}))} style={{flex:1,minHeight:34,borderRadius:9,border:'1px solid #31566c',background:workweek?.targetHours===h?'#15394a':'#0a151d',color:'#fff',fontWeight:900}}>{h}h</button>)}</div><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,marginTop:8}}><button onClick={()=>{window.location.href='/live?from=streetverse&role=host'}} style={{minHeight:42,borderRadius:10,fontWeight:950}}>🔴 GO LIVE</button><button onClick={()=>dispatchEvent(new CustomEvent('tryamm:creator-workweek-break-taken'))} style={{minHeight:42,borderRadius:10,fontWeight:950}}>☕ BREAK</button></div><small style={{display:'block',marginTop:7,opacity:.68}}>Discovery rewards consistency, useful content and breaks. It stops increasing from raw hours after 30h and caps tracked LIVE time at 40h/week.</small></section>
  <button onClick={requestCreatorCode} style={{width:'100%',minHeight:48,borderRadius:12,fontWeight:950}}>GET MY CREATOR CODE</button>
  <label style={{display:'block',marginTop:12}}>JOIN WITH A CREATOR CODE<input value={code} onChange={e=>setCode(e.target.value.trim().toUpperCase())} inputMode="text" style={{display:'block',width:'100%',minHeight:46,marginTop:6,fontSize:16,borderRadius:10,padding:'0 10px'}}/></label>
  <button disabled={!code} onClick={()=>requestCreatorJoin(code)} style={{width:'100%',minHeight:48,marginTop:8,borderRadius:12,fontWeight:950}}>JOIN STREETVERSE GLOBAL</button>
  <button onClick={()=>requestDiscordShare('creator-pass')} style={{width:'100%',minHeight:48,marginTop:8,borderRadius:12,fontWeight:950}}>SHARE CREATOR PASS TO DISCORD</button>
  <small style={{display:'block',marginTop:12}}>First-session path: Spawn → Mission → LIVE/PK → Reel moment → Share.</small>
 </section>
}
