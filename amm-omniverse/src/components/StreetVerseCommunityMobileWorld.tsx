import {useEffect,useMemo,useState} from 'react'
import type {CSSProperties} from 'react'
import type {StreetVerseCommunitySlice} from '../config/streetverseCommunitySlices'

type Props={slice:StreetVerseCommunitySlice;onClose:()=>void}

export default function StreetVerseCommunityMobileWorld({slice,onClose}:Props){
 const [visited,setVisited]=useState<string[]>([])
 const [vehicle,setVehicle]=useState(false)
 const [message,setMessage]=useState(`${slice.name} StreetVerse active • complete all checkpoints.`)
 const total=slice.missions.length
 const done=visited.length===total
 const saveKey=`tryamm.streetverse.community-${slice.communityAreaNumber}.mobile.v1`

 useEffect(()=>{
  try{
   const saved=JSON.parse(localStorage.getItem(saveKey)||'{}')
   if(Array.isArray(saved.visited))setVisited(saved.visited.filter((id:string)=>slice.missions.some(m=>m.id===id)))
  }catch{}
 },[saveKey,slice.missions])

 useEffect(()=>{
  try{localStorage.setItem(saveKey,JSON.stringify({visited,vehicle,updatedAt:new Date().toISOString()}))}catch{}
 },[saveKey,visited,vehicle])

 const visit=(id:string)=>{
  const mission=slice.missions.find(m=>m.id===id)
  if(!mission||visited.includes(id))return
  const next=[...visited,id]
  setVisited(next)
  const detail={id:mission.id,label:mission.label,reference:mission.reference,kind:mission.kind,communityAreaNumber:slice.communityAreaNumber,communityAreaName:slice.name,vehicle,mobileSafeMode:true,htmlCity:true,visited:next.length,total}
  setMessage(`Checkpoint reached: ${mission.label} • ${next.length}/${total}`)
  window.dispatchEvent(new CustomEvent('tryamm:streetverse-mobile-mission-zone',{detail}))
  window.dispatchEvent(new CustomEvent('tryamm:streetverse-checkpoint',{detail}))
  if(next.length===total){
   const complete={id:`community-${slice.communityAreaNumber}-mobile-safe`,label:`StreetVerse ${slice.name}`,communityAreaNumber:slice.communityAreaNumber,communityAreaName:slice.name,mobileSafeMode:true,htmlCity:true,visited:next,total,source:'streetverse-community-mobile'}
   setMessage(`${slice.name.toUpperCase()} COMPLETE ✓ • reward verification and REEL handoff are ready.`)
   window.dispatchEvent(new CustomEvent('tryamm:streetverse-mission-complete',{detail:complete}))
   window.dispatchEvent(new CustomEvent('tryamm:toast',{detail:{message:`${slice.name} complete • ${total}/${total} checkpoints ✓`}}))
  }
 }

 const openReel=()=>window.dispatchEvent(new CustomEvent('tryamm:open-reel-creator',{detail:{source:'streetverse-community-mobile',missionProgress:`${visited.length}/${total}`,communityAreaNumber:slice.communityAreaNumber,communityAreaName:slice.name,vehicle,mobileSafeMode:true,htmlCity:true}}))
 const reset=()=>{setVisited([]);setMessage(`${slice.name} StreetVerse reset • complete all checkpoints.`)}
 const status=useMemo(()=>done?'COMPLETE':`${visited.length}/${total}`,[done,visited.length,total])

 return <div data-streetverse-html-city="true" data-community-area={slice.communityAreaNumber} style={{position:'fixed',inset:0,zIndex:18000,background:'linear-gradient(#5998bd 0 30%,#d6bd91 30% 36%,#18252f 36% 100%)',color:'#fff',fontFamily:'system-ui',overflow:'auto'}}>
  <header style={{position:'sticky',top:0,zIndex:20,minHeight:68,display:'flex',alignItems:'center',justifyContent:'space-between',gap:8,padding:'8px 10px',background:'#020712f3',borderBottom:'1px solid #274963'}}>
   <div><b>STREETVERSE • {slice.name.toUpperCase()}</b><div style={{fontSize:11,color:'#8effb7'}}>COMMUNITY AREA {slice.communityAreaNumber} • {vehicle?'DRIVE':'WALK'} • {status}</div></div>
   <div style={{display:'flex',gap:6,flexWrap:'wrap',justifyContent:'flex-end'}}>
    <button onClick={()=>setVehicle(v=>!v)} style={buttonStyle}>{vehicle?'EXIT CAR':'ENTER CAR'}</button>
    <button onClick={openReel} style={buttonStyle}>● REEL</button>
    <button onClick={reset} style={buttonStyle}>RESET</button>
    <button onClick={onClose} aria-label={`Close ${slice.name} StreetVerse`} style={{...buttonStyle,width:44}}>×</button>
   </div>
  </header>
  <main style={{padding:14,maxWidth:760,margin:'0 auto'}}>
   <section style={{padding:12,borderRadius:12,background:'#030914e8',border:'1px solid #4e7891',marginBottom:12}}>
    <b>{message}</b>
    <div style={{fontSize:11,color:'#b9c9d6',marginTop:5}}>CHICAGO 77 • {slice.status} • AREA {slice.communityAreaNumber}</div>
   </section>
   <section style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(210px,1fr))',gap:10}}>
    {slice.missions.map(m=>{const complete=visited.includes(m.id);return <button key={m.id} onClick={()=>visit(m.id)} disabled={complete} style={{minHeight:118,textAlign:'left',padding:12,borderRadius:14,border:`1px solid ${complete?'#55e88a':'#ffd65a'}`,background:'#07131ff2',color:'#fff',opacity:complete?0.82:1}}>
     <div style={{fontSize:18,fontWeight:900}}>{complete?'✓ ':'○ '}{m.label}</div>
     <div style={{fontSize:12,color:'#9fc7dd',marginTop:7}}>{m.reference}</div>
     <div style={{fontSize:10,color:'#b9c9d6',marginTop:8}}>{m.kind.toUpperCase()} • checkpoint ({m.x},{m.y})</div>
    </button>})}
   </section>
   <section style={{marginTop:12,padding:12,borderRadius:12,background:'#030914df',border:'1px solid #34566d',fontSize:12,lineHeight:1.45}}>
    <b style={{color:'#8effb7'}}>MOBILE SAFE WORLD • {slice.name.toUpperCase()}</b><br/>
    Chicago 77 mission metadata, checkpoint events, reward completion event and Reel handoff are active for this community-area slice.
   </section>
  </main>
 </div>
}

const buttonStyle:CSSProperties={minHeight:44,borderRadius:11,border:'1px solid #59e7ff',background:'#071b25',color:'#fff',fontWeight:900,padding:'0 10px'}
