import {useEffect,useState} from 'react'
import {STREETVERSE_RESOURCE_EVENTS,STREETVERSE_RESOURCE_NETWORK,requestResourcePassportReward,type StreetVerseResourceCategory} from '../data/streetVerseResourceNetwork'

export default function StreetVerseResourcePassport({onClose}:{onClose:()=>void}){
 const [used,setUsed]=useState<Set<StreetVerseResourceCategory>>(()=>new Set())
 useEffect(()=>{const handlers=Object.entries(STREETVERSE_RESOURCE_EVENTS).map(([event,category])=>{const fn=()=>setUsed(prev=>{const next=new Set(prev);next.add(category);return next});window.addEventListener(event,fn);return[event,fn] as const});return()=>handlers.forEach(([event,fn])=>window.removeEventListener(event,fn))},[])
 const all=STREETVERSE_RESOURCE_NETWORK.length,done=used.size,next=STREETVERSE_RESOURCE_NETWORK.find(x=>!used.has(x.id))
 return <section aria-label="StreetVerse Resource Passport" style={{position:'fixed',inset:12,zIndex:47000,overflow:'auto',padding:14,borderRadius:18,background:'#07151cf5',color:'#fff'}}>
  <button onClick={onClose} style={{minHeight:44,borderRadius:12,fontWeight:900}}>← GAME</button>
  <h2>RESOURCE PASSPORT</h2><strong>{done}/{all} WORLD SYSTEMS USED</strong>
  <p>{next?'NEXT: '+next.label+' • '+next.examples[0]:'FULL-WORLD EXPLORER COMPLETE'}</p>
  {STREETVERSE_RESOURCE_NETWORK.map(r=><div key={r.id} style={{padding:'8px 0',borderTop:'1px solid #ffffff22'}}><strong>{used.has(r.id)?'✓':'○'} {r.label}</strong><small style={{display:'block'}}>{r.examples.join(' • ')}</small></div>)}
  {done===all&&<button onClick={()=>requestResourcePassportReward([...used])} style={{width:'100%',minHeight:52,marginTop:10,borderRadius:12,fontWeight:950}}>CLAIM FULL-WORLD EXPLORER REWARD</button>}
  <small style={{display:'block',marginTop:10}}>Rewards are server-validated. The goal is to encourage exploration, not force one play style.</small>
 </section>
}
