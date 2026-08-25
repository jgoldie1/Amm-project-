import * as THREE from 'three'
import { GLTFLoader } from 'three-stdlib'
import { getStreetVerseAsset } from '../data/streetverseAssetRegistry'

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

export async function replacePrimitiveWithStreetVerseAsset(options:{
  id:string
  fallback:THREE.Object3D
  scene:THREE.Scene
  position?:THREE.Vector3
  rotationY?:number
  scale?:number
}){
  const asset=getStreetVerseAsset(options.id)
  if(!asset)return false
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
  options.scene.add(model)
  options.scene.remove(options.fallback)
  return true
}

export async function preloadStreetVerseAssets(ids:string[]){
  await Promise.all(ids.map(async id=>{
    const asset=getStreetVerseAsset(id)
    if(asset)await fetchModel(asset.url)
  }))
}
