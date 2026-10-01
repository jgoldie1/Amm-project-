import React,{useEffect,useMemo,useState} from 'react'
import type {OmniBoardEvent} from '../runtime/OmniLiveEventBoard'
import {normalizeOmniBoardEvent} from '../runtime/OmniLiveEventBoard'

type Props={open:boolean;onClose:()=>void}
export default function OmniLivePanel({open,onClose}:Props){
 const [events,setEvents]=useState<OmniBoardEvent[]>([])
 const [filter,setFilter]=useState('all')
 const [pk,setPk]=useState({left:0,right:0})
 useEffect(()=>{const onEvent=(e:Event)=>{const d=(e as CustomEvent<OmniBoardEvent>).detail;if(d?.id)setEvents(v=>[d,...v.filter(x=>x.id!==d.id)].slice(0,100))};const onPk=(e:Event)=>{const d=(e as CustomEvent<{left:number;right:number}>).detail;if(d)setPk(d)};window.addEventListener('tryamm:omni-board-event',onEvent);window.addEventListener('tryamm:omni-pk-score',onPk);return()=>{window.removeEventListener('tryamm:omni-board-event',onEvent);window.removeEventListener('tryamm:omni-pk-score',onPk)}},[])
 const visible=useMemo(()=>events.filter(x=>filter==='all'||x.platform===filter).map(normalizeOmniBoardEvent),[events,filter])
 if(!open)return null
 return <aside aria-label="Omni LIVE" style={{position:'fixed',right:8,bottom:'calc(112px + env(safe-area-inset-bottom))',zIndex:48000,width:'min(92vw,380px)',maxHeight:'52vh',overflow:'hidden',borderRadius:16,background:'rgba(4,8,18,.94)',color:'#fff',padding:10,border:'1px solid rgba(127,233,255,.45)'}}>
  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}><strong>OMNI LIVE</strong><button onClick={onClose} aria-label="Close Omni LIVE">×</button></div>
  <div aria-label="Omni PK score" style={{margin:'8px 0',fontWeight:800}}>PK {pk.left} — {pk.right}</div>
  <select aria-label="Filter streaming platform" value={filter} onChange={e=>setFilter(e.target.value)} style={{width:'100%',minHeight:44}}>
   <option value="all">ALL STREAMS</option><option value="tryamm">TRYAMM</option><option value="youtube">YouTube</option><option value="twitch">Twitch</option><option value="tiktok">TikTok</option><option value="bigo">BIGO</option><option value="kick">Kick</option><option value="facebook">Facebook</option>
  </select>
  <div aria-live="polite" style={{overflowY:'auto',maxHeight:'32vh',marginTop:8}}>
   {visible.length===0?<p style={{opacity:.7}}>Comments, translations, verified gifts and PK events appear here.</p>:visible.map(x=><div key={x.id} style={{padding:'7px 0',borderBottom:'1px solid rgba(255,255,255,.1)'}}>
    <div style={{display:'flex',gap:7,alignItems:'center'}}>{x.userAvatarUrl?<img src={x.userAvatarUrl} alt="" width="28" height="28" style={{borderRadius:'50%'}}/>:null}<b>{x.platformIconKey} {x.userName}</b><small>{x.platform}</small></div>
    <div>{x.displayText}</div>{x.showTranslation?<small>Translated from {x.originalLanguage||'auto'}</small>:null}
    {(x.kind==='gift'||x.kind==='tip')?<div>{x.verified?'✓ VERIFIED':'DISPLAY ONLY'} {x.amount??''} {x.currency??''}</div>:null}
   </div>)}
  </div>
  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginTop:8}}>
   <button style={{minHeight:44}} onClick={()=>dispatchEvent(new CustomEvent('tryamm:volcano-holocast-open',{detail:{keepGameplayActive:true}}))}>CAST / TV</button>
   <button style={{minHeight:44}} onClick={()=>dispatchEvent(new CustomEvent('tryamm:omni-live-end-request'))}>END LIVE</button>
  </div>
 </aside>
}
