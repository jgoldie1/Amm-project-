import {useEffect,useRef,useState} from 'react'
import {useFrame} from '@react-three/fiber'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js'
import * as THREE from 'three'
import {createStreetVerseThreeAnimationController} from '../lib/streetverseThreeAnimationAdapter'
import type {AnimationRole} from '../lib/streetverseAnimationFactory'

/** Load a hosted, rigged GLB only when explicitly configured. Never replace BJ's playable character. */
export default function StreetVerseLaTeasiaAnimatedNpc({assetUrl,position=[-635,0,680]}:{assetUrl:string;position?:[number,number,number]}){
 const group=useRef<THREE.Group>(null)
 const controller=useRef<ReturnType<typeof createStreetVerseThreeAnimationController>|null>(null)
 const [status,setStatus]=useState('waiting')
 useEffect(()=>{
  if(!assetUrl.startsWith('/')&&!/^https:\/\//.test(assetUrl)){setStatus('asset-not-configured');return}
  let disposed=false
  let scene:THREE.Group|null=null
  const loader=new GLTFLoader()
  loader.load(assetUrl,gltf=>{
   if(disposed)return
   scene=gltf.scene
   group.current?.add(gltf.scene)
   const instance=createStreetVerseThreeAnimationController('lateasia-monroe',gltf,setStatus)
   controller.current=instance
   instance.play('idle')
   setStatus('loaded')
   window.dispatchEvent(new CustomEvent('tryamm:streetverse-character-animation-ready',{detail:{characterId:'lateasia-monroe',manifest:instance.manifest}}))
  },undefined,error=>{
   if(disposed)return
   setStatus('asset-load-failed')
   window.dispatchEvent(new CustomEvent('tryamm:streetverse-character-animation-error',{detail:{characterId:'lateasia-monroe',reason:String(error)}}))
  })
  const onAction=(event:Event)=>{
   const detail=(event as CustomEvent<{characterId?:string;role?:AnimationRole}>).detail
   if(detail?.characterId!=='lateasia-monroe'||!detail.role)return
   controller.current?.play(detail.role)
  }
  window.addEventListener('tryamm:streetverse-character-animation',onAction)
  return ()=>{
   disposed=true
   window.removeEventListener('tryamm:streetverse-character-animation',onAction)
   controller.current?.dispose();controller.current=null
   if(scene)group.current?.remove(scene)
  }
 },[assetUrl])
 useFrame((_,delta)=>controller.current?.update(delta))
 return <group ref={group} position={position} name="lateasia-monroe-animated-npc" userData={{characterId:'lateasia-monroe',animationStatus:status}}/>
}
