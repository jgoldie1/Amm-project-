import * as THREE from 'three'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js'
import {STREETVERSE_RECOVERED_THREE_CAST} from '../data/StreetVerseRecoveredThreeCast'

/** Opt-in in-world stage. Does not replace the player's established movement controller.
 * Does not claim likeness, mobile certification, or external asset publication.
 * Models are loaded sequentially to bound peak memory on phones.
 */
export function installStreetVerseThreeCastStage(scene:THREE.Scene){
 const stage=new THREE.Group()
 stage.name='streetverse-three-cast-stage'
 scene.add(stage)
 const loader=new GLTFLoader()
 const mixers:THREE.AnimationMixer[]=[]
 const modelRoots:THREE.Object3D[]=[]
 let disposed=false, loading=false, frame=0, last=performance.now()
 const emit=(status:string,detail:Record<string,unknown>={})=>{
  if(!disposed)window.dispatchEvent(new CustomEvent('tryamm:streetverse-cast-stage-result',{detail:{status,...detail}}))
 }
 const animate=(now:number)=>{
  if(disposed)return
  const dt=THREE.MathUtils.clamp((now-last)/1000,0,.05);last=now
  mixers.forEach(m=>m.update(dt))
  frame=requestAnimationFrame(animate)
 }
 frame=requestAnimationFrame(animate)
 const clear=()=>{
  for(const mixer of mixers)mixer.stopAllAction()
  mixers.length=0
  for(const root of modelRoots){root.removeFromParent();root.traverse(node=>{
   if(node instanceof THREE.Mesh){node.geometry?.dispose()
    const materials=Array.isArray(node.material)?node.material:[node.material]
    materials.forEach(m=>m?.dispose())
   }
  })}
  modelRoots.length=0
 }
 const open=async()=>{
  if(loading||disposed)return
  loading=true;clear()
  const results:Array<{name:string;status:string;clips:number;url:string;error?:string}>=[]
  for(const [i,entry] of STREETVERSE_RECOVERED_THREE_CAST.entries()){
   if(disposed)break
   try{
    const response=await fetch(entry.url,{cache:'no-store'})
    if(!response.ok||/text\/html/i.test(response.headers.get('content-type')||''))throw new Error('GLB unavailable (HTTP '+response.status+')')
    const data=await response.arrayBuffer()
    if(data.byteLength<20||new DataView(data).getUint32(0,true)!==0x46546c67)throw new Error('Non-GLB response')
    const gltf=await loader.parseAsync(data,new URL('.',new URL(entry.url,window.location.href)).href)
    const bones=gltf.scene.getObjectsByProperty('type','SkinnedMesh').length
    if(bones<1||gltf.animations.length===0)throw new Error('Skinned animation missing')
    const model=gltf.scene
    model.name='recovered-'+entry.id
    model.position.set(i*2.7-2.7,0,-8)
    model.scale.setScalar(1)
    // Avoid making a likeness claim by forcing arbitrary facial or body transformations.
    stage.add(model);modelRoots.push(model)
    const mixer=new THREE.AnimationMixer(model)
    mixers.push(mixer)
    const preferred=gltf.animations.find(c=>new RegExp(entry.motion,'i').test(c.name))||gltf.animations[0]
    const action=mixer.clipAction(preferred);action.play()
    results.push({name:entry.name,status:'mounted',clips:gltf.animations.length,url:entry.url})
   }catch(error){results.push({name:entry.name,status:'not-mounted',clips:0,url:entry.url,error:String(error)})}
   emit('progress',{results})
  }
  loading=false
  emit('done',{results,allThreeMounted:results.length===3&&results.every(x=>x.status==='mounted'),visualAcceptance:false,deviceCertified:false})
 }
 window.addEventListener('tryamm:streetverse-cast-stage-open',open)
 return {dispose:()=>{disposed=true;window.removeEventListener('tryamm:streetverse-cast-stage-open',open);cancelAnimationFrame(frame);clear();stage.removeFromParent()}}
}
