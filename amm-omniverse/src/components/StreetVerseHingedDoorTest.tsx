import {useEffect,useRef,useState} from 'react'
import {useFrame} from '@react-three/fiber'
import * as THREE from 'three'

export const DOOR_TEST_POSITION={x:-646,z:700}
export const DOOR_INTERACT_RANGE=7
export type DoorTestResult={ok:boolean;open:boolean;reason:string}

/** Reusable in-world door: hinge pivot, handle twist, collision-safe interaction range. */
export function StreetVerseHingedDoor({playerPosition}:{playerPosition:React.RefObject<{x:number;z:number}>}){
 const pivot=useRef<THREE.Group>(null)
 const knob=useRef<THREE.Group>(null)
 const [open,setOpen]=useState(false)
 const openRef=useRef(false)
 const [locked,setLocked]=useState(false)
 const lockedRef=useRef(false)
 const handleTwist=useRef(0)
 useEffect(()=>{
  const onDoor=(event:Event)=>{
   const detail=(event as CustomEvent<{action?:'toggle'|'lock'|'unlock'}>).detail
   const action=detail?.action||'toggle'
   const position=playerPosition.current
   const distance=Math.hypot(position.x-DOOR_TEST_POSITION.x,position.z-DOOR_TEST_POSITION.z)
   let result:DoorTestResult
   if(distance>DOOR_INTERACT_RANGE)result={ok:false,open:openRef.current,reason:'Move closer to the door (within 7 units).'}
   else if(action==='lock'||action==='unlock'){
    if(openRef.current&&action==='lock')result={ok:false,open:true,reason:'Close the door before locking.'}
    else {lockedRef.current=action==='lock';setLocked(lockedRef.current);result={ok:true,open:openRef.current,reason:lockedRef.current?'Door locked':'Door unlocked'}}
   }else if(lockedRef.current)result={ok:false,open:openRef.current,reason:'Door is locked. Unlock first.'}
   else {
    openRef.current=!openRef.current;setOpen(openRef.current);handleTwist.current=1
    result={ok:true,open:openRef.current,reason:openRef.current?'Handle turned; door opening on hinge':'Handle turned; door closing'}
   }
   window.dispatchEvent(new CustomEvent('tryamm:streetverse-door-test-result',{detail:{...result,locked:lockedRef.current,distance}}))
  }
  window.addEventListener('tryamm:streetverse-door-test',onDoor)
  return()=>window.removeEventListener('tryamm:streetverse-door-test',onDoor)
 },[playerPosition])
 useFrame((_,delta)=>{
  if(pivot.current)pivot.current.rotation.y=THREE.MathUtils.damp(pivot.current.rotation.y,open?-Math.PI*.53:0,7,delta)
  handleTwist.current=Math.max(0,handleTwist.current-delta*2.2)
  if(knob.current)knob.current.rotation.z=handleTwist.current*.55
 })
 return <group position={[DOOR_TEST_POSITION.x,0,DOOR_TEST_POSITION.z]} name="streetverse-hinged-test-door" userData={{locked}}>
  <mesh position={[0,1.55,0]}><boxGeometry args={[.18,3.1,.18]}/><meshStandardMaterial color="#a7b4c1"/></mesh>
  <mesh position={[1.9,1.55,0]}><boxGeometry args={[.18,3.1,.18]}/><meshStandardMaterial color="#a7b4c1"/></mesh>
  <mesh position={[.95,3.1,0]}><boxGeometry args={[2.1,.18,.18]}/><meshStandardMaterial color="#a7b4c1"/></mesh>
  <group ref={pivot} position={[.1,0,0]} name="door-hinge-pivot">
   <mesh position={[.92,1.5,0]} castShadow><boxGeometry args={[1.8,2.95,.12]}/><meshStandardMaterial color="#65412e"/></mesh>
   <group ref={knob} position={[1.56,1.5,.15]} name="turning-door-knob">
    <mesh><sphereGeometry args={[.105,12,12]}/><meshStandardMaterial color="#e3bd58" metalness={.8} roughness={.2}/></mesh>
    <mesh position={[0,0,.09]}><cylinderGeometry args={[.025,.025,.18,8]}/><meshStandardMaterial color="#e3bd58" metalness={.8}/></mesh>
   </group>
  </group>
 </group>
}

export function StreetVerseDoorTestButtons(){
 const [status,setStatus]=useState('Walk near the test door, then press OPEN / CLOSE.')
 const [open,setOpen]=useState(false)
 const [locked,setLocked]=useState(false)
 useEffect(()=>{
  const onResult=(event:Event)=>{
   const detail=(event as CustomEvent<DoorTestResult&{locked:boolean}>).detail
   setStatus((detail.ok?'PASS: ':'BLOCKED: ')+detail.reason)
   setOpen(detail.open);setLocked(detail.locked)
  }
  window.addEventListener('tryamm:streetverse-door-test-result',onResult)
  return()=>window.removeEventListener('tryamm:streetverse-door-test-result',onResult)
 },[])
 const send=(action:'toggle'|'lock'|'unlock')=>window.dispatchEvent(new CustomEvent('tryamm:streetverse-door-test',{detail:{action}}))
 const buttonStyle={minHeight:48,padding:'9px 12px',borderRadius:10,fontSize:14,fontWeight:800,cursor:'pointer'} as const
 return <div aria-label="Hinged door interaction test" style={{position:'absolute',right:12,bottom:100,zIndex:31,width:'min(230px,48vw)',padding:10,background:'rgba(7,20,34,.93)',border:'1px solid #8ceaff',borderRadius:12,color:'white'}}>
  <strong>🚪 DOOR TEST</strong>
  <div role="status" aria-live="polite" style={{fontSize:12,margin:'7px 0'}}>{status}</div>
  <div style={{display:'grid',gap:7}}>
   <button type="button" onClick={()=>send('toggle')} style={buttonStyle}>{open?'CLOSE DOOR':'OPEN DOOR'} • TURN KNOB</button>
   <button type="button" onClick={()=>send(locked?'unlock':'lock')} style={buttonStyle}>{locked?'UNLOCK DOOR':'LOCK DOOR'}</button>
  </div>
 </div>
}
