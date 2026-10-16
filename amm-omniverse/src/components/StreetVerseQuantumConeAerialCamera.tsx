import {useFrame} from '@react-three/fiber'
import {useEffect,useRef} from 'react'
import * as THREE from 'three'
import {TAYLOR_FILLMORE_GATE} from './StreetVerseTaylorFillmoreGate'

export type StreetVerseAerialLensMode='ground'|'city'|'fly-in'|'gate'
const SKY_CAMERA=new THREE.Vector3(-390,635,1500)
const CITY_FOCUS=new THREE.Vector3(-620,0,740)
const GATE_CAMERA=new THREE.Vector3(TAYLOR_FILLMORE_GATE.x+15,16,TAYLOR_FILLMORE_GATE.z+38)
const GATE_FOCUS=new THREE.Vector3(TAYLOR_FILLMORE_GATE.x,3,TAYLOR_FILLMORE_GATE.z)
const FLIGHT_SECONDS=8

/**
 * Quantum Cone is a cinematic camera name, not a claim of quantum physics.
 * Runs after the ground/vehicle camera controllers in the R3F tree.
 * Keeps all player movement and gameplay state intact during aerial observation.
 */
export default function StreetVerseQuantumConeAerialCamera({
 mode,flightKey,onArrive,
}:{
 mode:StreetVerseAerialLensMode
 flightKey:number
 onArrive:()=>void
}){
 const progress=useRef(0)
 const arrived=useRef(false)
 const pos=useRef(new THREE.Vector3())
 const focus=useRef(new THREE.Vector3())
 useEffect(()=>{progress.current=0;arrived.current=false},[flightKey])
 useFrame(({camera},delta)=>{
  if(mode==='ground')return
  if(mode==='city'){
    pos.current.copy(SKY_CAMERA)
    focus.current.copy(CITY_FOCUS)
  }else if(mode==='gate'){
    pos.current.copy(GATE_CAMERA)
    focus.current.copy(GATE_FOCUS)
  }else{
    progress.current=Math.min(1,progress.current+Math.min(delta,.10)/FLIGHT_SECONDS)
    const t=THREE.MathUtils.smoothstep(progress.current,0,1)
    pos.current.copy(SKY_CAMERA).lerp(GATE_CAMERA,t)
    focus.current.copy(CITY_FOCUS).lerp(GATE_FOCUS,t)
    if(progress.current>=1&&!arrived.current){
      arrived.current=true
      onArrive()
    }
  }
  camera.position.lerp(pos.current,1-Math.exp(-4*Math.min(delta,.10)))
  camera.lookAt(focus.current)
 })
 return null
}
