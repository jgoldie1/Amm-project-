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

export async function loadRecoveredPlayable(id:RecoveredPlayableId):Promise<RecoveredPlayableHandle|null>{
 const entry=STREETVERSE_RECOVERED_THREE_CAST.find(x=>x.id===id)
 if(!entry)return null
 const resourcePath=new URL('.',new URL(entry.url,window.location.href)).href
 const parseRig=async(bytes:ArrayBuffer)=>{
   if(bytes.byteLength<20||new DataView(bytes).getUint32(0,true)!==0x46546c67)return null
   const rig=await loader.parseAsync(bytes,resourcePath)
   return rig.scene.getObjectsByProperty('type','SkinnedMesh').length&&rig.animations.length?rig:null
 }
 const local=await readLocalCastAsset(id).catch(()=>null)
 let gltf=local?await parseRig(local).catch(()=>null):null
 let source:'device-local'|'app-asset'='device-local'
 if(!gltf){
   source='app-asset'
   try{
     const response=await fetch(entry.url,{cache:'no-store'})
     if(!response.ok||(response.headers.get('content-type')||'').includes('text/html'))return null
     gltf=await parseRig(await response.arrayBuffer())
   }catch{return null}
 }
 if(!gltf)return null
 const clips=gltf.animations
 const object=gltf.scene
 object.name='streetverse-playable-'+id
 object.userData={...object.userData,recoveredPlayable:true,characterId:id,displayName:entry.name,source,clipCount:clips.length}
 normalizeStreetVerseHumanHeight(object,1.82)
 object.traverse(node=>{
   if(node instanceof THREE.Mesh){node.castShadow=true;node.receiveShadow=true;node.frustumCulled=true}
 })
 const mixer=new THREE.AnimationMixer(object)
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
