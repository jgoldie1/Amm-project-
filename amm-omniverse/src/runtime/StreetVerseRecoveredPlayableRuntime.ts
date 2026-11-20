import * as THREE from 'three'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js'
import {STREETVERSE_RECOVERED_THREE_CAST} from '../data/StreetVerseRecoveredThreeCast'
import {readLocalCastAsset} from './StreetVerseCharacterLocalRecovery'
import {normalizeStreetVerseHumanHeight} from './StreetVerseHumanScale'

export type RecoveredPlayableId='jacobie-stubbs'|'lateasia-monroe'
export type RecoveredPlayableHandle={
 id:RecoveredPlayableId
 name:string
 object:THREE.Object3D
 clips:THREE.AnimationClip[]
 source:'device-local'|'app-asset'
 tick:(now:number,state:{moving:boolean;running?:boolean})=>void
 dispose:()=>void
}

const loader=new GLTFLoader()

// The archived LaTeasia model is an untextured diagnostic placeholder.
// Keep its original topology and material intact. An unrelated color gradient
// cannot reconstruct the approved person's face, body or outfit.

export async function loadRecoveredPlayable(id:RecoveredPlayableId):Promise<RecoveredPlayableHandle|null>{
 const entry=STREETVERSE_RECOVERED_THREE_CAST.find(x=>x.id===id)
 if(!entry)return null
 const resourcePath=new URL('.',new URL(entry.url,window.location.href)).href
 const fail=(reason:string)=>window.dispatchEvent(new CustomEvent('tryamm:streetverse-recovered-playable-error',{detail:{characterId:id,reason}}))
 const parseRig=async(bytes:ArrayBuffer)=>{
   if(bytes.byteLength<20||new DataView(bytes).getUint32(0,true)!==0x46546c67)return null
   const rig=await loader.parseAsync(bytes,resourcePath)
   return rig.scene.getObjectsByProperty('type','SkinnedMesh').length&&rig.animations.length?rig:null
 }
 // Old browser-side imports must never silently replace the original Library-backed cast.
 // Use an owner-imported file only after an explicit import selection.
 const preferLocal=(()=>{try{return localStorage.getItem('tryamm:streetverse:cast-source:'+id)==='device-local'}catch{return false}})()
 const local=preferLocal?await readLocalCastAsset(id).catch(()=>null):null
 let gltf=local?await parseRig(local).catch(()=>null):null
 let source:'device-local'|'app-asset'='device-local'
 if(!gltf){
   source='app-asset'
   const controller=new AbortController()
   const deadline=window.setTimeout(()=>controller.abort(),20000)
   try{
     const response=await fetch(entry.url,{cache:'no-store',signal:controller.signal})
     if(!response.ok){fail('GLB HTTP '+response.status+' at '+entry.url);return null}
     if((response.headers.get('content-type')||'').includes('text/html')){fail('GLB URL returned HTML instead of model');return null}
     const bytes=await response.arrayBuffer()
     if(bytes.byteLength<20){fail('Model returned empty GLB ('+bytes.byteLength+' bytes)');return null}
     let decodeTimer:ReturnType<typeof setTimeout>|undefined
     try{
       gltf=await Promise.race([
         parseRig(bytes),
         new Promise<null>(resolve=>{decodeTimer=window.setTimeout(()=>{fail('GLB decode timeout after 20 seconds');resolve(null)},20000)}),
       ])
     }finally{if(decodeTimer!==undefined)window.clearTimeout(decodeTimer)}
   }catch(error){fail(controller.signal.aborted?'GLB download timed out (20 seconds)':'Model network/decoder error: '+String(error).slice(0,170));return null}
   finally{window.clearTimeout(deadline)}
 }
 if(!gltf){fail('GLB missing, invalid, or lacking rigged animations');return null}
 const clips=gltf.animations
 // Keep the animated glTF scene intact inside a separate movable player root.
 // A player position update must not erase the original model's centering,
 // skeleton transforms or grounded feet.
 const model=gltf.scene
 normalizeStreetVerseHumanHeight(model,1.82)
 const bounds=new THREE.Box3().setFromObject(model)
 const center=new THREE.Vector3();bounds.getCenter(center)
 if(bounds.isEmpty()||!Number.isFinite(center.x)||!Number.isFinite(bounds.min.y)){
   fail('GLB has no measurable visible geometry');return null
 }
 model.position.x-=center.x
 model.position.z-=center.z
 model.position.y-=bounds.min.y
 const object=new THREE.Group()
 object.name='streetverse-playable-'+id
 object.userData={recoveredPlayable:true,characterId:id,displayName:entry.name,source,clipCount:clips.length,diagnosticAppearance:id==='lateasia-monroe',likenessVerified:false}
 object.add(model)
 object.traverse(node=>{
   if(node instanceof THREE.Mesh){
     node.castShadow=true;node.receiveShadow=true
     // Skinned poses can extend beyond static imported bounds and disappear
     // when culled by the GPU; original character geometry is always rendered.
     node.frustumCulled=!(node instanceof THREE.SkinnedMesh)
     node.visible=true
   }
 })
 const mixer=new THREE.AnimationMixer(model)
 const find=(patterns:RegExp[])=>clips.find(c=>patterns.some(p=>p.test(c.name)))
 const map={
   idle:find([/idle/i,/stand/i,/breath/i]),
   walk:find([/walk/i,/locomotion/i]),
   run:find([/run/i,/jog/i,/sprint/i]),
 }
 let active:THREE.AnimationAction|null=null
 let activeName=''
 let last=performance.now()
 const tick=(now:number,state:{moving:boolean;running?:boolean})=>{
   const motion=state.running?'run':state.moving?'walk':'idle'
   if(motion!==activeName){
     const clip=map[motion]||map.walk||map.idle||clips[0]
     if(clip){
       const next=mixer.clipAction(clip);next.enabled=true;next.reset().play()
       if(active&&active!==next)active.crossFadeTo(next,.14,false)
       active=next;activeName=motion
     }
   }
   const dt=THREE.MathUtils.clamp((now-last)/1000,0,.05);last=now;mixer.update(dt)
 }
 const dispose=()=>{
   mixer.stopAllAction()
   object.removeFromParent()
   object.traverse(node=>{
     if(!(node instanceof THREE.Mesh))return
     node.geometry?.dispose()
     ;(Array.isArray(node.material)?node.material:[node.material]).forEach(m=>m?.dispose())
   })
 }
 window.dispatchEvent(new CustomEvent('tryamm:streetverse-recovered-playable-ready',{detail:{id,name:entry.name,source,clips:clips.map(c=>c.name)}}))
 return{id,name:entry.name,object,clips,source,tick,dispose}
}
