import {useEffect,useMemo,useRef,useState} from 'react'
import {useFrame} from '@react-three/fiber'
import * as THREE from 'three'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js'

/**
 * LaTeasia Monroe is a named cross-city creator character, not one of the
 * interchangeable background NPCs. Chicago placement is fictional Taylor St.
 * Only the exact previously recovered LaTeasia GLB may replace the preview.
 * The expected public URL is a DEPLOYMENT TARGET, not a verified installed file.
 */
export const LATEASIA_CHICAGO = {
 id:'lateasia-monroe',name:'LaTeasia Monroe',city:'chicago',
 location:'Taylor Street creator district',
 position:{x:-560,y:0,z:690},
 modelUrl:'/tryamm-assets/meshy/characters/LaTeasia_RIGGED_DIAGNOSTIC.glb',
 intro:'I’m LaTeasia Monroe. Welcome to the Chicago creator district! We can plan a beauty showcase, an original music session, or a trip to my BeautyVerse project in Tampa.',
} as const

export default function StreetVerseLaTeasiaChicago({onStatus,city='chicago',position}:{onStatus?:(realGlbLoaded:boolean)=>void;city?:'chicago'|'tampa';position?:[number,number,number]}){
 const group=useRef<THREE.Group>(null)
 const mixer=useRef<THREE.AnimationMixer|null>(null)
 const installed=useRef<THREE.Object3D|null>(null)
 const [realModel,setRealModel]=useState(false)
 const notify=useRef(onStatus);notify.current=onStatus
 const labelTexture=useMemo(()=>{
  const canvas=document.createElement('canvas');canvas.width=512;canvas.height=128
  const ctx=canvas.getContext('2d')
  if(ctx){ctx.fillStyle='rgba(16,16,34,.92)';ctx.fillRect(0,0,512,128);ctx.strokeStyle='#ffd8e8';ctx.lineWidth=8;ctx.strokeRect(4,4,504,120);ctx.fillStyle='#fff3f8';ctx.font='bold 43px sans-serif';ctx.textAlign='center';ctx.fillText('LaTeasia Monroe',256,76)}
  return new THREE.CanvasTexture(canvas)
 },[])
 useEffect(()=>{
  let cancelled=false
  const loader=new GLTFLoader()
  loader.load(LATEASIA_CHICAGO.modelUrl,glb=>{
   if(cancelled)return
   let meshes=0,skinnedMeshes=0
   glb.scene.traverse(o=>{if((o as THREE.Mesh).isMesh)meshes++;if((o as THREE.SkinnedMesh).isSkinnedMesh)skinnedMeshes++})
   const hasExpectedAnimations=glb.animations.some(x=>/walk/i.test(x.name))&&glb.animations.some(x=>/idle/i.test(x.name))
   if(meshes===0||skinnedMeshes===0||!hasExpectedAnimations||!group.current){notify.current?.(false);return}
   installed.current=glb.scene
   group.current.add(installed.current)
   if(glb.animations.length){
    const m=new THREE.AnimationMixer(installed.current)
    const idle=glb.animations.find(x=>/idle|breath|stand/i.test(x.name))||glb.animations[0]
    m.clipAction(idle).play()
    mixer.current=m
   }
   setRealModel(true);notify.current?.(true)
  },undefined,()=>{if(!cancelled){setRealModel(false);notify.current?.(false)}})
  return()=>{cancelled=true;installed.current?.removeFromParent();installed.current=null;mixer.current?.stopAllAction();mixer.current=null;notify.current?.(false)}
 },[])
 useFrame((_,dt)=>{mixer.current?.update(Math.min(dt,.05))})
 useEffect(()=>()=>labelTexture.dispose(),[labelTexture])
 return <group name={city==='chicago'?'lateasia-monroe-chicago-taylor-street':'lateasia-monroe-tampa-beauty-house'} position={position??[LATEASIA_CHICAGO.position.x,0,LATEASIA_CHICAGO.position.z]} userData={{characterId:'lateasia-monroe',city,assetState:realModel?'loaded-rig-preview-not-likeness-certified':'temporary-placeholder'}}>
  <group ref={group}/>
  {!realModel&&<group name="lateasia-preview-only-not-certified-rig">
   <mesh position={[0,1.04,0]} castShadow><capsuleGeometry args={[.31,1.05,5,12]}/><meshStandardMaterial color="#8a4f91"/></mesh>
   <mesh position={[0,1.9,0]} castShadow><sphereGeometry args={[.32,16,12]}/><meshStandardMaterial color="#946048"/></mesh>
   <mesh position={[0,2.2,-.03]}><sphereGeometry args={[.34,16,12,0,Math.PI*2,0,Math.PI*.5]}/><meshStandardMaterial color="#241420"/></mesh>
  </group>}
  <sprite position={[0,3.1,0]} scale={[3.5,.84,1]}>
   <spriteMaterial map={labelTexture} transparent depthTest={false}/>
  </sprite>
  <mesh position={[0,.035,0]} rotation={[-Math.PI/2,0,0]}>
   <ringGeometry args={[.8,1.12,30]}/><meshBasicMaterial color="#e76db5" side={THREE.DoubleSide}/>
  </mesh>
 </group>
}
