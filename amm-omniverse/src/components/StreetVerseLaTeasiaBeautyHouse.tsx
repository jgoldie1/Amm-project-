import {useEffect,useRef,useState} from 'react'
import {useFrame} from '@react-three/fiber'
import * as THREE from 'three'

const GIFT_KEY='streetverse:lateasia-treasure-starter:v1'
const SALON_KEY='streetverse:lateasia-beauty-house:v1'
const EVENT='tryamm:streetverse-lateasia-salon-update'
type HairStyle='locs'|'braids'|'curls'
type SalonState={unlocked:boolean;doorOpen:boolean;clientsServed:number;serviceActive:boolean;serviceId:number;selectedStyle:HairStyle;finishedStyle:HairStyle|null}
const initial:SalonState={unlocked:false,doorOpen:false,clientsServed:0,serviceActive:false,serviceId:0,selectedStyle:'locs',finishedStyle:null}
const load=():SalonState=>{
 try{const s=JSON.parse(localStorage.getItem(SALON_KEY)||'null');return s?{unlocked:s.unlocked===true,doorOpen:false,clientsServed:Math.max(0,Math.min(100000,Math.floor(Number(s.clientsServed)||0))),serviceActive:false,serviceId:0,selectedStyle:'locs',finishedStyle:null}:initial}catch{return initial}
}
const hasKey=()=>{try{return JSON.parse(localStorage.getItem(GIFT_KEY)||'null')?.claimed===true}catch{return false}}
export function StreetVerseLaTeasiaBeautyHouseControls(){
 const [salon,setSalon]=useState<SalonState>(load)
 const [message,setMessage]=useState('Claim LaTeasia’s founder gift to receive the Beauty House key.')
 useEffect(()=>{
  try{localStorage.setItem(SALON_KEY,JSON.stringify({unlocked:salon.unlocked,clientsServed:salon.clientsServed}))}catch{}
  window.dispatchEvent(new CustomEvent(EVENT,{detail:salon}))
 },[salon])
 const unlock=()=>{
  if(!hasKey()){setMessage('Founder Key unavailable: claim the flying welcome gift first.');return}
  if(salon.unlocked){setMessage('Beauty House already unlocked.');return}
  setSalon(s=>({...s,unlocked:true,doorOpen:true}))
  setMessage('Beauty House unlocked! Welcome to LaTeasia Monroe’s salon.')
 }
 const door=()=>{
  if(!salon.unlocked){setMessage('Unlock Beauty House with the Founder Key first.');return}
  setSalon(s=>({...s,doorOpen:!s.doorOpen}))
  setMessage(salon.doorOpen?'Salon door closed.':'Salon door opened.')
 }
 const serve=()=>{
  if(!salon.unlocked||!salon.doorOpen){setMessage('Unlock and open the salon before starting a service.');return}
  if(salon.serviceActive){setMessage('Finish the current client before starting another.');return}
  setSalon(s=>({...s,serviceActive:true,serviceId:s.serviceId+1,finishedStyle:null}))
  window.dispatchEvent(new CustomEvent('tryamm:streetverse-character-animation',{detail:{characterId:'lateasia-monroe',role:'salon'}}))
  setMessage('Client: “I would love '+salon.selectedStyle+'!” LaTeasia: “Welcome to Beauty House. Let me take care of you!”')
 }
 useEffect(()=>{
  const onComplete=(event:Event)=>{
   const id=(event as CustomEvent<{serviceId:number}>).detail?.serviceId
   setSalon(s=>s.serviceActive&&s.serviceId===id?{...s,serviceActive:false,clientsServed:s.clientsServed+1,finishedStyle:s.selectedStyle}:s)
   setMessage('Beauty RP styling complete! Fictional service only; no real booking or payment.')
  }
  window.addEventListener('tryamm:streetverse-lateasia-service-complete',onComplete)
  return()=>window.removeEventListener('tryamm:streetverse-lateasia-service-complete',onComplete)
 },[])
 const style={minHeight:48,padding:'9px 12px',borderRadius:10,fontWeight:800,fontSize:13,cursor:'pointer'} as const
 return <section aria-label="LaTeasia Beauty House founder controls" style={{position:'absolute',left:12,top:80,zIndex:32,width:'min(255px,55vw)',background:'rgba(18,18,32,.94)',color:'white',border:'1px solid #e9b5d2',borderRadius:12,padding:10}}>
  <strong>💄 LaTeasia • Beauty House RP</strong>
  <label htmlFor="lateasia-hairstyle" style={{display:'block',fontSize:13,marginTop:8}}>Customer hairstyle</label>
  <select id="lateasia-hairstyle" aria-label="Choose customer hairstyle" value={salon.selectedStyle} disabled={salon.serviceActive} onChange={e=>setSalon(s=>({...s,selectedStyle:e.target.value as HairStyle}))} style={{width:'100%',minHeight:48,fontSize:16,borderRadius:8}}><option value="locs">Locs</option><option value="braids">Braids</option><option value="curls">Curls</option></select>
  <div style={{display:'grid',gap:7,marginTop:8}}>
   <button type="button" onClick={unlock} style={style}>{salon.unlocked?'✓ FOUNDER KEY USED':'USE FOUNDER KEY'}</button>
   <button type="button" onClick={door} style={style}>{salon.doorOpen?'CLOSE SALON DOOR':'OPEN SALON DOOR'}</button>
   <button type="button" onClick={serve} disabled={salon.serviceActive} style={style}>{salon.serviceActive?'STYLING IN PROGRESS…':'START BEAUTY RP SERVICE'}</button>
  </div>
  <div role="status" aria-live="polite" style={{fontSize:12,marginTop:8}}>{message} · Services: {salon.clientsServed}{salon.finishedStyle?' · Finished hairstyle: '+salon.finishedStyle:''}</div>
 </section>
}
/** Minimal interactive 3D salon prototype, not a finished furnished BeautyVerse interior. */
export function StreetVerseLaTeasiaBeautyHouseScene(){
 const [salon,setSalon]=useState<SalonState>(load)
 const door=useRef<THREE.Group>(null)
 const customer=useRef<THREE.Group>(null)
 const stylistArm=useRef<THREE.Group>(null)
 const serviceTime=useRef(0)
 const completed=useRef(-1)
 useEffect(()=>{
  const onUpdate=(event:Event)=>setSalon((event as CustomEvent<SalonState>).detail)
  window.addEventListener(EVENT,onUpdate)
  return()=>window.removeEventListener(EVENT,onUpdate)
 },[])
 useEffect(()=>{serviceTime.current=0},[salon.serviceId])
 useFrame(({clock},delta)=>{
  if(door.current)door.current.rotation.y=THREE.MathUtils.damp(door.current.rotation.y,salon.doorOpen?Math.PI*.48:0,7,delta)
  if(customer.current)customer.current.visible=salon.serviceActive||salon.finishedStyle!==null
  if(stylistArm.current)stylistArm.current.rotation.z=salon.serviceActive?Math.sin(clock.elapsedTime*9)*.35:0
  if(salon.serviceActive){
   serviceTime.current+=Math.min(delta,.1)
   if(serviceTime.current>=5&&completed.current!==salon.serviceId){
    completed.current=salon.serviceId
    window.dispatchEvent(new CustomEvent('tryamm:streetverse-lateasia-service-complete',{detail:{serviceId:salon.serviceId}}))
   }
  }
 })
 return <group name="lateasia-beauty-house-prototype" position={[-705,0,775]}>
  <mesh position={[0,2.1,-1.3]}><boxGeometry args={[7,4.2,.3]}/><meshStandardMaterial color="#f2b4d3"/></mesh>
  <mesh position={[-3.4,2,0]}><boxGeometry args={[.3,4,3]}/><meshStandardMaterial color="#fff0f6"/></mesh>
  <mesh position={[3.4,2,0]}><boxGeometry args={[.3,4,3]}/><meshStandardMaterial color="#fff0f6"/></mesh>
  <mesh position={[0,.08,0]}><boxGeometry args={[7,.15,3]}/><meshStandardMaterial color="#b68f9f"/></mesh>
  <group ref={door} position={[1,0,1.4]} name="beauty-house-door-hinge">
   <mesh position={[-.65,1.3,0]}><boxGeometry args={[1.3,2.6,.09]}/><meshStandardMaterial color="#c878a8" transparent opacity={.82}/></mesh>
   <mesh position={[-1.1,1.3,.09]}><sphereGeometry args={[.09,12,12]}/><meshStandardMaterial color="#e8c45a" metalness={.75}/></mesh>
  </group>
  <mesh position={[-1.5,.65,-.4]}><cylinderGeometry args={[.45,.45,.18,18]}/><meshStandardMaterial color="#b34b89"/></mesh>
  <mesh position={[-1.5,1.25,-.85]}><boxGeometry args={[.9,1.1,.2]}/><meshStandardMaterial color="#b34b89"/></mesh>
  <group ref={customer} name="beauty-house-seated-customer" visible={false} position={[-1.5,.65,-.4]}>
   <mesh position={[0,.75,0]}><capsuleGeometry args={[.24,.7,6,12]}/><meshStandardMaterial color="#4b7f9c"/></mesh>
   <mesh position={[0,1.3,0]}><sphereGeometry args={[.27,16,12]}/><meshStandardMaterial color="#8d583f"/></mesh>
   {salon.finishedStyle===null&&<mesh position={[0,1.49,0]}><sphereGeometry args={[.29,16,12,0,Math.PI*2,0,Math.PI*.45]}/><meshStandardMaterial color="#25202b"/></mesh>}
   {salon.finishedStyle==='curls'&&Array.from({length:12},(_,i)=><mesh key={i} position={[Math.cos(i*Math.PI/6)*.23,1.55+Math.sin(i*2)*.11,Math.sin(i*Math.PI/6)*.23]}><sphereGeometry args={[.13,10,8]}/><meshStandardMaterial color="#261922"/></mesh>)}
   {salon.finishedStyle==='locs'&&Array.from({length:10},(_,i)=><mesh key={i} position={[Math.cos(i*Math.PI/5)*.23,1.37,Math.sin(i*Math.PI/5)*.23]}><capsuleGeometry args={[.038,.36,4,8]}/><meshStandardMaterial color="#251b23"/></mesh>)}
   {salon.finishedStyle==='braids'&&Array.from({length:8},(_,i)=><group key={i} position={[Math.cos(i*Math.PI/4)*.24,1.45,Math.sin(i*Math.PI/4)*.24]}>{[0,1,2,3].map(j=><mesh key={j} position={[0,-j*.13,0]}><sphereGeometry args={[.065,8,6]}/><meshStandardMaterial color="#271c28"/></mesh>)}</group>)}
  </group>
  <group name="beauty-house-stylist-tool-animation" position={[-.65,1.8,-.45]}>
   <group ref={stylistArm}>
    <mesh position={[0,-.3,0]}><boxGeometry args={[.09,.6,.09]}/><meshStandardMaterial color="#e9b2d1"/></mesh>
    <mesh position={[0,-.62,0]}><boxGeometry args={[.16,.2,.1]}/><meshStandardMaterial color="#e4bf70"/></mesh>
   </group>
  </group>
  <mesh position={[1.7,1.5,-1.06]}><boxGeometry args={[1.2,1.7,.08]}/><meshStandardMaterial color="#f3e1ff" metalness={.5}/></mesh>
 </group>
}
