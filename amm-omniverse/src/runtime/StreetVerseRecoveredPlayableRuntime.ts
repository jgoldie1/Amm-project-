import * as THREE from 'three'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js'
import {STREETVERSE_RECOVERED_THREE_CAST} from '../data/StreetVerseRecoveredThreeCast'
import {readLocalCastAsset} from './StreetVerseCharacterLocalRecovery'

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

// Imported Mixamo/Blender assets can have a 0.01 armature transform while mesh
// vertices are authored in meters. Static geometry bounding boxes are not a
// reliable measure of the skinned, posed character in this situation.
function posedCharacterBounds(model:THREE.Object3D):THREE.Box3{
 model.updateMatrixWorld(true)
 const bounds=new THREE.Box3()
 let found=false
 const vertex=new THREE.Vector3()
 model.traverse(node=>{
  if(!(node instanceof THREE.SkinnedMesh))return
  const positions=node.geometry.getAttribute('position')
  if(!positions)return
  node.skeleton.update()
  const stride=Math.max(1,Math.floor(positions.count/4500))
  for(let i=0;i<positions.count;i+=stride){
   vertex.fromBufferAttribute(positions,i)
   node.applyBoneTransform(i,vertex)
   node.localToWorld(vertex)
   if(Number.isFinite(vertex.x)&&Number.isFinite(vertex.y)&&Number.isFinite(vertex.z)){
    bounds.expandByPoint(vertex);found=true
   }
  }
 })
 if(!found)bounds.setFromObject(model)
 return bounds
}
function fitRecoveredCharacter(model:THREE.Object3D,targetHeight=1.82){
 // Fit the *posed* skinned vertices, not the armature helper nodes.
 const initial=posedCharacterBounds(model)
 const size=new THREE.Vector3();initial.getSize(size)
 if(initial.isEmpty()||!Number.isFinite(size.y)||size.y<0.0001)throw Error('No measurable posed model geometry')
 const scale=THREE.MathUtils.clamp(targetHeight/size.y,.005,300)
 model.scale.multiplyScalar(scale)
 const measured=posedCharacterBounds(model),center=new THREE.Vector3()
 measured.getCenter(center)
 model.position.set(model.position.x-center.x,model.position.y-measured.min.y,model.position.z-center.z)
 const final=posedCharacterBounds(model),extents=new THREE.Vector3()
 final.getSize(extents)
 if(!Number.isFinite(extents.y)||extents.y<.5||extents.y>4)throw Error('Model remains outside playable human scale: '+extents.y.toFixed(2)+'m')
 return {height:extents.y,scale,sourceHeight:size.y}
}

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
   // A binary asset can be omitted by the hosting pipeline even when it exists
   // in GitHub. Try the hosted GLB first, then the repository's raw original.
   // LaTeasia's approved textured recovery has its own versioned path; it is
   // NEVER misrepresented as installed when it returns a 404.
   const repoRoot='https://raw.githubusercontent.com/jgoldie1/Amm-project-/feature/ai-commons-one-push-20261118/amm-omniverse/public'
   const candidates=id==='lateasia-monroe'
     ? ['/tryamm-assets/meshy/characters/LaTeasia_Monroe_Textured_Seven_Motion_Recovery.glb',entry.url,repoRoot+entry.url]
     : [entry.url,repoRoot+entry.url]
   const attempts:string[]=[]
   for(const candidate of candidates){
     const controller=new AbortController()
     const deadline=window.setTimeout(()=>controller.abort(),16000)
     try{
       const response=await fetch(candidate,{cache:'no-store',signal:controller.signal})
       if(!response.ok){attempts.push(response.status+' '+candidate);continue}
       if((response.headers.get('content-type')||'').includes('text/html')){attempts.push('HTML instead of GLB '+candidate);continue}
       const bytes=await response.arrayBuffer()
       if(bytes.byteLength<20){attempts.push('Empty GLB '+candidate);continue}
       let decodeTimer:number|undefined
       try{
         gltf=await Promise.race([
           parseRig(bytes),
           new Promise<null>(resolve=>{decodeTimer=window.setTimeout(()=>resolve(null),16000)}),
         ])
       }finally{if(decodeTimer!==undefined)window.clearTimeout(decodeTimer)}
       if(gltf){
         window.dispatchEvent(new CustomEvent('tryamm:streetverse-original-model-source',{detail:{characterId:id,url:candidate,bytes:bytes.byteLength}}))
         break
       }
       attempts.push('Unusable animated rig '+candidate)
     }catch(error){attempts.push((controller.signal.aborted?'Timed out':'Network or decoder error')+' '+candidate+' '+String(error).slice(0,60))}
     finally{window.clearTimeout(deadline)}
   }
   if(!gltf)fail('All original GLB sources failed: '+attempts.join(' | ').slice(0,480))
 }
 if(!gltf){fail('GLB missing, invalid, or lacking rigged animations');return null}
 const clips=gltf.animations
 // Keep the animated glTF scene intact inside a separate movable player root.
 // A player position update must not erase the original model's centering,
 // skeleton transforms or grounded feet.
 const model=gltf.scene
 let fitted:{height:number;scale:number;sourceHeight:number}
 try{fitted=fitRecoveredCharacter(model)}catch(error){fail('Rig framing failed: '+String(error).slice(0,160));return null}
 const object=new THREE.Group()
 object.name='streetverse-playable-'+id
 let hasPhotoTextures=false
 model.traverse(node=>{
   if(!(node instanceof THREE.Mesh))return
   const materials=Array.isArray(node.material)?node.material:[node.material]
   if(materials.some(m=>m instanceof THREE.MeshStandardMaterial&&Boolean(m.map)))hasPhotoTextures=true
 })
 object.userData={recoveredPlayable:true,characterId:id,displayName:entry.name,source,clipCount:clips.length,
   textureVerified:hasPhotoTextures,diagnosticAppearance:id==='lateasia-monroe'&&!hasPhotoTextures,
   experimentalSkinTransfer:id==='lateasia-monroe'&&hasPhotoTextures&&source==='device-local',
   likenessVerified:false,visualHeightMeters:fitted.height,modelScaleCorrection:fitted.scale,sourcePosedHeightMeters:fitted.sourceHeight}
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
