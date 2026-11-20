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

/** Diagnostic LaTeasia GLB has one untextured neutral material.
 * Apply a low-cost temporary costume/skin/hair palette to its existing skinned mesh.
 * This is visual styling, NOT a recovered facial likeness or final body model.
 */
function styleLaTeasiaDiagnostic(object:THREE.Object3D){
 object.traverse(node=>{
  if(!(node instanceof THREE.SkinnedMesh))return
  const geometry=node.geometry.clone()
  geometry.computeBoundingBox()
  const bounds=geometry.boundingBox
  const position=geometry.getAttribute('position')
  if(!bounds||!position)return
  const colors=new Float32Array(position.count*3)
  const height=Math.max(.01,bounds.max.y-bounds.min.y)
  const cx=(bounds.min.x+bounds.max.x)/2
  const halfWidth=Math.max(.01,(bounds.max.x-bounds.min.x)/2)
  const skin=new THREE.Color(0x986047),hair=new THREE.Color(0x231925)
  const outfit=new THREE.Color(0x7134aa),trim=new THREE.Color(0xd8ae63)
  const trousers=new THREE.Color(0x29243c),shoes=new THREE.Color(0x17131b)
  for(let i=0;i<position.count;i++){
   const y=(position.getY(i)-bounds.min.y)/height
   const x=Math.abs(position.getX(i)-cx)/halfWidth
   let color:THREE.Color
   if(y>.95&&x>.36)color=hair
   else if(y>.83)color=skin
   else if(y<.075)color=shoes
   else if(y<.39)color=trousers
   else if(x>.68&&y>.43)color=skin
   else if(y>.76&&y<.80)color=trim
   else color=outfit
   colors[3*i]=color.r;colors[3*i+1]=color.g;colors[3*i+2]=color.b
  }
  geometry.setAttribute('color',new THREE.BufferAttribute(colors,3))
  node.geometry=geometry
  const old=Array.isArray(node.material)?node.material[0]:node.material
  node.material=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.79,metalness:.03,side:old?.side??THREE.FrontSide})
  node.userData={...node.userData,temporaryDiagnosticPalette:true,originalMaterialPreserved:false}
 })
}

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
 const local=await readLocalCastAsset(id).catch(()=>null)
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
 const object=gltf.scene
 object.name='streetverse-playable-'+id
 object.userData={...object.userData,recoveredPlayable:true,characterId:id,displayName:entry.name,source,clipCount:clips.length}
 if(id==='lateasia-monroe')styleLaTeasiaDiagnostic(object)
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
