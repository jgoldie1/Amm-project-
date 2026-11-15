import {useEffect,useState} from 'react'
/** Fictional Greenville University fraternity mansion: visual prototype only. */
export const GREENVILLE_FRAT_MANSION_POSITION:[number,number,number]=[310,0,-420]
export const GREENVILLE_FRAT_ROOMS=Array.from({length:12},(_,i)=>({id:'suite-'+String(i+1).padStart(2,'0'),label:i===0?'Jacobie Stubbs · Private Master Suite':'Student Suite '+(i+1)}))
export const GREENVILLE_FRAT_INTERACTION_EVENT='tryamm:greenville-frat-interaction'
export function StreetVerseGreenvilleFratMansion(){
 const [frontDoorOpen,setFrontDoorOpen]=useState(false)
 const [activeRoom,setActiveRoom]=useState<string|null>(null)
 useEffect(()=>{const onEvent=(e:Event)=>{const d=(e as CustomEvent<{action:string;roomId?:string}>).detail;if(d?.action==='toggle-door')setFrontDoorOpen(v=>!v);if(d?.action==='visit-room'&&GREENVILLE_FRAT_ROOMS.some(r=>r.id===d.roomId))setActiveRoom(d.roomId!)};window.addEventListener(GREENVILLE_FRAT_INTERACTION_EVENT,onEvent);return()=>window.removeEventListener(GREENVILLE_FRAT_INTERACTION_EVENT,onEvent)},[])
 return <group name="greenville-university-fraternity-mansion" position={GREENVILLE_FRAT_MANSION_POSITION}>
  <mesh receiveShadow position={[0,-.12,0]}><boxGeometry args={[80,.2,75]}/><meshStandardMaterial color="#688a63"/></mesh>
  {[-1,1].map(side=><group key={side} position={[side*14,0,0]}>
   <mesh castShadow position={[0,5,0]}><boxGeometry args={[25,10,23]}/><meshStandardMaterial color="#c6b39c"/></mesh>
   <mesh castShadow position={[0,10.8,0]}><boxGeometry args={[26,1.6,24]}/><meshStandardMaterial color="#3c414e"/></mesh>
   {[-1,0,1].map(i=>[3,8].map(y=><mesh key={i+'-'+y} position={[i*7,y,11.65]}><boxGeometry args={[3.5,3.5,.12]}/><meshStandardMaterial color="#a4d0e2"/></mesh>))}
  </group>)}
  <mesh castShadow position={[0,5,0]}><boxGeometry args={[10,10,20]}/><meshStandardMaterial color="#e4d6c4"/></mesh>
  <mesh name="fraternity-front-door" onClick={e=>{e.stopPropagation();setFrontDoorOpen(v=>!v)}} position={[frontDoorOpen?-2.5:0,3,10.1]}><boxGeometry args={[frontDoorOpen?.2:5,6,.2]}/><meshStandardMaterial color="#553a2f"/></mesh>
  <mesh position={[0,11.8,0]}><boxGeometry args={[13,1.3,21]}/><meshStandardMaterial color="#d6bd7b" metalness={.4}/></mesh>
  <mesh position={[0,-.02,24]}><boxGeometry args={[25,.15,16]}/><meshStandardMaterial color="#b8b2a8"/></mesh>
  <mesh position={[0,.2,-19]}><boxGeometry args={[24,.3,13]}/><meshStandardMaterial color="#7fabb9"/></mesh>
  <mesh position={[0,2,-29]}><boxGeometry args={[29,4,2]}/><meshStandardMaterial color="#d9c8af"/></mesh>
  <mesh position={[0,5.5,10.3]}><boxGeometry args={[8,1,.2]}/><meshStandardMaterial color="#8a6844"/></mesh>
  {/* Jacobie's larger master suite: separate private residence wing in the gallery. */}
  <group name="jacobie-master-suite" position={[-27,0,-42]}>
   <mesh position={[-2,0,-1]}><boxGeometry args={[12,.25,11]}/><meshStandardMaterial color="#e0c79d"/></mesh>
   <mesh position={[-5,1.5,-4]}><boxGeometry args={[3,3,3]}/><meshStandardMaterial color="#b9b6a9"/></mesh>
   <mesh position={[1,1.3,-3]}><boxGeometry args={[4,1.2,3.2]}/><meshStandardMaterial color="#52485f"/></mesh>
   <mesh position={[3,1.2,3]}><boxGeometry args={[2,2,1.5]}/><meshStandardMaterial color="#c0b19a"/></mesh>
  </group>
  {/* Visible furnished suite gallery behind the main house; full walkable interiors follow. */}
  {GREENVILLE_FRAT_ROOMS.map((room,i)=><group key={room.id} name={room.id} position={[-27+(i%6)*10,0,-42-Math.floor(i/6)*11]} onClick={e=>{e.stopPropagation();setActiveRoom(room.id)}}>
   <mesh receiveShadow position={[0,0,0]}><boxGeometry args={[8,.2,8]}/><meshStandardMaterial color={activeRoom===room.id?'#e8ca86':'#c9bbaa'}/></mesh>
   <mesh position={[0,1,-2]}><boxGeometry args={[4,1,3]}/><meshStandardMaterial color="#9e8295"/></mesh>
   <mesh position={[-2,1.1,2]}><boxGeometry args={[2,1.2,1]}/><meshStandardMaterial color="#866a4c"/></mesh>
   <mesh position={[3,1,0]}><boxGeometry args={[.2,2,7]}/><meshStandardMaterial color="#d8c9b7"/></mesh>
  </group>)}
 </group>
}
