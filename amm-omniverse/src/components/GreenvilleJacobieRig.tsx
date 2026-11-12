import {useEffect,useRef,useState} from 'react'
import * as THREE from 'three'
import {useFrame} from '@react-three/fiber'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js'

export type JacobieRigProof={loaded:boolean;joints:number;clipNames:string[];skinnedMeshes:number;source:'local-glb';error?:string}

/** The player's actual private GLB is selected locally; it is never uploaded to
 * GitHub, Vercel, Meshy or TRYAMM from this component. The procedural avatar is
 * only a clearly identified fall-back until a valid GLB is imported.
 */
export default function GreenvilleJacobieRig({assetUrl,move,onProof}:{
 assetUrl:string|null
 move:React.MutableRefObject<{x:number;z:number}>
 onProof:(detail:JacobieRigProof)=>void
}){
 const root=useRef<THREE.Group>(null)
 const mixer=useRef<THREE.AnimationMixer|null>(null)
 const clips=useRef<Record<string,THREE.AnimationAction>>({})
 const playing=useRef('')
 const [verified,setVerified]=useState(false)
 useEffect(()=>{
  const group=root.current
  if(!group||!assetUrl){setVerified(false);return}
  let disposed=false
  setVerified(false)
  let inserted:THREE.Object3D|null=null
  const loader=new GLTFLoader()
  loader.load(assetUrl,gltf=>{
   if(disposed)return
   const bounds=new THREE.Box3().setFromObject(gltf.scene)
   const size=new THREE.Vector3();const center=new THREE.Vector3();bounds.getSize(size);bounds.getCenter(center)
   let joints=0,skinnedMeshes=0
   gltf.scene.traverse(node=>{
    if((node as THREE.SkinnedMesh).isSkinnedMesh){const skin=node as THREE.SkinnedMesh;skinnedMeshes++;joints=Math.max(joints,skin.skeleton.bones.length)}
    if((node as THREE.Mesh).isMesh)(node as THREE.Mesh).castShadow=true
   })
   if(!Number.isFinite(size.y)||size.y<=.01||joints<1||!skinnedMeshes){onProof({loaded:false,joints,skinnedMeshes,clipNames:[],source:'local-glb',error:'The chosen GLB is not a valid skinned humanoid.'});return}
   const scale=2.12/size.y
   gltf.scene.scale.setScalar(scale)
   gltf.scene.position.set(-center.x*scale,-bounds.min.y*scale,-center.z*scale)
   group.add(gltf.scene);inserted=gltf.scene
   const activeMixer=new THREE.AnimationMixer(gltf.scene)
   mixer.current=activeMixer
   clips.current={}
   for(const clip of gltf.animations)clips.current[clip.name]=activeMixer.clipAction(clip)
   const initial=clips.current['Idle_Approx']||clips.current['Idle']||Object.values(clips.current)[0]
   if(initial){initial.reset().fadeIn(.2).play();playing.current=initial.getClip().name}
   setVerified(true)
   const detail:JacobieRigProof={loaded:true,joints,skinnedMeshes,clipNames:gltf.animations.map(c=>c.name),source:'local-glb'}
   onProof(detail)
   window.dispatchEvent(new CustomEvent('tryamm:campusverse-jacobie-rig-ready',{detail:{...detail,character:'Jacobie',localOnly:true}}))
  },undefined,err=>{
   if(!disposed)onProof({loaded:false,joints:0,skinnedMeshes:0,clipNames:[],source:'local-glb',error:String(err)})
  })
  return()=>{
   disposed=true
   if(mixer.current){mixer.current.stopAllAction();mixer.current.uncacheRoot(inserted||group);mixer.current=null}
   clips.current={};playing.current='';setVerified(false)
   if(inserted)group.remove(inserted)
  }
 },[assetUrl,onProof])
 useFrame((_,dt)=>{
  const active=mixer.current
  if(!active)return
  const moving=Math.abs(move.current.x)+Math.abs(move.current.z)>.12
  const next=moving?(clips.current['Walk']||clips.current['Run']):(clips.current['Idle_Approx']||clips.current['Idle'])
  if(next&&next.getClip().name!==playing.current){
   const old=clips.current[playing.current]
   if(old)old.fadeOut(.2)
   next.reset().fadeIn(.2).play();playing.current=next.getClip().name
  }
  active.update(Math.min(dt,.08))
 })
 return <group ref={root} name="greenville-jacobie-rig-anchor">
  {!verified&&<group name="greenville-placeholder-avatar">
   <mesh castShadow position={[0,1.15,0]}><capsuleGeometry args={[.28,.8,5,10]}/><meshStandardMaterial color="#172c55"/></mesh>
   <mesh castShadow position={[0,2,0]}><sphereGeometry args={[.29,14,10]}/><meshStandardMaterial color="#79513c"/></mesh>
  </group>}
 </group>
}
