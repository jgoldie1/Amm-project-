import {useEffect,useMemo,useRef,useState} from 'react'
import {useFrame} from '@react-three/fiber'
import * as THREE from 'three'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js'

/** Meshy export is optional: the campus remains playable until the approved GLB is installed. */
export const JACOBIE_CAMPUS_GLB='/tryamm-assets/meshy/characters/SV_HERO_JACOBIE_GREENVILLE_V1.glb'

export default function JacobieCampusAvatar({moving}:{moving:boolean}){
 const [model,setModel]=useState<THREE.Group|null>(null)
 const mixer=useRef<THREE.AnimationMixer|null>(null)
 const clips=useRef<THREE.AnimationClip[]>([])
 const actions=useRef<{idle?:THREE.AnimationAction;walk?:THREE.AnimationAction}>({})
 const active=useRef<'idle'|'walk'|null>(null)
 const loader=useMemo(()=>new GLTFLoader(),[])
 useEffect(()=>{
  let cancelled=false
  loader.load(JACOBIE_CAMPUS_GLB,gltf=>{
   if(cancelled)return
   const scene=gltf.scene
   const bounds=new THREE.Box3().setFromObject(scene)
   const size=bounds.getSize(new THREE.Vector3())
   if(!Number.isFinite(size.y)||size.y<=0.01)return
   const scale=1.85/size.y
   scene.scale.setScalar(scale)
   scene.position.y=-bounds.min.y*scale
   scene.traverse(child=>{if((child as THREE.Mesh).isMesh){child.castShadow=true;child.receiveShadow=true}})
   clips.current=gltf.animations
   mixer.current=new THREE.AnimationMixer(scene)
   const idle=gltf.animations.find(c=>/idle|breath|stand/i.test(c.name))
   const walk=gltf.animations.find(c=>/walk|locomotion/i.test(c.name))
   actions.current={idle:idle?mixer.current.clipAction(idle):undefined,walk:walk?mixer.current.clipAction(walk):undefined}
   active.current=null
   setModel(scene)
  },undefined,()=>{if(!cancelled){setModel(null);mixer.current=null}})
  return ()=>{cancelled=true;mixer.current?.stopAllAction();mixer.current=null;clips.current=[];actions.current={};active.current=null}
 },[loader])
 useFrame((_,dt)=>{
  mixer.current?.update(Math.min(dt,0.1))
  const next=moving&&actions.current.walk?'walk':'idle'
  if(active.current!==next){
   const previous=active.current&&actions.current[active.current]
   previous?.fadeOut(0.2)
   actions.current[next]?.reset().fadeIn(0.2).play()
   active.current=next
  }
 })
 if(model)return <primitive object={model}/>
 return <group name="jacobie-safe-fallback">
  <mesh castShadow position={[0,1.15,0]}><capsuleGeometry args={[.28,.8,5,10]}/><meshStandardMaterial color="#172c55"/></mesh>
  <mesh castShadow position={[0,2,0]}><sphereGeometry args={[.29,14,10]}/><meshStandardMaterial color="#79513c"/></mesh>
 </group>
}
