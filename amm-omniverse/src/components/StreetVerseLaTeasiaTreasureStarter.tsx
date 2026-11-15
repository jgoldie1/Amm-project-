import {useEffect,useRef,useState} from 'react'
import {useFrame} from '@react-three/fiber'
import * as THREE from 'three'
import {FLIGHT_EVENT,FLIGHT_STATUS_EVENT,type FlightInput,type FlightState} from '../lib/streetverseLaTeasiaFlight'

export const LATEASIA_TREASURE_ITEMS=[
 {id:'diamonds',label:'Diamonds',count:24},
 {id:'rubies',label:'Rubies',count:12},
 {id:'emeralds',label:'Emeralds',count:12},
 {id:'sapphires',label:'Sapphires',count:12},
 {id:'gold',label:'Gold bars',count:16},
 {id:'pearls',label:'Pearls',count:18}
] as const
const KEY='streetverse:lateasia-treasure-starter:v1'
type StarterState={claimed:boolean;chestOpen:boolean;flightEnabled:boolean}
const initial:StarterState={claimed:false,chestOpen:false,flightEnabled:false}
function readStarter():StarterState{
 try{const saved=JSON.parse(localStorage.getItem(KEY)||'null');return saved&&typeof saved==='object'?{claimed:saved.claimed===true,chestOpen:saved.chestOpen===true,flightEnabled:saved.flightEnabled===true}:initial}catch{return initial}
}
export const STARTER_EVENT='tryamm:streetverse-lateasia-starter-update'
export function StreetVerseLaTeasiaStarterControls(){
 const [state,setState]=useState<StarterState>(readStarter)
 const [message,setMessage]=useState('A fictional treasure chest and flight starter pack for LaTeasia.')
 const [flightStatus,setFlightStatus]=useState<FlightState|null>(null)
 useEffect(()=>{
  const onStatus=(event:Event)=>setFlightStatus((event as CustomEvent<FlightState>).detail)
  window.addEventListener(FLIGHT_STATUS_EVENT,onStatus)
  return()=>window.removeEventListener(FLIGHT_STATUS_EVENT,onStatus)
 },[])
 useEffect(()=>{
  try{localStorage.setItem(KEY,JSON.stringify(state))}catch{}
  window.dispatchEvent(new CustomEvent(STARTER_EVENT,{detail:state}))
 },[state])
 const claim=()=>{if(state.claimed){setMessage('Starter pack already claimed. No duplicate rewards.');return}setState(s=>({...s,claimed:true,chestOpen:true}));setMessage('Starter claimed! Treasure unlocked and flight pack equipped.')}
 const open=()=>{if(!state.claimed){setMessage('Claim starter pack first.');return}setState(s=>({...s,chestOpen:!s.chestOpen}))}
 const command=(value:FlightInput|'start'|'recharge')=>window.dispatchEvent(new CustomEvent(FLIGHT_EVENT,{detail:{command:value}}))
 const fly=()=>{if(!state.claimed){setMessage('Claim starter pack first.');return}const enabling=!state.flightEnabled;setState(s=>({...s,flightEnabled:enabling}));command(enabling?'start':'land');setMessage(enabling?'Flight controls active when LaTeasia GLB is loaded.':'Landing requested.')}
 const btn={minHeight:48,padding:'9px 12px',borderRadius:10,fontWeight:800,fontSize:13,cursor:'pointer'} as const
 return <section aria-label="LaTeasia treasure and flying starter pack" style={{position:'absolute',right:12,top:260,zIndex:33,width:'min(265px,60vw)',background:'rgba(12,21,38,.96)',border:'1px solid #f5d37e',borderRadius:12,padding:10,color:'white'}}>
  <strong>💎 LaTeasia • Royal Starter Pack</strong>
  <div style={{fontSize:12,marginTop:6}}>Diamonds • rubies • emeralds • sapphires • gold • pearls</div>
  <div style={{display:'grid',gap:7,marginTop:9}}>
   <button type="button" onClick={claim} disabled={state.claimed} style={btn}>{state.claimed?'✓ STARTER CLAIMED':'CLAIM TREASURE + FLIGHT PACK'}</button>
   <button type="button" onClick={open} style={btn}>{state.chestOpen?'CLOSE TREASURE CHEST':'OPEN TREASURE CHEST'}</button>
   <button type="button" onClick={fly} style={btn}>{state.flightEnabled?'LAND / STOP HOVER':'ACTIVATE FLYING PACK'}</button>
   {state.flightEnabled&&<div aria-label="LaTeasia flight direction controls" style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:6}}>
    {([['↑ RISE','rise'],['↓ LOWER','descend'],['↑ FORWARD','forward'],['← LEFT','left'],['■ HOVER','hover'],['RIGHT →','right'],['BACK','back']] as const).map(([label,direction])=><button key={direction} type="button" onClick={()=>command(direction)} style={btn}>{label}</button>)}
    <button type="button" onClick={()=>command('recharge')} style={btn}>RECHARGE</button>
   </div>}
  </div>
  {state.claimed&&<div style={{fontSize:12,marginTop:7}}>Owned: {LATEASIA_TREASURE_ITEMS.map(item=>item.count+' '+item.label).join(' · ')}</div>}
  <div role="status" aria-live="polite" style={{fontSize:12,marginTop:8}}>{message}{flightStatus?' • Altitude '+flightStatus.y.toFixed(1)+' • Energy '+flightStatus.energy.toFixed(0)+'s':''}</div>
 </section>
}
const gems=[
 {x:-.54,z:.13,color:'#b8f5ff',shape:'diamond'}, {x:-.27,z:.1,color:'#d41f52',shape:'ruby'},
 {x:0,z:.05,color:'#3fdc89',shape:'emerald'}, {x:.27,z:.1,color:'#367ce8',shape:'sapphire'},
 {x:.54,z:.13,color:'#b8f5ff',shape:'diamond'}
]
/** R3F cosmetic starter preview: chest lid hinge, gems, gold, and hover pack. */
export function StreetVerseLaTeasiaTreasureScene(){
 const [state,setState]=useState<StarterState>(readStarter)
 const lid=useRef<THREE.Group>(null)
 const wings=useRef<THREE.Group>(null)
 useEffect(()=>{
  const onUpdate=(event:Event)=>setState((event as CustomEvent<StarterState>).detail)
  window.addEventListener(STARTER_EVENT,onUpdate)
  return()=>window.removeEventListener(STARTER_EVENT,onUpdate)
 },[])
 useFrame(({clock},delta)=>{
  if(lid.current)lid.current.rotation.x=THREE.MathUtils.damp(lid.current.rotation.x,state.chestOpen?-.95:0,6,delta)
  if(wings.current){wings.current.position.y=state.flightEnabled?1.4+Math.sin(clock.elapsedTime*3)*.2:1.35;wings.current.rotation.z=state.flightEnabled?Math.sin(clock.elapsedTime*4)*.06:0}
 })
 return <group name="lateasia-royal-starter" position={[-632,0,680]}>
  <group name="treasure-chest">
   <mesh position={[0,.36,0]} castShadow><boxGeometry args={[1.8,.72,1.05]}/><meshStandardMaterial color="#633719"/></mesh>
   <mesh position={[0,.35,.54]}><boxGeometry args={[1.8,.17,.06]}/><meshStandardMaterial color="#e0b54c" metalness={.75} roughness={.2}/></mesh>
   <group ref={lid} position={[0,.73,-.48]} name="treasure-lid-hinge">
    <mesh position={[0,.16,.48]} castShadow><boxGeometry args={[1.84,.32,1.1]}/><meshStandardMaterial color="#8b5122"/></mesh>
    <mesh position={[0,.34,.48]}><boxGeometry args={[1.84,.08,1.1]}/><meshStandardMaterial color="#e1b54a" metalness={.7}/></mesh>
   </group>
   {state.chestOpen&&state.claimed&&<>
    {gems.map((gem,i)=><mesh key={i} position={[gem.x,.82+(i%2)*.08,gem.z]} rotation={[.3,i*.7,.2]}><octahedronGeometry args={[.16,0]}/><meshStandardMaterial color={gem.color} metalness={.25} roughness={.1}/></mesh>)}
    {[-.46,-.15,.16,.47].map((x,i)=><mesh key={i} position={[x,.78,-.25]} rotation={[0,0,.14]}><boxGeometry args={[.28,.13,.3]}/><meshStandardMaterial color="#f5c444" metalness={.85} roughness={.2}/></mesh>)}
   </>}
  </group>
  {state.claimed&&<group ref={wings} position={[2,1.35,0]} visible={state.flightEnabled} name="lateasia-flight-starter-preview">
   <mesh><boxGeometry args={[.42,.64,.24]}/><meshStandardMaterial color="#b69fda" metalness={.7}/></mesh>
   {[-1,1].map(side=><group key={side} position={[side*.3,.12,0]} rotation={[0,0,side*.28]}>
    <mesh position={[side*.4,0,0]}><boxGeometry args={[.85,.12,.12]}/><meshStandardMaterial color="#e8e2ff" metalness={.65}/></mesh>
    <mesh position={[side*.8,-.08,0]}><coneGeometry args={[.13,.45,10]}/><meshStandardMaterial color="#8feaff" emissive="#267fc0" emissiveIntensity={1}/></mesh>
   </group>)}
  </group>}
 </group>
}
