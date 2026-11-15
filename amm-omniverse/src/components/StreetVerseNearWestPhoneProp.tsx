import {useEffect,useRef,useState} from 'react'
import {useFrame} from '@react-three/fiber'
import * as THREE from 'three'

/** Visual prop for Holo FON calls in Chicago. Not a skeletal hand-to-ear animation. */
export default function StreetVerseNearWestPhoneProp({playerPosition}:{playerPosition:React.RefObject<{x:number;z:number}>}){
 const phone=useRef<THREE.Group>(null)
 const [visible,setVisible]=useState(false)
 useEffect(()=>{
  const onPose=(event:Event)=>{
   const detail=(event as CustomEvent<{visible?:boolean}>).detail
   setVisible(detail?.visible===true)
  }
  window.addEventListener('tryamm:streetverse-holofon-hand-pose',onPose)
  return()=>window.removeEventListener('tryamm:streetverse-holofon-hand-pose',onPose)
 },[])
 useFrame(()=>{
  const position=playerPosition.current
  if(!phone.current||!position)return
  phone.current.position.set(position.x+.42,1.6,position.z+.24)
 })
 return <group ref={phone} visible={visible} name="near-west-holofon-call-prop">
  <mesh><boxGeometry args={[.16,.31,.035]}/><meshStandardMaterial color="#171e30" metalness={.3}/></mesh>
  <mesh position={[0,0,.02]}><planeGeometry args={[.13,.25]}/><meshStandardMaterial color="#50cce9" emissive="#125c76" emissiveIntensity={.7}/></mesh>
 </group>
}
