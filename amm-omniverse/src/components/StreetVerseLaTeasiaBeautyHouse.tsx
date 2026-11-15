import {useEffect,useRef,useState} from 'react'
import {useFrame} from '@react-three/fiber'
import * as THREE from 'three'

const GIFT_KEY='streetverse:lateasia-treasure-starter:v1'
const SALON_KEY='streetverse:lateasia-beauty-house:v1'
const EVENT='tryamm:streetverse-lateasia-salon-update'
type SalonState={unlocked:boolean;doorOpen:boolean;clientsServed:number}
const initial:SalonState={unlocked:false,doorOpen:false,clientsServed:0}
const load=():SalonState=>{
 try{const s=JSON.parse(localStorage.getItem(SALON_KEY)||'null');return s?{unlocked:s.unlocked===true,doorOpen:false,clientsServed:Math.max(0,Math.min(100000,Math.floor(Number(s.clientsServed)||0)))}:initial}catch{return initial}
}
const hasKey=()=>{try{return JSON.parse(localStorage.getItem(GIFT_KEY)||'null')?.claimed===true}catch{return false}}
export function StreetVerseLaTeasiaBeautyHouseControls(){
 const [salon,setSalon]=useState<SalonState>(load)
 const [message,setMessage]=useState('Claim LaTeasia’s founder gift to receive the Beauty House key.')
 useEffect(()=>{
  try{localStorage.setItem(SALON_KEY,JSON.stringify(salon))}catch{}
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
  setSalon(s=>({...s,clientsServed:s.clientsServed+1}))
  setMessage('Fictional salon RP service completed. No real booking or payment.')
 }
 const style={minHeight:48,padding:'9px 12px',borderRadius:10,fontWeight:800,fontSize:13,cursor:'pointer'} as const
 return <section aria-label="LaTeasia Beauty House founder controls" style={{position:'absolute',left:12,top:80,zIndex:32,width:'min(255px,55vw)',background:'rgba(18,18,32,.94)',color:'white',border:'1px solid #e9b5d2',borderRadius:12,padding:10}}>
  <strong>💄 LaTeasia • Beauty House RP</strong>
  <div style={{display:'grid',gap:7,marginTop:8}}>
   <button type="button" onClick={unlock} style={style}>{salon.unlocked?'✓ FOUNDER KEY USED':'USE FOUNDER KEY'}</button>
   <button type="button" onClick={door} style={style}>{salon.doorOpen?'CLOSE SALON DOOR':'OPEN SALON DOOR'}</button>
   <button type="button" onClick={serve} style={style}>START BEAUTY RP SERVICE</button>
  </div>
  <div role="status" aria-live="polite" style={{fontSize:12,marginTop:8}}>{message} · Services: {salon.clientsServed}</div>
 </section>
}
/** Minimal interactive 3D salon prototype, not a finished furnished BeautyVerse interior. */
export function StreetVerseLaTeasiaBeautyHouseScene(){
 const [salon,setSalon]=useState<SalonState>(load)
 const door=useRef<THREE.Group>(null)
 useEffect(()=>{
  const onUpdate=(event:Event)=>setSalon((event as CustomEvent<SalonState>).detail)
  window.addEventListener(EVENT,onUpdate)
  return()=>window.removeEventListener(EVENT,onUpdate)
 },[])
 useFrame((_,delta)=>{
  if(door.current)door.current.rotation.y=THREE.MathUtils.damp(door.current.rotation.y,salon.doorOpen?Math.PI*.48:0,7,delta)
 })
 return <group name="lateasia-beauty-house-prototype" position={[-625,0,682]}>
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
  <mesh position={[1.7,1.5,-1.06]}><boxGeometry args={[1.2,1.7,.08]}/><meshStandardMaterial color="#f3e1ff" metalness={.5}/></mesh>
 </group>
}
