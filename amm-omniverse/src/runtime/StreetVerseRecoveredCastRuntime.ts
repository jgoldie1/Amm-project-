import * as THREE from 'three'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js'
import {STREETVERSE_RECOVERED_CAST,recoveredCastUrl} from '../data/StreetVerseRecoveredCastAssets'
import {createSharedCastMedicalRuntime} from './StreetVerseSharedCastMedicalRuntime'
import {createUniversalInjuryAnimationController} from './StreetVerseUniversalCharacterRigRuntime'

export type RecoveredCastRole='jacobie'|'lateasia'
type LoadedCast={root:THREE.Object3D;mixer:THREE.AnimationMixer|null;idle:THREE.AnimationAction|null;clips:readonly THREE.AnimationClip[];dispose:()=>void}
const CAST_COORDINATES:Record<RecoveredCastRole,[number,number,number]>={jacobie:[-8,0,9],lateasia:[8,0,9]}

function publishStatus(role:RecoveredCastRole,state:'loading'|'ready'|'unavailable'|'invalid',reason?:string){
 const detail={characterId:STREETVERSE_RECOVERED_CAST[role].id,role,state,
   filename:STREETVERSE_RECOVERED_CAST[role].filename,
   textureReady:STREETVERSE_RECOVERED_CAST[role].textured,
   diagnostic:STREETVERSE_RECOVERED_CAST[role].diagnostic,
   likenessCertified:false,reason}
 window.dispatchEvent(new CustomEvent('tryamm:streetverse-recovered-character-status',{detail}))
}
async function loadRecoveredCharacter(role:RecoveredCastRole):Promise<LoadedCast|null>{
 const asset=STREETVERSE_RECOVERED_CAST[role]
 publishStatus(role,'loading')
 try{
  const controller=new AbortController()
  const timer=setTimeout(()=>controller.abort(),18000)
  let bytes:ArrayBuffer
  try{
   const response=await fetch(recoveredCastUrl(role),{signal:controller.signal,cache:'no-store'})
   if(!response.ok)throw new Error('HTTP '+response.status)
   if((response.headers.get('content-type')||'').includes('text/html'))throw new Error('HTML fallback is not a GLB')
   bytes=await response.arrayBuffer()
  }finally{clearTimeout(timer)}
  const header=new DataView(bytes)
  if(bytes.byteLength!==asset.bytes||header.getUint32(0,true)!==0x46546c67||header.getUint32(4,true)!==2||header.getUint32(8,true)!==bytes.byteLength)throw Error('GLB size/header mismatch')
  const gltf=await new GLTFLoader().parseAsync(bytes,new URL('.',new URL(recoveredCastUrl(role),location.href)).href)
  const root=gltf.scene
  let meshes=0,skinned=0
  root.traverse(obj=>{if(obj instanceof THREE.Mesh){meshes++;if(obj instanceof THREE.SkinnedMesh)skinned++}})
  if(!meshes||!skinned||gltf.animations.length<asset.animationCount)throw new Error('Incomplete rig, mesh, or animation pack')
  const mixer=gltf.animations.length?new THREE.AnimationMixer(root):null
  const idleClip=gltf.animations.find(clip=>/idle/i.test(clip.name))||gltf.animations[0]
  const idle=mixer&&idleClip?mixer.clipAction(idleClip):null
  idle?.play()
  root.name='streetverse-recovered-'+asset.id
  root.userData={...root.userData,characterId:asset.id,source:'owned-recovered-glb',diagnostic:asset.diagnostic,certifiedLikeness:false}
  const dispose=()=>{
   idle?.stop();mixer?.stopAllAction();mixer?.uncacheRoot(root);root.removeFromParent()
   root.traverse(obj=>{
    if(!(obj instanceof THREE.Mesh))return
    obj.geometry.dispose()
    const materials=Array.isArray(obj.material)?obj.material:[obj.material]
    for(const mat of materials){mat.dispose()}
   })
  }
  publishStatus(role,'ready')
  return {root,mixer,idle,clips:gltf.animations,dispose}
 }catch(e){publishStatus(role,'unavailable',e instanceof Error?e.message:'load failed');return null}
}
/** Load real, user-recovered GLBs into the Chicago scene; no substituted NPCs. */
export function mountRecoveredStreetVerseCast(scene:THREE.Scene){
 let disposed=false
 const characters:LoadedCast[]=[]
 const medical=createSharedCastMedicalRuntime()
 const rigControllers:ReturnType<typeof createUniversalInjuryAnimationController>[]=[]
 const registeredRigIds=new Set<string>()
 const onMotion=(event:Event)=>{
  const detail=(event as CustomEvent<{characterId?:string;pose?:string}>).detail
  if(!detail?.characterId||!detail.pose)return
  // The shared bridge preserves original three-character IDs and future factory registrations.
  const i=[...registeredRigIds].indexOf(detail.characterId)
  const controller=rigControllers[i]
  if(controller&&['neutral','stagger','guard','limp','recover'].includes(detail.pose))controller.setPose(detail.pose as 'neutral'|'stagger'|'guard'|'limp'|'recover')
 }
 window.addEventListener('tryamm:streetverse-character-reaction-request',onMotion)
 for(const role of ['jacobie','lateasia'] as const){
  void loadRecoveredCharacter(role).then(character=>{
   if(!character)return
   if(disposed){character.dispose();return}
   character.root.position.set(...CAST_COORDINATES[role])
   // Preserve native character armature and scale; do not fabricate body morph targets.
   scene.add(character.root);characters.push(character)
   medical.register(STREETVERSE_RECOVERED_CAST[role].id,character.root)
   const rig=createUniversalInjuryAnimationController(STREETVERSE_RECOVERED_CAST[role].id,character.root,character.clips)
   rigControllers.push(rig);registeredRigIds.add(STREETVERSE_RECOVERED_CAST[role].id)
   window.dispatchEvent(new CustomEvent('tryamm:streetverse-character-registered',{detail:{characterId:STREETVERSE_RECOVERED_CAST[role].id,fictional:true,quality:rig.audit.quality,rigAudit:rig.audit}}))
  })
 }
 let lastMs=0
 return {
  tick(nowMs:number){const dt=lastMs?Math.min(.1,Math.max(0,(nowMs-lastMs)/1000)):0;lastMs=nowMs;for(const character of characters)character.mixer?.update(dt);for(const controller of rigControllers)controller.tick(dt);medical.tick(nowMs)},
  dispose(){disposed=true;window.removeEventListener('tryamm:streetverse-character-reaction-request',onMotion);medical.dispose();for(const controller of rigControllers)controller.dispose();for(const character of characters)character.dispose();characters.length=0;rigControllers.length=0}
 }
}
