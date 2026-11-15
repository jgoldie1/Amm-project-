import {useEffect,useRef,useState} from 'react'
import {useFrame} from '@react-three/fiber'
import * as THREE from 'three'

export const LATEASIA_TREASURE_ITEMS=[
 {id:'diamonds',label:'Diamonds',count:24},
 {id:'rubies',label:'Rubies',count:12},
 {id:'emeralds',label:'Emeralds',count:12},
 {id:'sapphires',label:'Sapphires',count:12},
 {id:'gold',label:'Gold bars',count:16},
 {id:'pearls',label:'Pearls',count:18}
] as const
export const LATEASIA_BEAUTYVERSE_WELCOME_GIFTS=[
 {id:'salon-keys',label:'Beauty House salon keys',category:'business'},
 {id:'salon-chair',label:'Luxury salon chair and mirror station',category:'business'},
 {id:'beauty-kit',label:'Professional hair, makeup and nail kit',category:'business'},
 {id:'stylist-uniform',label:'LaTeasia signature stylist outfit',category:'fashion'},
 {id:'heels',label:'Designer-inspired red-sole heels',category:'fashion'},
 {id:'handbag',label:'Gold-trimmed fashion handbag',category:'fashion'},
 {id:'vanity',label:'Illuminated beauty vanity',category:'furniture'},
 {id:'crown',label:'Royal diamond-look tiara',category:'jewelry'},
 {id:'chain-daddy',label:"Who's Your Daddy pendant chain",category:'jewelry'},
 {id:'chain-name',label:'LaTeasia Monroe nameplate chain',category:'jewelry'},
 {id:'photo-studio',label:'BeautyVerse photo and Holo Reel booth access',category:'experience'},
 {id:'salon-booking',label:'Fictional salon booking starter pass',category:'experience'},
 {id:'gift-box',label:'Collectible pink-and-gold flying gift box',category:'collectible'}
] as const
const KEY='streetverse:lateasia-treasure-starter:v1'
export const STARTER_EVENT='tryamm:streetverse-lateasia-starter-update'
type GiftState={claimed:boolean;chestOpen:boolean;delivering:boolean;replay:number}
const initial:GiftState={claimed:false,chestOpen:false,delivering:false,replay:0}
function readGift():GiftState{
 try{const s=JSON.parse(localStorage.getItem(KEY)||'null');return s&&typeof s==='object'?{claimed:s.claimed===true,chestOpen:s.chestOpen===true,delivering:false,replay:0}:initial}catch{return initial}
}
export function StreetVerseLaTeasiaStarterControls(){
 const [gift,setGift]=useState<GiftState>(readGift)
 const [message,setMessage]=useState('LaTeasia Monroe • BeautyVerse flying welcome gift')
 useEffect(()=>{
  try{localStorage.setItem(KEY,JSON.stringify({claimed:gift.claimed,chestOpen:gift.chestOpen}))}catch{}
  window.dispatchEvent(new CustomEvent(STARTER_EVENT,{detail:gift}))
 },[gift])
 const deliver=()=>{
  if(gift.delivering)return
  setGift(s=>({...s,delivering:true,chestOpen:false,replay:s.replay+1}))
  setMessage(gift.claimed?'Replaying your flying gift arrival — no extra rewards.':'Your flying gift is arriving at BeautyVerse!')
 }
 const claim=()=>{
  if(gift.delivering){setMessage('Wait for the gift box to land.');return}
  if(gift.claimed){setGift(s=>({...s,chestOpen:!s.chestOpen}));return}
  setGift(s=>({...s,claimed:true,chestOpen:true}))
  setMessage('Welcome gift claimed! Your jewels, gold and nameplate chains are unlocked.')
 }
 useEffect(()=>{
  const onLanded=()=>{
   setGift(s=>({...s,delivering:false}))
   setMessage('Gift landed! Open the treasure chest.')
  }
  window.addEventListener('tryamm:streetverse-lateasia-gift-landed',onLanded)
  return()=>window.removeEventListener('tryamm:streetverse-lateasia-gift-landed',onLanded)
 },[])
 const button={minHeight:48,padding:'9px 12px',borderRadius:10,fontWeight:800,fontSize:13,cursor:'pointer'} as const
 return <section aria-label="LaTeasia BeautyVerse flying welcome gift" style={{position:'absolute',right:12,top:260,zIndex:33,width:'min(265px,60vw)',background:'rgba(12,21,38,.96)',border:'1px solid #f5d37e',borderRadius:12,padding:10,color:'white'}}>
  <strong>🎁 LaTeasia • BeautyVerse Gift</strong>
  <div style={{fontSize:12,marginTop:6}}>Flying gift box → treasure chest → diamonds, precious gems, gold, salon gifts, fashion and two nameplate chains</div>
  <div style={{display:'grid',gap:7,marginTop:9}}>
   <button type="button" onClick={deliver} style={button} disabled={gift.delivering}>{gift.delivering?'GIFT FLYING IN…':gift.claimed?'REPLAY FLYING GIFT':'SEND FLYING WELCOME GIFT'}</button>
   <button type="button" onClick={claim} style={button} disabled={gift.delivering}>{gift.claimed?(gift.chestOpen?'CLOSE TREASURE CHEST':'OPEN TREASURE CHEST'):'CLAIM & OPEN GIFT'}</button>
  </div>
  {gift.claimed&&<details style={{fontSize:12,marginTop:7}}><summary>VIEW ALL OWNED WELCOME GIFTS</summary><div>Treasure: {LATEASIA_TREASURE_ITEMS.map(item=>item.count+' '+item.label).join(' · ')}</div><ul style={{paddingLeft:18}}>{LATEASIA_BEAUTYVERSE_WELCOME_GIFTS.map(item=><li key={item.id}>{item.label}</li>)}</ul></details>}
  <div role="status" aria-live="polite" style={{fontSize:12,marginTop:8}}>{message}</div>
 </section>
}
const gems=[{x:-.54,color:'#b8f5ff'},{x:-.27,color:'#d41f52'},{x:0,color:'#3fdc89'},{x:.27,color:'#367ce8'},{x:.54,color:'#b8f5ff'}]
/** Animated flying GIFT delivery, not character flight. */
export function StreetVerseLaTeasiaTreasureScene(){
 const [gift,setGift]=useState<GiftState>(readGift)
 const lid=useRef<THREE.Group>(null)
 const flyingBox=useRef<THREE.Group>(null)
 const progress=useRef(0)
 const delivered=useRef(false)
 useEffect(()=>{
  const onUpdate=(event:Event)=>setGift((event as CustomEvent<GiftState>).detail)
  window.addEventListener(STARTER_EVENT,onUpdate)
  return()=>window.removeEventListener(STARTER_EVENT,onUpdate)
 },[])
 useEffect(()=>{progress.current=0;delivered.current=false},[gift.replay])
 useFrame((_,delta)=>{
  if(lid.current)lid.current.rotation.x=THREE.MathUtils.damp(lid.current.rotation.x,gift.chestOpen?-.95:0,6,delta)
  if(flyingBox.current){
   if(gift.delivering)progress.current=Math.min(1,progress.current+Math.min(delta,.1)/3.5)
   const t=progress.current
   flyingBox.current.visible=gift.delivering&&t<1
   flyingBox.current.position.set(-7*(1-t),.95+5*(1-t)*(1-t)+Math.sin(t*Math.PI)*.5,0)
   flyingBox.current.rotation.y=t*Math.PI*2
   if(t>=1&&!delivered.current){delivered.current=true;window.dispatchEvent(new CustomEvent('tryamm:streetverse-lateasia-gift-landed'))}
  }
 })
 return <group name="lateasia-beautyverse-welcome-gift" position={[-632,0,680]}>
  <group ref={flyingBox} name="lateasia-flying-gift-box" visible={false}>
   <mesh castShadow><boxGeometry args={[1.05,1.05,1.05]}/><meshStandardMaterial color="#f4a7cb" metalness={.15}/></mesh>
   <mesh><boxGeometry args={[.18,1.09,1.09]}/><meshStandardMaterial color="#f3cf64" metalness={.7}/></mesh>
   <mesh><boxGeometry args={[1.09,1.09,.18]}/><meshStandardMaterial color="#f3cf64" metalness={.7}/></mesh>
   <mesh position={[0,.59,0]}><torusGeometry args={[.25,.07,8,24]}/><meshStandardMaterial color="#ffe68e" metalness={.6}/></mesh>
  </group>
  <group name="royal-treasure-chest">
   <mesh position={[0,.36,0]} castShadow><boxGeometry args={[1.8,.72,1.05]}/><meshStandardMaterial color="#633719"/></mesh>
   <mesh position={[0,.35,.54]}><boxGeometry args={[1.8,.17,.06]}/><meshStandardMaterial color="#e0b54c" metalness={.75}/></mesh>
   <group ref={lid} position={[0,.73,-.48]} name="treasure-lid-hinge">
    <mesh position={[0,.16,.48]} castShadow><boxGeometry args={[1.84,.32,1.1]}/><meshStandardMaterial color="#8b5122"/></mesh>
    <mesh position={[0,.34,.48]}><boxGeometry args={[1.84,.08,1.1]}/><meshStandardMaterial color="#e1b54a" metalness={.7}/></mesh>
   </group>
   {gift.chestOpen&&gift.claimed&&<>
    {gems.map((gem,i)=><mesh key={i} position={[gem.x,.82+(i%2)*.08,.1]} rotation={[.3,i*.7,.2]}><octahedronGeometry args={[.16,0]}/><meshStandardMaterial color={gem.color} metalness={.25} roughness={.1}/></mesh>)}
    {[-.46,-.15,.16,.47].map((x,i)=><mesh key={i} position={[x,.78,-.25]}><boxGeometry args={[.28,.13,.3]}/><meshStandardMaterial color="#f5c444" metalness={.85}/></mesh>)}
   </>}
  </group>
 </group>
}
