import {useEffect,useRef,useState} from 'react'
import {
 STREETVERSE_LEGACY_PROJECTS,STREETVERSE_LEGACY_SAVE_KEY,STREETVERSE_LEGACY_UPDATED,
 awardStreetVerseLegacyMission,buildStreetVerseLegacyProject,
 initialStreetVerseCommunityLegacy,readStreetVerseCommunityLegacy,serializeStreetVerseCommunityLegacy,
 type StreetVerseCommunityLegacyState,type StreetVerseLegacyProjectId,
} from '../runtime/StreetVerseCommunityLegacyRuntime'

const load=():StreetVerseCommunityLegacyState=>{
 if(typeof window==='undefined')return initialStreetVerseCommunityLegacy()
 try{return readStreetVerseCommunityLegacy(localStorage.getItem(STREETVERSE_LEGACY_SAVE_KEY))}
 catch{return initialStreetVerseCommunityLegacy()}
}

const buttonStyle={minHeight:48,borderRadius:10,border:'1px solid #82ebc1',background:'#103d3e',color:'#fff',padding:'9px 12px',font:'700 13px system-ui',cursor:'pointer'} as const

/** The same single-tap RP improvement control is available on desktop and mobile. */
export default function StreetVerseCommunityLegacyHUD(){
 const [open,setOpen]=useState(false)
 const [legacy,setLegacy]=useState<StreetVerseCommunityLegacyState>(load)
 const [message,setMessage]=useState('Choose one visible Chicago improvement. No real money is used.')
 const current=useRef(legacy)
 const change=(state:StreetVerseCommunityLegacyState)=>{
  current.current=state
  setLegacy(state)
 }
 useEffect(()=>{
  try{localStorage.setItem(STREETVERSE_LEGACY_SAVE_KEY,serializeStreetVerseCommunityLegacy(legacy))}catch{}
  window.dispatchEvent(new CustomEvent(STREETVERSE_LEGACY_UPDATED,{detail:{built:[...legacy.built],points:legacy.points,fictional:true,source:'streetverse-community-legacy'}}))
 },[legacy])

 useEffect(()=>{
  const onDelivery=(event:Event)=>{
   const detail=(event as CustomEvent<{missionId?:string;demo?:boolean;fictional?:boolean}>).detail
   if(detail?.demo!==true||detail.fictional!==true||!detail.missionId)return
   const next=awardStreetVerseLegacyMission(current.current,'delivery:'+detail.missionId)
   if(next.ok){change(next.state);setMessage('Chicago delivery completed: +1 fictional Legacy Point.')}
  }
  const onUicDelivery=()=>{
   const next=awardStreetVerseLegacyMission(current.current,'uic-delivery')
   if(next.ok){change(next.state);setMessage('UIC mission delivered: +1 fictional Legacy Point.')}
  }
  window.addEventListener('tryamm:streetverse-holo-delivery-mission-complete',onDelivery)
  window.addEventListener('tryamm:streetverse-uic-package-delivered',onUicDelivery)
  return()=>{
   window.removeEventListener('tryamm:streetverse-holo-delivery-mission-complete',onDelivery)
   window.removeEventListener('tryamm:streetverse-uic-package-delivered',onUicDelivery)
  }
 },[])

 const build=(id:StreetVerseLegacyProjectId)=>{
  const result=buildStreetVerseLegacyProject(current.current,id)
  setMessage(result.message)
  if(result.ok)change(result.state)
 }
 return <aside data-streetverse-community-legacy="true" style={{position:'fixed',left:'max(10px, env(safe-area-inset-left))',bottom:'calc(env(safe-area-inset-bottom) + 156px)',zIndex:45020,maxWidth:'min(330px,calc(100vw - 20px))',width:open?'min(330px,calc(100vw - 20px))':'auto',maxHeight:'68dvh',overflowY:open?'auto':undefined,padding:open?10:0,border:open?'1px solid #68e4af':undefined,borderRadius:14,background:open?'rgba(4,25,30,.98)':'transparent',boxShadow:open?'0 8px 30px #0009':undefined,color:'#fff',fontFamily:'system-ui,sans-serif'}}>
  <button type="button" aria-label={open?'Close Community Legacy improvements':'Open Community Legacy improvements'} aria-expanded={open} onClick={()=>setOpen(value=>!value)} style={{...buttonStyle,background:'#144d40'}}>🌱 COMMUNITY LEGACY · {legacy.built.length}/3</button>
  {open&&<div style={{display:'grid',gap:9,marginTop:9}}>
   <strong style={{fontSize:16}}>BUILD THE NEIGHBORHOOD</strong>
   <div style={{fontSize:12}}>Your fictional Legacy Points: <strong>{legacy.points}</strong>. You start with one free game point and earn more from completed Chicago deliveries.</div>
   {STREETVERSE_LEGACY_PROJECTS.map(project=><div key={project.id} style={{border:'1px solid #467b67',borderRadius:10,padding:8,display:'grid',gap:5}}>
    <strong style={{fontSize:13}}>{project.label}</strong>
    <span style={{fontSize:12}}>{project.detail}</span>
    <button type="button" style={{...buttonStyle,opacity:legacy.built.includes(project.id)?0.65:1}} disabled={legacy.built.includes(project.id)||legacy.points<project.cost} onClick={()=>build(project.id)}>{legacy.built.includes(project.id)?'BUILT ✓':'BUILD FOR '+project.cost+' GAME POINT'}</button>
   </div>)}
   <div role="status" aria-live="polite" style={{fontSize:12,color:'#a9ffce'}}>{message}</div>
   <small>Fictional neighborhood simulation only. No real construction, donations, token sales, payments or ownership rights.</small>
  </div>}
 </aside>
}
