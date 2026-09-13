import {useEffect,useMemo,useRef,useState} from 'react'
import {HYDE_PARK_SLICE} from '../config/streetverseCommunitySlices'

const SAVE_KEY='tryamm.streetverse.hyde-park-mobile.v1'
const SAFE_CAR_ID='hyde-park-safe-starter-car'
const missions=HYDE_PARK_SLICE.missions

type Pos={x:number;y:number}
type Saved={x?:number;y?:number;vehicle?:boolean;car?:Pos;heading?:number;visited?:string[]}
const clamp=(v:number,min:number,max:number)=>Math.max(min,Math.min(max,v))
function loadSaved():Saved{try{return JSON.parse(localStorage.getItem(SAVE_KEY)||'{}')}catch{return{}}}
function loadPos():Pos{const p=loadSaved();return{x:Number.isFinite(p.x)?Number(p.x):50,y:Number.isFinite(p.y)?Number(p.y):68}}
function loadCar():Pos{const p=loadSaved().car;return{x:Number.isFinite(p?.x)?Number(p?.x):54,y:Number.isFinite(p?.y)?Number(p?.y):68}}
function loadVisited(){const v=loadSaved().visited;return Array.isArray(v)?v.filter(id=>missions.some(m=>m.id===id)):[]}
function loadHeading(){const h=Number(loadSaved().heading);return Number.isFinite(h)?h:0}

export default function StreetVerseHydeParkMobilePlayableWorld({onClose}:{onClose:()=>void}){
 const [pos,setPos]=useState<Pos>(loadPos)
 const posRef=useRef(pos)
 const [carPos,setCarPos]=useState<Pos>(loadCar)
 const carPosRef=useRef(carPos)
 const [vehicle,setVehicle]=useState(false)
 const vehicleRef=useRef(false)
 const [heading,setHeading]=useState(loadHeading)
 const headingRef=useRef(heading)
 const [visited,setVisited]=useState<string[]>(loadVisited)
 const visitedRef=useRef(visited)
 const [message,setMessage]=useState('Hyde Park is active • reach the four neighborhood checkpoints.')
 const held=useRef({up:false,down:false,left:false,right:false})
 const nearMission=useMemo(()=>missions.find(m=>Math.hypot(pos.x-m.x,pos.y-m.y)<6)||null,[pos])
 const carDistance=useMemo(()=>Math.hypot(pos.x-carPos.x,pos.y-carPos.y),[pos,carPos])

 useEffect(()=>{posRef.current=pos},[pos])
 useEffect(()=>{carPosRef.current=carPos},[carPos])
 useEffect(()=>{visitedRef.current=visited},[visited])
 useEffect(()=>{headingRef.current=heading},[heading])

 useEffect(()=>{
  let raf=0,last=performance.now(),lastSave=0
  const tick=(now:number)=>{
   const dt=Math.min(.05,(now-last)/1000);last=now
   const h=held.current
   let dx=(h.right?1:0)-(h.left?1:0),dy=(h.down?1:0)-(h.up?1:0)
   if(dx||dy){
    const len=Math.hypot(dx,dy)||1;dx/=len;dy/=len
    const moveSpeed=vehicleRef.current?38:24
    const p=posRef.current
    const next={x:clamp(p.x+dx*moveSpeed*dt,4,96),y:clamp(p.y+dy*moveSpeed*dt,8,92)}
    posRef.current=next;setPos(next)
    if(vehicleRef.current){carPosRef.current=next;setCarPos(next)}
    const nextHeading=Math.abs(dx)>Math.abs(dy)?(dx>0?90:-90):(dy>0?180:0)
    if(nextHeading!==headingRef.current){headingRef.current=nextHeading;setHeading(nextHeading)}
   }
   if(now-lastSave>800){
    lastSave=now
    const p=posRef.current,c=carPosRef.current
    localStorage.setItem(SAVE_KEY,JSON.stringify({...p,vehicle:vehicleRef.current,car:c,heading:headingRef.current,visited:visitedRef.current,updatedAt:new Date().toISOString()}))
    const detail={x:(p.x-50)*1.8,z:(p.y-50)*1.8,speed:(dx||dy)?(vehicleRef.current?12:6):0,mobileSafeMode:true,htmlCity:true,communityAreaNumber:'41',communityAreaName:'Hyde Park',vehicle:vehicleRef.current,vehicleType:vehicleRef.current?'car':undefined,controlledVehicleId:vehicleRef.current?SAFE_CAR_ID:undefined,heading:headingRef.current}
    window.dispatchEvent(new CustomEvent('tryamm:streetverse-player-position',{detail}))
    if(vehicleRef.current)window.dispatchEvent(new CustomEvent('tryamm:streetverse-drive-telemetry',{detail:{...detail,entered:true}}))
   }
   raf=requestAnimationFrame(tick)
  }
  raf=requestAnimationFrame(tick)
  return()=>cancelAnimationFrame(raf)
 },[])

 useEffect(()=>{
  if(!nearMission){setMessage(vehicle?'DRIVE MODE • cruise Hyde Park and reach the glowing neighborhood checkpoints.':'Hyde Park is active • walk to a neighborhood checkpoint or enter the blue car.');return}
  if(visitedRef.current.includes(nearMission.id)){setMessage(`${nearMission.label} already checked in • ${visitedRef.current.length}/${missions.length} complete.`);return}
  const next=[...visitedRef.current,nearMission.id]
  visitedRef.current=next;setVisited(next)
  const detail={id:nearMission.id,label:nearMission.label,reference:nearMission.reference,kind:nearMission.kind,vehicle:vehicleRef.current,mobileSafeMode:true,htmlCity:true,communityAreaNumber:'41',communityAreaName:'Hyde Park',visited:next.length,total:missions.length}
  setMessage(`Checkpoint reached: ${nearMission.label} • ${next.length}/${missions.length}`)
  window.dispatchEvent(new CustomEvent('tryamm:streetverse-mobile-mission-zone',{detail}))
  window.dispatchEvent(new CustomEvent('tryamm:streetverse-checkpoint',{detail}))
  if(next.length===missions.length){
   const complete={id:'district-01-mobile-safe',label:'StreetVerse Hyde Park',mobileSafeMode:true,htmlCity:true,communityAreaNumber:'41',communityAreaName:'Hyde Park',visited:next,total:missions.length,source:'streetverse-mobile-safe'}
   setMessage('HYDE PARK DISTRICT COMPLETE ✓ • open REEL to capture your run.')
   window.dispatchEvent(new CustomEvent('tryamm:streetverse-mission-complete',{detail:complete}))
   window.dispatchEvent(new CustomEvent('tryamm:toast',{detail:{message:'Hyde Park complete • 4/4 checkpoints ✓'}}))
  }
 },[nearMission?.id,vehicle])

 useEffect(()=>{
  const onVehicle=(event:Event)=>{
   const detail=(event as CustomEvent<{entered?:boolean}>).detail||{}
   const wantsEnter=typeof detail.entered==='boolean'?detail.entered:!vehicleRef.current
   if(wantsEnter){
    if(vehicleRef.current)return
    const p=posRef.current,c=carPosRef.current,distance=Math.hypot(p.x-c.x,p.y-c.y)
    if(distance>10){setMessage(`Blue car is ${Math.round(distance)}m away • move closer before entering.`);window.dispatchEvent(new CustomEvent('tryamm:streetverse-vehicle-denied',{detail:{reason:'too-far',distance,mobileSafeMode:true,htmlCity:true,communityAreaNumber:'41',communityAreaName:'Hyde Park',controlledVehicleId:SAFE_CAR_ID}}));return}
    vehicleRef.current=true;setVehicle(true);posRef.current={...c};setPos({...c});setMessage('Blue car entered • HYDE PARK DRIVE MODE active.')
    window.dispatchEvent(new CustomEvent('tryamm:streetverse-vehicle-controlled',{detail:{entered:true,mobileSafeMode:true,htmlCity:true,communityAreaNumber:'41',communityAreaName:'Hyde Park',vehicleType:'car',controlledVehicleId:SAFE_CAR_ID,x:(c.x-50)*1.8,z:(c.y-50)*1.8}}));return
   }
   if(!vehicleRef.current)return
   const c={...carPosRef.current},r=headingRef.current*Math.PI/180
   const exit={x:clamp(c.x+Math.cos(r)*4.5,4,96),y:clamp(c.y+Math.sin(r)*4.5,8,92)}
   vehicleRef.current=false;setVehicle(false);posRef.current=exit;setPos(exit);setMessage('Vehicle exited • HYDE PARK WALK MODE restored.')
   window.dispatchEvent(new CustomEvent('tryamm:streetverse-vehicle-controlled',{detail:{entered:false,mobileSafeMode:true,htmlCity:true,communityAreaNumber:'41',communityAreaName:'Hyde Park',vehicleType:'car',controlledVehicleId:SAFE_CAR_ID,x:(exit.x-50)*1.8,z:(exit.y-50)*1.8}}))
  }
  window.addEventListener('tryamm:streetverse-vehicle-interact',onVehicle)
  return()=>window.removeEventListener('tryamm:streetverse-vehicle-interact',onVehicle)
 },[])

 useEffect(()=>{
  const map:Record<string,keyof typeof held.current>={arrowup:'up',w:'up',arrowdown:'down',s:'down',arrowleft:'left',a:'left',arrowright:'right',d:'right'}
  const set=(e:KeyboardEvent,v:boolean)=>{const raw=e.key.toLowerCase();if(raw==='e'&&v&&!e.repeat){e.preventDefault();window.dispatchEvent(new CustomEvent('tryamm:streetverse-vehicle-interact',{detail:{entered:!vehicleRef.current,source:'keyboard'}}));return}const k=map[raw];if(k){e.preventDefault();held.current[k]=v}}
  const kd=(e:KeyboardEvent)=>set(e,true),ku=(e:KeyboardEvent)=>set(e,false)
  window.addEventListener('keydown',kd);window.addEventListener('keyup',ku)
  return()=>{window.removeEventListener('keydown',kd);window.removeEventListener('keyup',ku)}
 },[])

 const press=(k:keyof typeof held.current,v:boolean)=>{held.current[k]=v}
 const btn=(label:string,k:keyof typeof held.current)=><button aria-label={label} onPointerDown={e=>{e.preventDefault();press(k,true)}} onPointerUp={()=>press(k,false)} onPointerCancel={()=>press(k,false)} onPointerLeave={()=>press(k,false)} style={{width:58,height:58,borderRadius:17,border:'1px solid #7be9ff99',background:'#07131ff2',color:'#fff',fontSize:24,fontWeight:900,touchAction:'none',boxShadow:'0 8px 25px #0008'}}>{label}</button>
 const openReel=()=>{window.dispatchEvent(new CustomEvent('tryamm:open-reel-creator',{detail:{source:'streetverse-mobile-safe',missionProgress:`${visited.length}/${missions.length}`,vehicle,mobileSafeMode:true,htmlCity:true,communityAreaNumber:'41',communityAreaName:'Hyde Park'}}));window.dispatchEvent(new CustomEvent('tryamm:toast',{detail:{message:`Opening Reel Creator • Hyde Park ${visited.length}/${missions.length}`}}))}
 const toggleVehicle=()=>window.dispatchEvent(new CustomEvent('tryamm:streetverse-vehicle-interact',{detail:{entered:!vehicle,source:'mobile-header'}}))

 return <div data-streetverse-html-city="true" data-community-area="41" style={{position:'fixed',inset:0,zIndex:18000,background:'linear-gradient(#6aa4c5 0%,#9bcbe0 34%,#d9ba89 35%,#26343a 62%,#07101b 100%)',color:'#fff',fontFamily:'system-ui',overflow:'hidden'}}>
  <header style={{height:68,display:'flex',alignItems:'center',justifyContent:'space-between',gap:8,padding:'0 10px',background:'#020712f2',borderBottom:'1px solid #274963',position:'relative',zIndex:40}}>
   <div><b style={{letterSpacing:.7}}>STREETVERSE • HYDE PARK</b><div style={{fontSize:10,color:'#8effb7'}}>COMMUNITY AREA 41 • {vehicle?'DRIVE':'WALK'} • {visited.length}/{missions.length} • BUILDING</div></div>
   <div style={{display:'flex',gap:6,overflowX:'auto'}}><button onClick={toggleVehicle} aria-label={vehicle?'Exit StreetVerse vehicle':`Enter StreetVerse vehicle ${Math.round(carDistance)} meters away`} style={{minHeight:44,borderRadius:11,border:'1px solid #59e7ff',background:'#071b25',color:'#9af0ff',fontWeight:900,padding:'0 9px',whiteSpace:'nowrap'}}>{vehicle?'EXIT CAR':'ENTER CAR'}</button><button onClick={openReel} aria-label="Open Reel Creator" style={{minHeight:44,borderRadius:11,border:'1px solid #ff7ce8',background:'#251027',color:'#fff',fontWeight:900,padding:'0 10px'}}>● REEL</button><button onClick={onClose} aria-label="Close StreetVerse" style={{width:44,height:44,borderRadius:11,border:'1px solid #567',background:'#101923',color:'#fff',fontSize:22}}>×</button></div>
  </header>
  <main style={{position:'absolute',left:0,right:0,top:68,bottom:0,overflow:'hidden'}}>
   <div aria-live="polite" style={{position:'absolute',left:10,right:10,top:10,zIndex:30,padding:'9px 11px',borderRadius:12,background:'#030914e8',border:'1px solid #4e7891',fontSize:12}}>{message}<div style={{marginTop:5,fontSize:10,color:visited.length===missions.length?'#8effb7':'#b9c9d6'}}>HYDE PARK SLICE • {HYDE_PARK_SLICE.status} • {visited.length}/{missions.length} CHECKPOINTS</div></div>
   <div aria-hidden="true" style={{position:'absolute',left:'7%',right:'7%',top:'20%',bottom:'7%',background:'#242a30',clipPath:'polygon(35% 0,65% 0,97% 100%,3% 100%)',boxShadow:'inset 0 0 0 2px #515a61'}}><div style={{position:'absolute',left:'49%',top:0,bottom:0,width:'2%',background:'repeating-linear-gradient(180deg,#f9e46d 0 24px,transparent 24px 48px)'}}/></div>
   <div style={{position:'absolute',left:'8%',top:'17%',padding:'5px 8px',borderRadius:7,background:'#123d26',border:'2px solid #e4ffe8',fontSize:9,fontWeight:900}}>HYDE PARK • 53RD STREET</div>
   <div style={{position:'absolute',right:'7%',top:'18%',padding:'5px 8px',borderRadius:7,background:'#0a3150',border:'2px solid #dceeff',fontSize:9,fontWeight:900}}>LAKE PARK / LAKEFRONT</div>
   {missions.map((m,i)=>{const done=visited.includes(m.id);const left=[23,72,52,78][i]||50;const top=[37,43,29,68][i]||50;return <div key={m.id} title={`${m.label} • ${m.reference}`} style={{position:'absolute',left:`${left}%`,top:`${top}%`,zIndex:12,textAlign:'center',transform:'translateX(-50%)',maxWidth:150}}><div style={{width:16,height:16,margin:'auto',borderRadius:'50%',background:done?'#55e88a':'#ffd65a',border:'2px solid #fff',boxShadow:done?'0 0 20px #55e88a':'0 0 24px #ffd65a'}}>{done?<span style={{fontSize:10,color:'#06120b'}}>✓</span>:null}</div><div style={{marginTop:6,padding:'5px 6px',borderRadius:7,background:'#030914e8',fontSize:8,fontWeight:900}}>{done?'✓ ':''}{m.label}<div style={{marginTop:2,fontSize:7,color:'#9fc7dd'}}>{m.reference}</div></div></div>})}
   {!vehicle&&<div aria-label={`Parked blue drivable car ${Math.round(carDistance)} meters away`} style={{position:'absolute',left:`${clamp(50+(carPos.x-pos.x)*1.1,10,90)}%`,top:`${clamp(62+(carPos.y-pos.y)*.7,28,82)}%`,width:30,height:44,transform:'translate(-50%,-50%)',zIndex:11,borderRadius:8,background:'#36a9e8',border:'2px solid #dff8ff',boxShadow:'0 0 16px #36a9e888'}}/>}
   {vehicle?<div aria-label="Player driving blue StreetVerse car" style={{position:'absolute',left:'50%',bottom:'16%',width:48,height:68,transform:`translateX(-50%) rotate(${heading}deg)`,zIndex:14,borderRadius:12,background:'#36a9e8',border:'3px solid #fff',boxShadow:'0 0 24px #36a9e8aa'}}/>:<div aria-label="Player" style={{position:'absolute',left:'50%',bottom:'17%',width:30,height:50,transform:'translateX(-50%)',zIndex:14,borderRadius:14,background:'#23d9f4',border:'3px solid #fff',boxShadow:'0 0 20px #23d9f4aa'}}/>}
   <div style={{position:'absolute',left:14,bottom:18,zIndex:35,display:'grid',gridTemplateColumns:'58px 58px 58px',gap:7}}><span/>{btn('↑','up')}<span/>{btn('←','left')}{btn('↓','down')}{btn('→','right')}</div>
   <div style={{position:'absolute',right:12,bottom:18,zIndex:35,maxWidth:190,padding:9,borderRadius:12,background:'#030914df',border:'1px solid #34566d',fontSize:10,lineHeight:1.35}}>MOBILE SAFE WORLD<br/><b style={{color:'#8effb7'}}>HYDE PARK • AREA 41</b><br/>Neighborhood-specific checkpoints • vehicle • Reel handoff.</div>
  </main>
 </div>
}
