import * as THREE from 'three'
import { GLTFLoader } from 'three-stdlib'
import { getStreetVerseAsset } from '../data/streetverseAssetRegistry'
import { evaluateProductionClearance } from '../data/assetRightsRegistry'

const loader=new GLTFLoader()
const cache=new Map<string,Promise<THREE.Group|null>>()

async function fetchModel(url:string){
  if(!cache.has(url)){
    cache.set(url,new Promise(resolve=>{
      loader.load(url,gltf=>resolve(gltf.scene),undefined,()=>resolve(null))
    }))
  }
  const original=await cache.get(url)!
  return original?.clone(true)||null
}

function isAssetCleared(id:string){
  const result=evaluateProductionClearance(id)
  if(!result.allowed){
    console.warn(`[StreetVerse rights gate] blocked ${id}: ${result.reasons.join(', ')}`)
    return false
  }
  return true
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
  if(!asset)return false
  const requireClearance=options.requireClearance??true
  if(requireClearance&&!isAssetCleared(options.id))return false
  const model=await fetchModel(asset.url)
  if(!model)return false
  const position=options.position||options.fallback.position.clone()
  model.position.copy(position)
  model.rotation.y=options.rotationY??asset.rotationY??options.fallback.rotation.y
  const scale=options.scale??asset.scale??1
  model.scale.setScalar(scale)
  model.traverse(node=>{
    if(node instanceof THREE.Mesh){node.castShadow=true;node.receiveShadow=true}
  })
  if(options.transformLoadedModel)await options.transformLoadedModel(model)
  const parent=options.parent??options.scene
  parent.add(model)
  options.fallback.parent?.remove(options.fallback)
  return true
}

export async function preloadStreetVerseAssets(ids:string[],options:{requireClearance?:boolean}={}){
  const requireClearance=options.requireClearance??true
  await Promise.all(ids.map(async id=>{
    const asset=getStreetVerseAsset(id)
    if(!asset)return
    if(requireClearance&&!isAssetCleared(id))return
    await fetchModel(asset.url)
  }))
}
