import {useEffect,useMemo,useState} from 'react'
import {canUseStreetVerseVehicle,type MobilityProfile} from '../runtime/StreetVerseVehicleAccessRuntime'
import {STREETVERSE_MOBILITY_CREDENTIALS} from '../data/StreetVerseVehicleAccessProgression'

type Ride={id:string;label:string;wheels:number;className:string;grip:number;steer:number;roll:number;stunts:string[];vehicleClass:string}
const RIDES:Ride[]=[
 {id:'atv',label:'ATV / 4-WHEELER',wheels:4,className:'OFF-ROAD',grip:.84,steer:1.08,roll:.32,stunts:['wheelie','jump','mud-slide'],vehicleClass:'atv'},
 {id:'three-wheel-roadster',label:'THREE-WHEEL ROADSTER',wheels:3,className:'ROADSTER',grip:.94,steer:1.02,roll:.18,stunts:['launch','drift','burnout'],vehicleClass:'three-wheel-roadster'},
 {id:'dirt-bike',label:'DIRT BIKE',wheels:2,className:'OFF-ROAD BIKE',grip:.76,steer:1.24,roll:.58,stunts:['wheelie','stoppie','jump'],vehicleClass:'dirt-bike'},
 {id:'sport-bike',label:'SPORT BIKE',wheels:2,className:'SPORT',grip:.93,steer:1.18,roll:.72,stunts:['lean','wheelie','stoppie'],vehicleClass:'sport-bike'},
 {id:'cruiser-bike',label:'CRUISER',wheels:2,className:'CRUISER',grip:.9,steer:.88,roll:.42,stunts:['burnout','low-speed-balance'],vehicleClass:'cruiser-bike'},
 {id:'utv',label:'SIDE-BY-SIDE / UTV',wheels:4,className:'UTILITY OFF-ROAD',grip:.88,steer:.96,roll:.28,stunts:['jump','trail-slide','hill-climb'],vehicleClass:'utv'},
 {id:'go-kart',label:'GO-KART',wheels:4,className:'KART',grip:.96,steer:1.34,roll:.12,stunts:['late-brake','power-slide','draft'],vehicleClass:'atv'},
 {id:'dune-buggy',label:'DUNE BUGGY',wheels:4,className:'DESERT / OFF-ROAD',grip:.8,steer:1.0,roll:.36,stunts:['jump','sand-slide','hill-climb'],vehicleClass:'utv'},
 {id:'supermoto',label:'SUPERMOTO',wheels:2,className:'HYBRID BIKE',grip:.87,steer:1.3,roll:.66,stunts:['back-in-slide','wheelie','stoppie'],vehicleClass:'supermoto'},
 {id:'mini-bike',label:'MINI BIKE',wheels:2,className:'MINI',grip:.78,steer:1.12,roll:.5,stunts:['wheelie','tight-turn','yard-race'],vehicleClass:'motorcycle'},
 {id:'electric-trail',label:'E-TRAIL RIDE',wheels:2,className:'ELECTRIC OFF-ROAD',grip:.82,steer:1.2,roll:.6,stunts:['silent-launch','wheelie','trail-jump'],vehicleClass:'adventure-bike'},
]

export default function StreetVersePowersportsGarage(){
 const [active,setActive]=useState('sport-bike')
 const [open,setOpen]=useState(false)
 const [notice,setNotice]=useState('')
 const [academyOpen,setAcademyOpen]=useState(false)
 const ride=useMemo(()=>RIDES.find(r=>r.id===active)||RIDES[0],[active])
 const mobilityProfile=useMemo<MobilityProfile>(()=>{
  try{
   const saved=JSON.parse(localStorage.getItem('tryamm.streetverse.mobility.profile')||'{}')
   return{level:Number(saved.level||1),completedMissions:Array.isArray(saved.completedMissions)?saved.completedMissions:['movement-tutorial','vehicle-entry-tutorial'],activeRoles:Array.isArray(saved.activeRoles)?saved.activeRoles:[],credentials:Array.isArray(saved.credentials)?saved.credentials:['street-driver']}
  }catch{return{level:1,completedMissions:['movement-tutorial','vehicle-entry-tutorial'],activeRoles:[],credentials:['street-driver']}}
 },[open])
 const access=useMemo(()=>canUseStreetVerseVehicle(ride.vehicleClass,mobilityProfile),[ride.vehicleClass,mobilityProfile])
 useEffect(()=>{
  const saved=localStorage.getItem('tryamm.streetverse.powersports.active')
  if(saved&&RIDES.some(r=>r.id===saved))setActive(saved)
 },[])
 useEffect(()=>{
  localStorage.setItem('tryamm.streetverse.powersports.active',active)
  window.dispatchEvent(new CustomEvent('tryamm:streetverse-powersport-select',{detail:{...ride}}))
 },[active,ride])
 useEffect(()=>{
  const onRequest=()=>setOpen(true)
  const onAcademy=()=>{setOpen(true);setAcademyOpen(true)}
  addEventListener('tryamm:streetverse-powersports-open',onRequest)
  addEventListener('tryamm:streetverse-mobility-academy-open',onAcademy)
  return()=>{removeEventListener('tryamm:streetverse-powersports-open',onRequest);removeEventListener('tryamm:streetverse-mobility-academy-open',onAcademy)}
 },[])
 if(!open)return <button onClick={()=>setOpen(true)} style={{position:'fixed',right:12,bottom:78,zIndex:16997,border:'1px solid #59e7ff66',borderRadius:12,padding:'9px 11px',background:'rgba(4,12,20,.88)',color:'#fff',fontSize:10,fontWeight:900}}>POWERSPORTS</button>
 return <div style={{position:'fixed',right:12,bottom:78,zIndex:16998,width:'min(360px,calc(100vw - 24px))',padding:12,borderRadius:16,background:'rgba(3,10,18,.95)',border:'1px solid #59e7ff77',color:'#fff',fontFamily:'system-ui',boxShadow:'0 18px 50px #0008'}}>
  <div style={{display:'flex',justifyContent:'space-between',gap:10,alignItems:'center'}}><div><div style={{fontSize:9,color:'#59e7ff',fontWeight:950,letterSpacing:1.4}}>STREETVERSE POWERSPORTS GARAGE</div><div style={{fontWeight:950,fontSize:16,marginTop:2}}>{ride.label}</div></div><button onClick={()=>setOpen(false)} style={{border:'1px solid #496170',borderRadius:10,background:'#0c1722',color:'#fff',width:34,height:34}}>×</button></div>
  <div style={{display:'flex',gap:7,marginTop:10}}><button onClick={()=>setAcademyOpen(false)} style={{flex:1,minHeight:38,border:'1px solid #35566d',borderRadius:10,background:!academyOpen?'#102536':'#09121b',color:'#fff',fontSize:9,fontWeight:950}}>RIDES</button><button onClick={()=>setAcademyOpen(true)} style={{flex:1,minHeight:38,border:'1px solid #8a6b2d',borderRadius:10,background:academyOpen?'#2a210d':'#09121b',color:'#ffe49b',fontSize:9,fontWeight:950}}>MOBILITY ACADEMY</button></div>
  {!academyOpen?<div style={{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:6,marginTop:10,maxHeight:300,overflowY:'auto'}}>{RIDES.map(r=><button key={r.id} onClick={()=>setActive(r.id)} style={{textAlign:'left',border:`1px solid ${r.id===active?'#59e7ff':'#34495a'}`,borderRadius:10,padding:'8px 9px',background:r.id===active?'#102536':'#0a141e',color:'#fff',fontSize:9,fontWeight:850}}>{r.label}<br/><span style={{opacity:.64,fontWeight:650}}>{r.className} • {r.wheels} wheels</span></button>)}</div>:<div style={{marginTop:10,maxHeight:330,overflowY:'auto',display:'grid',gap:7}}>{STREETVERSE_MOBILITY_CREDENTIALS.map(cred=>{const unlocked=mobilityProfile.level>=cred.unlockLevel&&(mobilityProfile.credentials.includes(cred.id)||cred.requiredMissions.every(m=>mobilityProfile.completedMissions.includes(m)));return <div key={cred.id} style={{padding:10,border:`1px solid ${unlocked?'#2d7652':'#5a4b2c'}`,borderRadius:11,background:'#08121b'}}><div style={{display:'flex',justifyContent:'space-between',gap:8}}><b style={{fontSize:10}}>{cred.label}</b><span style={{fontSize:8,color:unlocked?'#8fffc1':'#ffe49b',fontWeight:950}}>{unlocked?'UNLOCKED':`LEVEL ${cred.unlockLevel}`}</span></div><div style={{fontSize:8,color:'#9eb0bf',marginTop:5,lineHeight:1.45}}>WHO GETS IT • {cred.ownership.toUpperCase()}<br/>VEHICLES • {cred.allowedVehicleClasses.join(' • ').toUpperCase()}<br/>TRAINING • {cred.requiredMissions.join(' → ').toUpperCase()}</div></div>})}</div>}
  <div style={{marginTop:10,padding:9,borderRadius:11,background:'#07131d',fontSize:9,lineHeight:1.55,color:'#cfe8f5'}}>GRIP {ride.grip.toFixed(2)} • STEER {ride.steer.toFixed(2)} • BODY {ride.roll.toFixed(2)}<br/>STUNTS • {ride.stunts.join(' • ').toUpperCase()}<br/><span style={{color:access.allowed?'#8fffc1':'#ffe49b',fontWeight:950}}>{access.allowed?'UNLOCKED':'TRAINING REQUIRED'} • {access.credentialId||'UNREGISTERED'}</span></div>
  {notice&&<div style={{marginTop:7,fontSize:9,color:'#ffe49b'}}>{notice}</div>}
  <button onClick={()=>{
    if(!access.allowed){
      setNotice(`Complete ${access.credentialId||'required'} training • level ${access.levelRequired} • missing: ${access.missingMissions.join(', ')||'credential/role'}`)
      window.dispatchEvent(new CustomEvent('tryamm:streetverse-mobility-academy-open',{detail:{credentialId:access.credentialId,vehicleClass:ride.vehicleClass}}))
      return
    }
    setNotice('')
    window.dispatchEvent(new CustomEvent('tryamm:streetverse-powersport-spawn',{detail:{...ride,access}}))
  }} style={{width:'100%',marginTop:9,border:'1px solid #7dffb866',borderRadius:11,padding:'10px 12px',background:'#0c2a1d',color:'#d9ffe8',fontSize:10,fontWeight:950}}>SPAWN SELECTED RIDE</button>
 </div>
}