import {useEffect,useMemo,useRef,useState} from 'react'

const SAVE_KEY='tryamm.streetverse.mobile-playable.v2'
const MISSIONS=[
 {id:'studio',label:'Aniyah 64 Track Studio',x:32,y:38},
 {id:'market',label:'All American Marketplace',x:70,y:42},
 {id:'river',label:'Chicago Riverwalk',x:52,y:22},
 {id:'stage',label:'Creator Stage',x:68,y:72},
]

const BUILDINGS=[
 {left:0,width:17,height:48,label:'TRYAMM TOWER'},{left:13,width:15,height:37,label:'OMNI MARKET'},{left:25,width:13,height:56,label:'64 TRACK'},{left:35,width:17,height:43,label:'HOLO PLAZA'},{left:49,width:13,height:62,label:'STUBBS AI'},{left:59,width:17,height:46,label:'CREATOR HUB'},{left:73,width:13,height:54,label:'OMNI CASH'},{left:84,width:16,height:41,label:'CHICAGO LIVE'},
]
const PEOPLE=[{left:'13%',top:'39%'},{left:'21%',top:'53%'},{left:'77%',top:'45%'},{left:'84%',top:'61%'},{left:'63%',top:'34%'}]
const SAFE_CAR_ID='safe-starter-car'

type Pos={x:number;y:number}
type Saved={x?:number;y?:number;vehicle?:boolean;car?:Pos;heading?:number;visited?:string[]}
const clamp=(v:number,min:number,max:number)=>Math.max(min,Math.min(max,v))
function loadSaved():Saved{try{return JSON.parse(localStorage.getItem(SAVE_KEY)||'{}')}catch{return{}}}
function loadPos():Pos{const p=loadSaved();return{x:Number.isFinite(p.x)?Number(p.x):50,y:Number.isFinite(p.y)?Number(p.y):68}}
function loadCar():Pos{const p=loadSaved().car;return{x:Number.isFinite(p?.x)?Number(p?.x):54,y:Number.isFinite(p?.y)?Number(p?.y):68}}
function loadVisited(){const v=loadSaved().visited;return Array.isArray(v)?v.filter(id=>MISSIONS.some(m=>m.id===id)):[]}
function loadHeading(){const h=Number(loadSaved().heading);return Number.isFinite(h)?h:0}

export default function StreetVerseMobilePlayableWorld({onClose}:{onClose:()=>void}){
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
 const [message,setMessage]=useState('StreetVerse City is active • walk to a mission beacon or enter the blue car near your spawn.')
 const held=useRef({up:false,down:false,left:false,right:false})
 const roadShift=useMemo(()=>clamp((pos.x-50)*.45,-22,22),[pos.x])
 const forwardShift=useMemo(()=>clamp((68-pos.y)*.3,-18,18),[pos.y])
 const carDistance=useMemo(()=>Math.hypot(pos.x-carPos.x,pos.y-carPos.y),[pos,carPos])
 const nearMission=useMemo(()=>MISSIONS.find(m=>Math.hypot(pos.x-m.x,pos.y-m.y)<6)||null,[pos])
 const parkedLeft=useMemo(()=>clamp(50+(carPos.x-pos.x)*1.15,9,91),[carPos.x,pos.x])
 const parkedTop=useMemo(()=>clamp(61+(carPos.y-pos.y)*.75,28,78),[carPos.y,pos.y])

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
    window.dispatchEvent(new CustomEvent('tryamm:streetverse-player-position',{detail:{x:(p.x-50)*1.8,z:(p.y-50)*1.8,speed:(dx||dy)?(vehicleRef.current?12:6):0,mobileSafeMode:true,htmlCity:true,vehicle:vehicleRef.current,vehicleType:vehicleRef.current?'car':undefined,controlledVehicleId:vehicleRef.current?SAFE_CAR_ID:undefined,heading:headingRef.current}}))
    if(vehicleRef.current)window.dispatchEvent(new CustomEvent('tryamm:streetverse-drive-telemetry',{detail:{entered:true,mobileSafeMode:true,htmlCity:true,vehicleType:'car',controlledVehicleId:SAFE_CAR_ID,x:(p.x-50)*1.8,z:(p.y-50)*1.8,speed:(dx||dy)?12:0,heading:headingRef.current}}))
   }
   raf=requestAnimationFrame(tick)
  }
  raf=requestAnimationFrame(tick)
  return()=>cancelAnimationFrame(raf)
 },[])

 useEffect(()=>{
  if(!nearMission){
   setMessage(vehicle?'DRIVE MODE • cruise Chicago and reach the glowing mission beacons.':'StreetVerse City is active • walk to a mission beacon or enter the blue car near your spawn.')
   return
  }
  if(visitedRef.current.includes(nearMission.id)){
   setMessage(`${nearMission.label} already checked in • ${visitedRef.current.length}/${MISSIONS.length} district locations complete.`)
   return
  }
  const next=[...visitedRef.current,nearMission.id]
  visitedRef.current=next;setVisited(next)
  const detail={id:nearMission.id,label:nearMission.label,vehicle:vehicleRef.current,mobileSafeMode:true,htmlCity:true,visited:next.length,total:MISSIONS.length}
  setMessage(`Checkpoint reached: ${nearMission.label} • ${next.length}/${MISSIONS.length} district locations complete${vehicleRef.current?' • arrived by vehicle':''}.`)
  window.dispatchEvent(new CustomEvent('tryamm:streetverse-mobile-mission-zone',{detail}))
  window.dispatchEvent(new CustomEvent('tryamm:streetverse-checkpoint',{detail}))
  if(next.length===MISSIONS.length){
   const complete={id:'district-01-mobile-safe',label:'StreetVerse Chicago District 01',mobileSafeMode:true,htmlCity:true,visited:next,total:MISSIONS.length,source:'streetverse-mobile-safe'}
   setMessage('DISTRICT COMPLETE ✓ • 4/4 StreetVerse Chicago locations reached • open REEL to capture your run.')
   window.dispatchEvent(new CustomEvent('tryamm:streetverse-mission-complete',{detail:complete}))
   window.dispatchEvent(new CustomEvent('tryamm:toast',{detail:{message:'StreetVerse District 01 complete • 4/4 checkpoints ✓'}}))
  }
 },[nearMission?.id])

 useEffect(()=>{
  const onVehicle=(event:Event)=>{
   const detail=(event as CustomEvent<{entered?:boolean}>).detail||{}
   const wantsEnter=typeof detail.entered==='boolean'?detail.entered:!vehicleRef.current
   if(wantsEnter){
    if(vehicleRef.current)return
    const p=posRef.current,c=carPosRef.current,distance=Math.hypot(p.x-c.x,p.y-c.y)
    if(distance>10){
     setMessage(`Blue drivable car is ${Math.round(distance)}m away • move closer before entering.`)
     window.dispatchEvent(new CustomEvent('tryamm:streetverse-vehicle-denied',{detail:{reason:'too-far',distance,mobileSafeMode:true,htmlCity:true,controlledVehicleId:SAFE_CAR_ID}}))
     return
    }
    vehicleRef.current=true;setVehicle(true)
    posRef.current={...c};setPos({...c})
    setMessage('Blue car entered • DRIVE MODE active • arrows/WASD move the vehicle through Chicago.')
    window.dispatchEvent(new CustomEvent('tryamm:streetverse-vehicle-controlled',{detail:{entered:true,mobileSafeMode:true,htmlCity:true,vehicleType:'car',controlledVehicleId:SAFE_CAR_ID,x:(c.x-50)*1.8,z:(c.y-50)*1.8}}))
    return
   }
   if(!vehicleRef.current)return
   const c={...carPosRef.current},r=headingRef.current*Math.PI/180
   const exit={x:clamp(c.x+Math.cos(r)*4.5,4,96),y:clamp(c.y+Math.sin(r)*4.5,8,92)}
   vehicleRef.current=false;setVehicle(false);posRef.current=exit;setPos(exit)
   setMessage('Vehicle exited • WALK MODE restored • your blue car stays parked for re-entry.')
   window.dispatchEvent(new CustomEvent('tryamm:streetverse-vehicle-controlled',{detail:{entered:false,mobileSafeMode:true,htmlCity:true,vehicleType:'car',controlledVehicleId:SAFE_CAR_ID,x:(exit.x-50)*1.8,z:(exit.y-50)*1.8}}))
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
 const btn=(label:string,k:keyof typeof held.current)=> <button aria-label={label} onPointerDown={e=>{e.preventDefault();press(k,true)}} onPointerUp={()=>press(k,false)} onPointerCancel={()=>press(k,false)} onPointerLeave={()=>press(k,false)} style={{width:58,height:58,borderRadius:17,border:'1px solid #7be9ff99',background:'#07131ff2',color:'#fff',fontSize:24,fontWeight:900,touchAction:'none',boxShadow:'0 8px 25px #0008'}}>{label}</button>
 const openReel=()=>{window.dispatchEvent(new CustomEvent('tryamm:open-reel-creator',{detail:{source:'streetverse-mobile-safe',missionProgress:`${visited.length}/${MISSIONS.length}`,vehicle,mobileSafeMode:true,htmlCity:true}}));window.dispatchEvent(new CustomEvent('tryamm:toast',{detail:{message:`Opening Reel Creator • StreetVerse ${visited.length}/${MISSIONS.length} checkpoints`}}))}
 const toggleVehicle=()=>window.dispatchEvent(new CustomEvent('tryamm:streetverse-vehicle-interact',{detail:{entered:!vehicle,source:'mobile-header'}}))

 return <div data-streetverse-html-city="true" style={{position:'fixed',inset:0,zIndex:18000,background:'#07101b',color:'#fff',fontFamily:'system-ui',overflow:'hidden'}}>
  <header style={{height:64,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 12px',background:'#020712f5',borderBottom:'1px solid #274963',position:'relative',zIndex:40}}>
   <div><b style={{letterSpacing:.8}}>STREETVERSE • CHICAGO</b><div style={{fontSize:11,color:'#8effb7'}}>CITY ACTIVE • {vehicle?'MOBILE DRIVE MODE':'MOBILE WALK MODE'} • {visited.length}/{MISSIONS.length}</div></div>
   <div style={{display:'flex',gap:7,overflowX:'auto'}}><button onClick={toggleVehicle} aria-label={vehicle?'Exit StreetVerse vehicle':`Enter StreetVerse vehicle ${Math.round(carDistance)} meters away`} style={{minHeight:44,borderRadius:12,border:`1px solid ${vehicle?'#ffd45e':'#59e7ff'}`,background:'#071b25',color:vehicle?'#ffe9a0':'#9af0ff',fontWeight:900,padding:'0 11px',whiteSpace:'nowrap'}}>{vehicle?'EXIT VEHICLE':'ENTER VEHICLE'}</button><button onClick={openReel} aria-label="Open Reel Creator" style={{minHeight:44,borderRadius:12,border:'1px solid #ff7ce8',background:'#251027',color:'#fff',fontWeight:900,padding:'0 13px'}}>● REEL</button><button onClick={onClose} aria-label="Close StreetVerse" style={{width:44,height:44,borderRadius:12,border:'1px solid #567',background:'#101923',color:'#fff',fontSize:22}}>×</button></div>
  </header>
  <main style={{position:'absolute',left:0,right:0,top:64,bottom:0,overflow:'hidden',background:'linear-gradient(#65a6c9 0%,#98cbe3 35%,#d9a979 36%,#19232b 67%,#070b10 100%)'}}>
   <div aria-hidden="true" style={{position:'absolute',left:0,right:0,top:0,height:'38%',background:'linear-gradient(#4a8eb9,#9cc8df 65%,#f3b172)',overflow:'hidden'}}><div style={{position:'absolute',right:'9%',top:'9%',width:52,height:52,borderRadius:'50%',background:'#ffe5a2',boxShadow:'0 0 55px #ffe5a2aa'}}/><div style={{position:'absolute',left:0,right:0,bottom:0,height:'82%',transform:`translateX(${roadShift*.18}px) translateY(${forwardShift*.14}px)`,transition:'transform 80ms linear'}}>{BUILDINGS.map((b,i)=><div key={b.label} style={{position:'absolute',left:`${b.left}%`,bottom:0,width:`${b.width}%`,height:`${b.height}%`,minHeight:90,border:'1px solid #111b25',background:i%3===0?'linear-gradient(90deg,#293b4a,#17232e)':i%3===1?'linear-gradient(90deg,#493d45,#26242c)':'linear-gradient(90deg,#304543,#182827)',boxShadow:'0 0 20px #0007'}}><div style={{position:'absolute',left:5,right:5,top:8,fontSize:7,fontWeight:900,textAlign:'center',color:'#d8f7ff',textShadow:'0 1px 3px #000'}}>{b.label}</div><div style={{position:'absolute',inset:'24px 8px 8px',background:'repeating-linear-gradient(90deg,#ffd978 0 4px,transparent 4px 12px),repeating-linear-gradient(0deg,#92dfff55 0 4px,transparent 4px 13px)',opacity:.8}}/></div>)}</div></div>
   <div aria-hidden="true" style={{position:'absolute',left:0,right:0,top:'34%',bottom:0,overflow:'hidden'}}>
    <div style={{position:'absolute',left:'-25%',right:'-25%',top:'2%',height:'22%',background:'#c8c2b1',clipPath:'polygon(0 0,100% 0,83% 100%,17% 100%)',borderTop:'5px solid #efeadc'}}/>
    <div style={{position:'absolute',left:'8%',right:'8%',top:'7%',bottom:'-15%',background:'#20242a',clipPath:'polygon(35% 0,65% 0,96% 100%,4% 100%)',boxShadow:'inset 0 0 0 2px #424850'}}><div style={{position:'absolute',left:'49.2%',top:0,bottom:0,width:'1.6%',background:'repeating-linear-gradient(180deg,#f9e46d 0 28px,transparent 28px 56px)',transform:`translateX(${roadShift}px)`}}/><div style={{position:'absolute',left:'23%',top:'16%',width:22,height:38,borderRadius:7,background:'#e64b45',boxShadow:'0 8px 16px #0008',transform:`translate(${roadShift*.35}px,${forwardShift}px) scale(.72)`}}><div style={{margin:'5px 3px',height:8,background:'#bde8ff',borderRadius:2}}/></div><div style={{position:'absolute',right:'24%',top:'31%',width:26,height:45,borderRadius:7,background:'#e6c845',boxShadow:'0 8px 16px #0008',transform:`translate(${-roadShift*.25}px,${-forwardShift*.45}px) scale(.88)`}}><div style={{margin:'5px 3px',height:9,background:'#bde8ff',borderRadius:2}}/></div><div style={{position:'absolute',left:'31%',top:'54%',width:30,height:50,borderRadius:8,background:'#3b7dde',boxShadow:'0 9px 18px #0009',transform:`translate(${roadShift*.2}px,${forwardShift*.3}px)`}}><div style={{margin:'6px 4px',height:10,background:'#bde8ff',borderRadius:2}}/></div></div>
    {PEOPLE.map((p,i)=><div key={i} style={{position:'absolute',left:p.left,top:p.top,width:14,height:32,zIndex:8,transform:`translateX(${roadShift*(i%2?.08:-.08)}px)`}}><div style={{width:11,height:11,borderRadius:'50%',background:i%2?'#6f442f':'#b57651',margin:'0 auto'}}/><div style={{width:13,height:16,borderRadius:'5px 5px 2px 2px',background:i%3===0?'#ff7ce8':i%3===1?'#7fe8c7':'#ffd166',margin:'1px auto'}}/><div style={{width:3,height:8,background:'#111',display:'inline-block',marginLeft:3}}/><div style={{width:3,height:8,background:'#111',display:'inline-block',marginLeft:3}}/></div>)}
    <div aria-label="Dog" style={{position:'absolute',right:'15%',top:'58%',zIndex:8,fontSize:22,filter:'drop-shadow(0 3px 3px #0008)'}}>🐕</div>
    <div style={{position:'absolute',left:'4%',top:'11%',padding:'6px 9px',borderRadius:7,background:'#0a3150',border:'2px solid #dceeff',fontSize:9,fontWeight:900}}>WACKER DR</div><div style={{position:'absolute',right:'5%',top:'15%',padding:'6px 9px',borderRadius:7,background:'#123d26',border:'2px solid #e4ffe8',fontSize:9,fontWeight:900}}>ALL AMERICAN MARKETPLACE</div>
    {!vehicle&&<div aria-label={`Parked blue drivable car ${Math.round(carDistance)} meters away`} style={{position:'absolute',left:`${parkedLeft}%`,top:`${parkedTop}%`,width:28,height:44,transform:`translate(-50%,-50%) rotate(${heading}deg)`,zIndex:10,borderRadius:8,background:'#36a9e8',border:'2px solid #dff8ff',boxShadow:'0 0 16px #36a9e888,0 8px 12px #0008'}}><div style={{margin:'5px 4px',height:10,borderRadius:3,background:'#bde8ff'}}/></div>}
    {vehicle?<div aria-label="Player driving blue StreetVerse car" style={{position:'absolute',left:'50%',bottom:'16%',width:48,height:68,transform:`translateX(-50%) rotate(${heading}deg)`,zIndex:12,borderRadius:12,background:'#36a9e8',border:'3px solid #fff',boxShadow:'0 0 24px #36a9e8aa,0 12px 18px #0009'}}><div style={{margin:'7px 6px',height:18,borderRadius:5,background:'#bde8ff'}}/><div style={{position:'absolute',left:-5,top:16,width:7,height:18,borderRadius:4,background:'#111'}}/><div style={{position:'absolute',right:-5,top:16,width:7,height:18,borderRadius:4,background:'#111'}}/><div style={{position:'absolute',left:-5,bottom:10,width:7,height:18,borderRadius:4,background:'#111'}}/><div style={{position:'absolute',right:-5,bottom:10,width:7,height:18,borderRadius:4,background:'#111'}}/></div>:<div aria-label="Player" style={{position:'absolute',left:'50%',bottom:'17%',width:30,height:50,transform:'translateX(-50%)',zIndex:12}}><div style={{position:'absolute',left:8,top:0,width:15,height:15,borderRadius:'50%',background:'#8b5a3c',border:'2px solid #e9c6aa'}}/><div style={{position:'absolute',left:5,top:15,width:21,height:25,borderRadius:'8px 8px 5px 5px',background:'#23d9f4',border:'2px solid #fff',boxShadow:'0 0 20px #23d9f4aa'}}/><div style={{position:'absolute',left:8,top:39,width:6,height:11,background:'#111',borderRadius:3}}/><div style={{position:'absolute',right:7,top:39,width:6,height:11,background:'#111',borderRadius:3}}/></div>}
    {MISSIONS.map((m,i)=>{const done=visited.includes(m.id);return <div key={m.id} title={m.label} style={{position:'absolute',left:`${18+i*21}%`,top:`${28+(i%2)*13}%`,zIndex:9,textAlign:'center',transform:`translateX(${roadShift*(i%2?.15:-.15)}px)`}}><div style={{width:14,height:14,margin:'auto',borderRadius:'50%',background:done?'#55e88a':'#ffd65a',border:'2px solid #fff',boxShadow:done?'0 0 0 8px #55e88a22,0 0 20px #55e88a':'0 0 0 8px #ffd65a33,0 0 25px #ffd65a'}}>{done?<span style={{fontSize:9,color:'#06120b'}}>✓</span>:null}</div><div style={{marginTop:7,padding:'4px 6px',borderRadius:7,background:'#030914d9',fontSize:8,fontWeight:800,whiteSpace:'nowrap'}}>{done?'✓ ':''}{m.label}</div></div>})}
   </div>
   <div aria-live="polite" style={{position:'absolute',left:10,right:10,top:10,zIndex:30,padding:'9px 11px',borderRadius:12,background:'#030914e8',border:'1px solid #4e7891',fontSize:12,boxShadow:'0 6px 20px #0007'}}>{message}<div style={{marginTop:5,fontSize:10,color:visited.length===MISSIONS.length?'#8effb7':'#b9c9d6'}}>{visited.length}/{MISSIONS.length} DISTRICT CHECKPOINTS {visited.length===MISSIONS.length?'• COMPLETE ✓':nearMission?'• CHECKPOINT ACTIVE':''}</div></div>
   <div style={{position:'absolute',left:14,bottom:18,zIndex:35,display:'grid',gridTemplateColumns:'58px 58px 58px',gap:7}}><span/>{btn('↑','up')}<span/>{btn('←','left')}{btn('↓','down')}{btn('→','right')}</div>
   <div style={{position:'absolute',right:12,bottom:18,zIndex:35,maxWidth:180,padding:9,borderRadius:12,background:'#030914df',border:'1px solid #34566d',fontSize:10,lineHeight:1.35}}>HTML CITY MODE<br/><b style={{color:'#8effb7'}}>No WebGL required.</b><br/>People • traffic • dog • {visited.length}/{MISSIONS.length} missions • Reel • {vehicle?'blue car under control':`blue car ${Math.round(carDistance)}m away`}.</div>
  </main>
 </div>
}
