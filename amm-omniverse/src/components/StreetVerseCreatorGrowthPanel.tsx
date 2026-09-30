import {useState} from 'react'
import {requestCreatorCode,requestCreatorJoin} from '../data/streetVerseCreatorGrowth'
import {requestDiscordShare} from '../data/streetVerseDiscordCommunity'
export default function StreetVerseCreatorGrowthPanel({onClose}:{onClose:()=>void}){
 const [code,setCode]=useState('')
 return <section aria-label="StreetVerse Global creator growth" style={{position:'absolute',inset:12,zIndex:46,overflow:'auto',padding:14,borderRadius:16,background:'#07121bf2',color:'#fff'}}>
  <button onClick={onClose} style={{minHeight:44,borderRadius:12,fontWeight:900}}>← GAME</button>
  <h2>STREETVERSE GLOBAL • CREATOR PASS</h2>
  <p>Invite players into LIVE RP, PK and first-mission sessions. Valid joins and completions are tracked server-side.</p>
  <button onClick={requestCreatorCode} style={{width:'100%',minHeight:48,borderRadius:12,fontWeight:950}}>GET MY CREATOR CODE</button>
  <label style={{display:'block',marginTop:12}}>JOIN WITH A CREATOR CODE<input value={code} onChange={e=>setCode(e.target.value.trim().toUpperCase())} inputMode="text" style={{display:'block',width:'100%',minHeight:46,marginTop:6,fontSize:16,borderRadius:10,padding:'0 10px'}}/></label>
  <button disabled={!code} onClick={()=>requestCreatorJoin(code)} style={{width:'100%',minHeight:48,marginTop:8,borderRadius:12,fontWeight:950}}>JOIN STREETVERSE GLOBAL</button>
  <button onClick={()=>requestDiscordShare('creator-pass')} style={{width:'100%',minHeight:48,marginTop:8,borderRadius:12,fontWeight:950}}>SHARE CREATOR PASS TO DISCORD</button>
  <small style={{display:'block',marginTop:12}}>First-session path: Spawn → Mission → LIVE/PK → Reel moment → Share.</small>
 </section>
}
