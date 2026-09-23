import {useEffect,useMemo,useRef,useState} from 'react'
import type {CSSProperties} from 'react'
import type {StreetVerseCommunitySlice} from '../config/streetverseCommunitySlices'

type Props={slice:StreetVerseCommunitySlice;onClose:()=>void}

export default function StreetVerseCommunityMobileWorld({slice,onClose}:Props){
 const [visited,setVisited]=useState<string[]>([])
 const [vehicle,setVehicle]=useState(false)
 const [message,setMessage]=useState(`${slice.name} StreetVerse active • move with the directional pad or tap checkpoints.`)
 const [pos,setPos]=useState({x:50,y:62})
 const posRef=useRef(pos)
 const held=useRef({up:false,down:false,left:false,right:false})
 const total=slice.missions.length
 useEffect(()=>{posRef.current=pos},[pos])
 useEffect(()=>{let raf=0,last=performance.now();const tick=(now:number)=>{const dt=Math.min(.05,(now-last)/1000);last=now;const h=held.current;let dx=(h.right?1:0)-(h.left?1:0),dy=(h.down?1:0)-(h.up?1:0);if(dx||dy){const len=Math.hypot(dx,dy)||1;dx/=len;dy/=len;const p=posRef.current;const next={x:Math.max(5,Math.min(95,p.x+dx*28*dt)),y:Math.max(8,Math.min(92,p.y+dy*28*dt))};posRef.current=next;setPos(next);window.dispatchEvent(new CustomEvent('tryamm:streetverse-player-position',{detail:{x:next.x,y:next.y,mobileSafeMode:true,htmlCity:true}}))}raf=requestAnimationFrame(tick)};raf=requestAnimationFrame(tick);return()=>cancelAnimationFrame(raf)},[])
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
 const reset=()=>{setVisited([]);setPos({x:50,y:62});setMessage(`${slice.name} StreetVerse reset • move or complete checkpoints.`)}
 const moveButton=(label:string,key:keyof typeof held.current)=><button aria-label={`Move ${key}`} onPointerDown={e=>{e.preventDefault();held.current[key]=true}} onPointerUp={()=>held.current[key]=false} onPointerCancel={()=>held.current[key]=false} onPointerLeave={()=>held.current[key]=false} style={{...buttonStyle,width:54,height:50,fontSize:20,touchAction:'none'}}>{label}</button>
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
   <section aria-label="StreetVerse movement area" style={{height:180,position:'relative',borderRadius:14,background:'linear-gradient(#24485e 0 35%,#18252f 35% 100%)',border:'1px solid #4e7891',marginBottom:12,overflow:'hidden'}}>
    <div aria-label="Player" style={{position:'absolute',left:`${pos.x}%`,top:`${pos.y}%`,transform:'translate(-50%,-50%)',width:24,height:34,borderRadius:10,background:'#23d9f4',border:'2px solid #fff'}} />
    <div style={{position:'absolute',left:10,bottom:10,display:'grid',gridTemplateColumns:'54px 54px 54px',gap:5}}><span/>{moveButton('▲','up')}<span/>{moveButton('◀','left')}{moveButton('▼','down')}{moveButton('▶','right')}</div>
    <div style={{position:'absolute',right:10,bottom:10,fontSize:11,color:'#bfefff'}}>MOVE • all 4 directions</div>
   </section>
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
