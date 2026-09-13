import {useEffect,useMemo,useRef,useState} from 'react'
import {HYDE_PARK_SLICE} from '../config/streetverseCommunitySlices'

const SAVE_KEY='tryamm.streetverse.hyde-park.mobile.v1'
type Pos={x:number;y:number}
type Saved={x?:number;y?:number;car?:Pos;heading?:number;visited?:string[]}
const clamp=(v:number,min:number,max:number)=>Math.max(min,Math.min(max,v))
function loadSaved():Saved{try{return JSON.parse(localStorage.getItem(SAVE_KEY)||'{}')}catch{return{}}}

export default function StreetVerseHydeParkMobileWorld({onClose}:{onClose:()=>void}){
 const missions=HYDE_PARK_SLICE.missions
 const saved=useMemo(loadSaved,[])
 const [pos,setPos]=useState<Pos>(()=>({x:Number(saved.x)||50,y:Number(saved.y)||68}))
 const [car,setCar]=useState<Pos>(()=>saved.car||{x:54,y:68})
 const [vehicle,setVehicle]=useState(false)
 const [heading,setHeading]=useState(Number(saved.heading)||0)
 const [visited,setVisited]=useState<string[]>(()=>Array.isArray(saved.visited)?saved.visited.filter(id=>missions.some(m=>m.id===id)):[])
 const [message,setMessage]=useState('Hyde Park StreetVerse active • reach the four neighborhood checkpoints.')
 const posRef=useRef(pos),carRef=useRef(car),vehicleRef=useRef(vehicle),headingRef=useRef(heading),visitedRef=useRef(visited)
 const held=useRef({up:false,down:false,left:false,right:false})
 const near=useMemo(()=>missions.find(m=>Math.hypot(pos.x-m.x,pos.y-m.y)<6)||null,[pos,missions])
 const carDistance=useMemo(()=>Math.hypot(pos.x-car.x,pos.y-car.y),[pos,car])
 useEffect(()=>{posRef.current=pos},[pos]);useEffect(()=>{carRef.current=car},[car]);useEffect(()=>{vehicleRef.current=vehicle},[vehicle]);useEffect(()=>{headingRef.current=heading},[heading]);useEffect(()=>{visitedRef.current=visited},[visited])

 useEffect(()=>{
  let raf=0,last=performance.now(),lastSave=0
  const tick=(now:number)=>{
   const dt=Math.min(.05,(now-last)/1000);last=now
   const h=held.current;let dx=(h.right?1:0)-(h.left?1:0),dy=(h.down?1:0)-(h.up?1:0)
   if(dx||dy){const len=Math.hypot(dx,dy)||1;dx/=len;dy/=len;const speed=vehicleRef.current?38:24;const p=posRef.current;const next={x:clamp(p.x+dx*speed*dt,4,96),y:clamp(p.y+dy*speed*dt,8,92)};posRef.current=next;setPos(next);if(vehicleRef.current){carRef.current=next;setCar(next)}const nextHeading=Math.abs(dx)>Math.abs(dy)?(dx>0?90:-90):(dy>0?180:0);if(nextHeading!==headingRef.current){headingRef.current=nextHeading;setHeading(nextHeading)}}
   if(now-lastSave>800){lastSave=now;const p=posRef.current;try{localStorage.setItem(SAVE_KEY,JSON.stringify({...p,car:carRef.current,heading:headingRef.current,visited:visitedRef.current,updatedAt:new Date().toISOString()}))}catch{};window.dispatchEvent(new CustomEvent('tryamm:streetverse-player-position',{detail:{x:(p.x-50)*1.8,z:(p.y-50)*1.8,speed:(dx||dy)?(vehicleRef.current?12:6):0,mobileSafeMode:true,htmlCity:true,communityAreaNumber:'41',communityAreaName:'Hyde Park',vehicle:vehicleRef.current,vehicleType:vehicleRef.current?'car':undefined,heading:headingRef.current}}))}
   raf=requestAnimationFrame(tick)
  }
  raf=requestAnimationFrame(tick);return()=>cancelAnimationFrame(raf)
 },[])

 useEffect(()=>{
  if(!near)return
  if(visitedRef.current.includes(near.id)){setMessage(`${near.label} already checked in • ${visitedRef.current.length}/${missions.length}`);return}
  const next=[...visitedRef.current,near.id];visitedRef.current=next;setVisited(next)
  const detail={id:near.id,label:near.label,reference:near.reference,kind:near.kind,communityAreaNumber:'41',communityAreaName:'Hyde Park',vehicle:vehicleRef.current,mobileSafeMode:true,htmlCity:true,visited:next.length,total:missions.length}
  setMessage(`Checkpoint reached: ${near.label} • ${next.length}/${missions.length}`)
  window.dispatchEvent(new CustomEvent('tryamm:streetverse-mobile-mission-zone',{detail}));window.dispatchEvent(new CustomEvent('tryamm:streetverse-checkpoint',{detail}))
  if(next.length===missions.length){const complete={id:'district-01-mobile-safe',label:'StreetVerse Hyde Park',communityAreaNumber:'41',communityAreaName:'Hyde Park',mobileSafeMode:true,htmlCity:true,visited:next,total:missions.length,source:'streetverse-hyde-park-mobile'};setMessage('HYDE PARK COMPLETE ✓ • authoritative reward check is ready • open REEL after claim.');window.dispatchEvent(new CustomEvent('tryamm:streetverse-mission-complete',{detail:complete}));window.dispatchEvent(new CustomEvent('tryamm:toast',{detail:{message:'Hyde Park complete • 4/4 neighborhood checkpoints ✓'}}))}
 },[near?.id,missions])

 const interactVehicle=()=>{if(!vehicleRef.current){if(carDistance>10){setMessage(`Blue car is ${Math.round(carDistance)}m away • move closer.`);return}vehicleRef.current=true;setVehicle(true);posRef.current={...carRef.current};setPos({...carRef.current});setMessage('DRIVE MODE • HYDE PARK')}else{vehicleRef.current=false;setVehicle(false);setMessage('WALK MODE • HYDE PARK')}}
 useEffect(()=>{const map:Record<string,keyof typeof held.current>={arrowup:'up',w:'up',arrowdown:'down',s:'down',arrowleft:'left',a:'left',arrowright:'right',d:'right'};const kd=(e:KeyboardEvent)=>{if(e.key.toLowerCase()==='e'&&!e.repeat){e.preventDefault();interactVehicle();return}const k=map[e.key.toLowerCase()];if(k){e.preventDefault();held.current[k]=true}};const ku=(e:KeyboardEvent)=>{const k=map[e.key.toLowerCase()];if(k)held.current[k]=false};window.addEventListener('keydown',kd);window.addEventListener('keyup',ku);return()=>{window.removeEventListener('keydown',kd);window.removeEventListener('keyup',ku)}},[carDistance])
 const press=(k:keyof typeof held.current,v:boolean)=>{held.current[k]=v}
 const control=(label:string,k:keyof typeof held.current)=><button aria-label={label} onPointerDown={e=>{e.preventDefault();press(k,true)}} onPointerUp={()=>press(k,false)} onPointerCancel={()=>press(k,false)} onPointerLeave={()=>press(k,false)} style={{width:58,height:58,borderRadius:17,border:'1px solid #7be9ff99',background:'#07131ff2',color:'#fff',fontSize:24,fontWeight:900,touchAction:'none'}}>{label}</button>
 const openReel=()=>window.dispatchEvent(new CustomEvent('tryamm:open-reel-creator',{detail:{source:'streetverse-hyde-park-mobile',missionProgress:`${visited.length}/${missions.length}`,communityAreaNumber:'41',communityAreaName:'Hyde Park',vehicle,mobileSafeMode:true,htmlCity:true}}))

 return <div data-streetverse-html-city="true" data-community-area="41" style={{position:'fixed',inset:0,zIndex:18000,background:'linear-gradient(#5998bd 0 33%,#d6bd91 34% 39%,#1b2830 40% 100%)',color:'#fff',fontFamily:'system-ui',overflow:'hidden'}}>
  <header style={{height:68,display:'flex',alignItems:'center',justifyContent:'space-between',gap:8,padding:'0 10px',background:'#020712f3',borderBottom:'1px solid #274963'}}><div><b>STREETVERSE • HYDE PARK</b><div style={{fontSize:11,color:'#8effb7'}}>COMMUNITY AREA 41 • {vehicle?'DRIVE':'WALK'} • {visited.length}/4</div></div><div style={{display:'flex',gap:6,overflowX:'auto'}}><button onClick={interactVehicle} style={{minHeight:44,borderRadius:11,border:'1px solid #59e7ff',background:'#071b25',color:'#9af0ff',fontWeight:900}}>{vehicle?'EXIT CAR':'ENTER CAR'}</button><button onClick={openReel} style={{minHeight:44,borderRadius:11,border:'1px solid #ff7ce8',background:'#251027',color:'#fff',fontWeight:900}}>● REEL</button><button onClick={onClose} aria-label="Close Hyde Park StreetVerse" style={{width:44,height:44,borderRadius:11,border:'1px solid #567',background:'#101923',color:'#fff'}}>×</button></div></header>
  <main style={{position:'absolute',inset:'68px 0 0',overflow:'hidden'}}>
   <div style={{position:'absolute',left:10,right:10,top:10,zIndex:30,padding:'10px 12px',borderRadius:12,background:'#030914e8',border:'1px solid #4e7891'}}>{message}<div style={{fontSize:10,color:'#b9c9d6',marginTop:4}}>HYDE PARK SLICE • BUILDING • 53RD STREET / LAKE PARK / LAKEFRONT</div></div>
   <div aria-hidden="true" style={{position:'absolute',left:'8%',right:'8%',top:'20%',bottom:'10%',background:'#252a31',clipPath:'polygon(36% 0,64% 0,96% 100%,4% 100%)',boxShadow:'inset 0 0 0 2px #4b5158'}}/>
   {missions.map((m,i)=>{const done=visited.includes(m.id);return <div key={m.id} title={m.reference} style={{position:'absolute',left:`${18+i*21}%`,top:`${31+(i%2)*17}%`,zIndex:12,textAlign:'center',transform:'translateX(-50%)'}}><div style={{width:18,height:18,margin:'auto',borderRadius:'50%',background:done?'#55e88a':'#ffd65a',border:'2px solid white',boxShadow:done?'0 0 18px #55e88a':'0 0 20px #ffd65a'}}>{done?'✓':''}</div><div style={{marginTop:6,padding:'5px 7px',borderRadius:7,background:'#030914e8',fontSize:9,fontWeight:800,maxWidth:150}}>{m.label}<div style={{fontSize:7,color:'#9fc7dd',marginTop:2}}>{m.reference}</div></div></div>})}
   <div aria-label={vehicle?'Player driving blue StreetVerse car':'Player'} style={{position:'absolute',left:'50%',bottom:'17%',width:vehicle?46:28,height:vehicle?64:48,transform:`translateX(-50%) rotate(${vehicle?heading:0}deg)`,zIndex:14,borderRadius:vehicle?11:14,background:vehicle?'#36a9e8':'#23d9f4',border:'3px solid #fff',boxShadow:'0 0 22px #23d9f488'}}/>
   {!vehicle&&<div aria-label={`Parked blue car ${Math.round(carDistance)} meters away`} style={{position:'absolute',left:`${clamp(50+(car.x-pos.x)*1.1,10,90)}%`,top:`${clamp(60+(car.y-pos.y)*.7,28,80)}%`,width:30,height:44,transform:'translate(-50%,-50%)',borderRadius:8,background:'#36a9e8',border:'2px solid #dff8ff'}}/>}
   <div style={{position:'absolute',left:14,bottom:18,zIndex:35,display:'grid',gridTemplateColumns:'58px 58px 58px',gap:7}}><span/>{control('↑','up')}<span/>{control('←','left')}{control('↓','down')}{control('→','right')}</div>
   <div style={{position:'absolute',right:12,bottom:18,zIndex:35,maxWidth:190,padding:9,borderRadius:12,background:'#030914df',border:'1px solid #34566d',fontSize:10,lineHeight:1.35}}>MOBILE SAFE WORLD<br/><b style={{color:'#8effb7'}}>HYDE PARK</b><br/>Neighborhood-specific mission labels and area-41 event metadata active.</div>
  </main>
 </div>
}
