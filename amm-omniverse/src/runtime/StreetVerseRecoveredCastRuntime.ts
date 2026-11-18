import * as THREE from 'three'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js'
import {STREETVERSE_RECOVERED_CAST,recoveredCastUrl} from '../data/StreetVerseRecoveredCastAssets'
import {localRecoveredCastUrl} from './StreetVerseLocalCastImport'
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
   const response=await fetch(localRecoveredCastUrl(role)||recoveredCastUrl(role),{signal:controller.signal,cache:'no-store'})
   if(!response.ok)throw new Error('HTTP '+response.status)
   if((response.headers.get('content-type')||'').includes('text/html'))throw new Error('HTML fallback is not a GLB')
   bytes=await response.arrayBuffer()
  }finally{clearTimeout(timer)}
  const header=new DataView(bytes)
  if(bytes.byteLength!==asset.bytes||header.getUint32(0,true)!==0x46546c67||header.getUint32(4,true)!==2||header.getUint32(8,true)!==bytes.byteLength)throw Error('GLB size/header mismatch')
  // Self-contained verified ZIP assets use blob: URLs, which cannot be relative URL bases.
  const gltf=await new GLTFLoader().parseAsync(bytes,location.origin+'/')
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
/** Load recovered user-owned characters from protected URLs or an explicitly chosen local ZIP. */
export function mountRecoveredStreetVerseCast(scene:THREE.Scene){
 let disposed=false
 const characters=new Map<RecoveredCastRole,LoadedCast>()
 const controllers=new Map<RecoveredCastRole,ReturnType<typeof createUniversalInjuryAnimationController>>()
 const generations=new Map<RecoveredCastRole,number>()
 const medical=createSharedCastMedicalRuntime()
 const roles=['jacobie','lateasia'] as const

 const loadRole=async(role:RecoveredCastRole)=>{
   const generation=(generations.get(role)||0)+1
   generations.set(role,generation)
   const character=await loadRecoveredCharacter(role)
   if(!character)return
   if(disposed||generations.get(role)!==generation){character.dispose();return}
   controllers.get(role)?.dispose()
   characters.get(role)?.dispose()
   character.root.position.set(...CAST_COORDINATES[role])
   // Keep the actual recovered armature; no fabricated morph targets or likeness claims.
   scene.add(character.root)
   characters.set(role,character)
   medical.register(STREETVERSE_RECOVERED_CAST[role].id,character.root)
   const rig=createUniversalInjuryAnimationController(STREETVERSE_RECOVERED_CAST[role].id,character.root,character.clips)
   controllers.set(role,rig)
   window.dispatchEvent(new CustomEvent('tryamm:streetverse-character-registered',{detail:{
     characterId:STREETVERSE_RECOVERED_CAST[role].id,fictional:true,
     quality:rig.audit.quality,rigAudit:rig.audit,localSession:Boolean(localRecoveredCastUrl(role))
   }}))
 }
 const onMotion=(event:Event)=>{
   const detail=(event as CustomEvent<{characterId?:string;pose?:string}>).detail
   if(!detail?.characterId||!detail.pose)return
   const role=roles.find(r=>STREETVERSE_RECOVERED_CAST[r].id===detail.characterId)
   const controller=role?controllers.get(role):null
   if(controller&&['neutral','stagger','guard','limp','recover'].includes(detail.pose))
     controller.setPose(detail.pose as 'neutral'|'stagger'|'guard'|'limp'|'recover')
 }
 // A local ZIP can be selected AFTER the player enters Chicago; reload the real
 // imported meshes in-place, without a page refresh or cloud upload.
 const onLocalCast=()=>{for(const role of roles)void loadRole(role)}
 window.addEventListener('tryamm:streetverse-character-reaction-request',onMotion)
 window.addEventListener('tryamm:streetverse-recovered-cast-local-import',onLocalCast)
 for(const role of roles)void loadRole(role)
 let lastMs=0
 return {
   tick(nowMs:number){
     const dt=lastMs?Math.min(.1,Math.max(0,(nowMs-lastMs)/1000)):0;lastMs=nowMs
     for(const character of characters.values())character.mixer?.update(dt)
     for(const controller of controllers.values())controller.tick(dt)
     medical.tick(nowMs)
   },
   dispose(){
     disposed=true
     window.removeEventListener('tryamm:streetverse-character-reaction-request',onMotion)
     window.removeEventListener('tryamm:streetverse-recovered-cast-local-import',onLocalCast)
     medical.dispose()
     for(const controller of controllers.values())controller.dispose()
     for(const character of characters.values())character.dispose()
     characters.clear();controllers.clear()
   }
 }
}
