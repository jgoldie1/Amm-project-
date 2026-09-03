import {useEffect,useMemo,useState} from 'react'

type Ride={id:string;label:string;wheels:number;className:string;grip:number;steer:number;roll:number;stunts:string[]}
const RIDES:Ride[]=[
 {id:'atv',label:'ATV / 4-WHEELER',wheels:4,className:'OFF-ROAD',grip:.84,steer:1.08,roll:.32,stunts:['wheelie','jump','mud-slide']},
 {id:'three-wheel-roadster',label:'THREE-WHEEL ROADSTER',wheels:3,className:'ROADSTER',grip:.94,steer:1.02,roll:.18,stunts:['launch','drift','burnout']},
 {id:'dirt-bike',label:'DIRT BIKE',wheels:2,className:'OFF-ROAD BIKE',grip:.76,steer:1.24,roll:.58,stunts:['wheelie','stoppie','jump']},
 {id:'sport-bike',label:'SPORT BIKE',wheels:2,className:'SPORT',grip:.93,steer:1.18,roll:.72,stunts:['lean','wheelie','stoppie']},
 {id:'cruiser-bike',label:'CRUISER',wheels:2,className:'CRUISER',grip:.9,steer:.88,roll:.42,stunts:['burnout','low-speed-balance']},
 {id:'utv',label:'SIDE-BY-SIDE / UTV',wheels:4,className:'UTILITY OFF-ROAD',grip:.88,steer:.96,roll:.28,stunts:['jump','trail-slide','hill-climb']},
 {id:'go-kart',label:'GO-KART',wheels:4,className:'KART',grip:.96,steer:1.34,roll:.12,stunts:['late-brake','power-slide','draft']},
 {id:'dune-buggy',label:'DUNE BUGGY',wheels:4,className:'DESERT / OFF-ROAD',grip:.8,steer:1.0,roll:.36,stunts:['jump','sand-slide','hill-climb']},
 {id:'supermoto',label:'SUPERMOTO',wheels:2,className:'HYBRID BIKE',grip:.87,steer:1.3,roll:.66,stunts:['back-in-slide','wheelie','stoppie']},
 {id:'mini-bike',label:'MINI BIKE',wheels:2,className:'MINI',grip:.78,steer:1.12,roll:.5,stunts:['wheelie','tight-turn','yard-race']},
 {id:'electric-trail',label:'E-TRAIL RIDE',wheels:2,className:'ELECTRIC OFF-ROAD',grip:.82,steer:1.2,roll:.6,stunts:['silent-launch','wheelie','trail-jump']},
]

export default function StreetVersePowersportsGarage(){
 const [active,setActive]=useState('sport-bike')
 const [open,setOpen]=useState(false)
 const ride=useMemo(()=>RIDES.find(r=>r.id===active)||RIDES[0],[active])
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
  addEventListener('tryamm:streetverse-powersports-open',onRequest)
  return()=>removeEventListener('tryamm:streetverse-powersports-open',onRequest)
 },[])
 if(!open)return <button onClick={()=>setOpen(true)} style={{position:'fixed',right:12,bottom:78,zIndex:16997,border:'1px solid #59e7ff66',borderRadius:12,padding:'9px 11px',background:'rgba(4,12,20,.88)',color:'#fff',fontSize:10,fontWeight:900}}>POWERSPORTS</button>
 return <div style={{position:'fixed',right:12,bottom:78,zIndex:16998,width:'min(360px,calc(100vw - 24px))',padding:12,borderRadius:16,background:'rgba(3,10,18,.95)',border:'1px solid #59e7ff77',color:'#fff',fontFamily:'system-ui',boxShadow:'0 18px 50px #0008'}}>
  <div style={{display:'flex',justifyContent:'space-between',gap:10,alignItems:'center'}}><div><div style={{fontSize:9,color:'#59e7ff',fontWeight:950,letterSpacing:1.4}}>STREETVERSE POWERSPORTS GARAGE</div><div style={{fontWeight:950,fontSize:16,marginTop:2}}>{ride.label}</div></div><button onClick={()=>setOpen(false)} style={{border:'1px solid #496170',borderRadius:10,background:'#0c1722',color:'#fff',width:34,height:34}}>×</button></div>
  <div style={{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:6,marginTop:10,maxHeight:300,overflowY:'auto'}}>{RIDES.map(r=><button key={r.id} onClick={()=>setActive(r.id)} style={{textAlign:'left',border:`1px solid ${r.id===active?'#59e7ff':'#34495a'}`,borderRadius:10,padding:'8px 9px',background:r.id===active?'#102536':'#0a141e',color:'#fff',fontSize:9,fontWeight:850}}>{r.label}<br/><span style={{opacity:.64,fontWeight:650}}>{r.className} • {r.wheels} wheels</span></button>)}</div>
  <div style={{marginTop:10,padding:9,borderRadius:11,background:'#07131d',fontSize:9,lineHeight:1.55,color:'#cfe8f5'}}>GRIP {ride.grip.toFixed(2)} • STEER {ride.steer.toFixed(2)} • BODY {ride.roll.toFixed(2)}<br/>STUNTS • {ride.stunts.join(' • ').toUpperCase()}</div>
  <button onClick={()=>window.dispatchEvent(new CustomEvent('tryamm:streetverse-powersport-spawn',{detail:{...ride}}))} style={{width:'100%',marginTop:9,border:'1px solid #7dffb866',borderRadius:11,padding:'10px 12px',background:'#0c2a1d',color:'#d9ffe8',fontSize:10,fontWeight:950}}>SPAWN SELECTED RIDE</button>
 </div>
}
