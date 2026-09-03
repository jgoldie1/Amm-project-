import * as THREE from 'three'
import { GLTFLoader } from 'three-stdlib'
import { getStreetVerseAsset } from '../data/streetverseAssetRegistry'
import { evaluateProductionClearance } from '../data/assetRightsRegistry'

const loader=new GLTFLoader()
type CachedModel={scene:THREE.Group;animations:THREE.AnimationClip[]}
const cache=new Map<string,Promise<CachedModel|null>>()
const activeMixers=new Set<THREE.AnimationMixer>()
let animationLoopStarted=false
let lastFrame=0

function ensureAnimationLoop(){
  if(animationLoopStarted||typeof window==='undefined')return
  animationLoopStarted=true
  const tick=(now:number)=>{
    const dt=Math.min(.05,Math.max(0,(now-lastFrame)/1000||0))
    lastFrame=now
    activeMixers.forEach(mixer=>mixer.update(dt))
    requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
}

function keepFallbackVisible(fallback:THREE.Object3D,id:string,reason:string){
  fallback.visible=true
  fallback.traverse(node=>{node.visible=true})
  fallback.userData.streetVerseFallbackActive=true
  fallback.userData.streetVerseFallbackReason=reason
  if(typeof window!=='undefined')window.dispatchEvent(new CustomEvent('tryamm:streetverse-asset-fallback',{detail:{id,reason,fallback:'procedural',visible:true}}))
}

async function fetchModel(url:string){
  if(!cache.has(url)){
    cache.set(url,new Promise(resolve=>{
      loader.load(url,gltf=>resolve({scene:gltf.scene,animations:gltf.animations||[]}),undefined,()=>resolve(null))
    }))
  }
  const original=await cache.get(url)!
  if(!original)return null
  return {scene:original.scene.clone(true),animations:original.animations}
}

function productionClearance(id:string){
  const result=evaluateProductionClearance(id)
  if(!result.allowed){
    console.warn(`[StreetVerse rights gate] blocked ${id}: ${result.reasons.join(', ')}`)
    if(typeof window!=='undefined')window.dispatchEvent(new CustomEvent('tryamm:streetverse-asset-blocked',{detail:{id,reasons:result.reasons,status:result.record?.status||'NO_RECORD'}}))
  }
  return result
}

function startEmbeddedAnimation(model:THREE.Group,clips:THREE.AnimationClip[]){
  if(!clips.length)return
  ensureAnimationLoop()
  const mixer=new THREE.AnimationMixer(model)
  const preferred=clips.find(c=>/idle/i.test(c.name))||clips.find(c=>/walk/i.test(c.name))||clips[0]
  const action=mixer.clipAction(preferred)
  action.reset().fadeIn(.18).play()
  activeMixers.add(mixer)
  model.userData.streetVerseAnimationMixer=mixer
  model.userData.streetVerseAnimationClips=clips.map(c=>c.name)
  model.userData.streetVerseAnimationState=preferred.name||'embedded-animation'
}

export async function replacePrimitiveWithStreetVerseAsset(options:{
  id:string
  fallback:THREE.Object3D
  scene:THREE.Scene
  parent?:THREE.Object3D
  position?:THREE.Vector3
  rotationY?:number
  scale?:number
  requireClearance?:boolean
  transformLoadedModel?:(model:THREE.Group)=>void|Promise<void>
}){
  const asset=getStreetVerseAsset(options.id)
  if(!asset){keepFallbackVisible(options.fallback,options.id,'ASSET_NOT_REGISTERED');return false}
  const requireClearance=options.requireClearance??true
  if(requireClearance){
    const clearance=productionClearance(options.id)
    if(!clearance.allowed){keepFallbackVisible(options.fallback,options.id,clearance.reasons.join('|'));return false}
  }
  const loaded=await fetchModel(asset.url)
  if(!loaded){keepFallbackVisible(options.fallback,options.id,'MODEL_LOAD_FAILED');return false}
  const model=loaded.scene
  const position=options.position||options.fallback.position.clone()
  model.position.copy(position)
  model.rotation.y=options.rotationY??asset.rotationY??options.fallback.rotation.y
  const scale=options.scale??asset.scale??1
  model.scale.setScalar(scale)
  model.traverse(node=>{
    node.visible=true
    if(node instanceof THREE.Mesh){node.castShadow=true;node.receiveShadow=true}
  })
  if(options.transformLoadedModel)await options.transformLoadedModel(model)
  startEmbeddedAnimation(model,loaded.animations)
  const parent=options.parent??options.scene
  parent.add(model)
  options.fallback.parent?.remove(options.fallback)
  if(typeof window!=='undefined')window.dispatchEvent(new CustomEvent('tryamm:streetverse-asset-materialized',{detail:{id:options.id,animated:loaded.animations.length>0,clips:loaded.animations.map(c=>c.name),fallback:false}}))
  return true
}

export async function preloadStreetVerseAssets(ids:string[],options:{requireClearance?:boolean}={}){
  const requireClearance=options.requireClearance??true
  await Promise.all(ids.map(async id=>{
    const asset=getStreetVerseAsset(id)
    if(!asset)return
    if(requireClearance&&!productionClearance(id).allowed)return
    await fetchModel(asset.url)
  }))
}
