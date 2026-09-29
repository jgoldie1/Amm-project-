import * as THREE from 'three'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js'
import {
  CIRCLE_PARK_NATIVE_PREVIEW_PLACEMENTS,
  TRYAMM_NATIVE_RUNTIME_ASSETS,
  type NativePlacement,
  type TryammNativeRuntimeAssetKey,
} from '../data/TryammNativeRuntimeAssetCatalog'

export interface NativeAssetLayerResult{
  group:THREE.Group
  loaded:number
  failed:Array<{asset:TryammNativeRuntimeAssetKey;url:string;reason:string}>
  usedUrls:string[]
}

type LoadFn=(url:string)=>Promise<THREE.Group>

function cloneForPlacement(source:THREE.Group){
  const clone=source.clone(true)
  clone.traverse(object=>{
    const mesh=object as THREE.Mesh
    if(mesh.isMesh){
      mesh.castShadow=true
      mesh.receiveShadow=true
      mesh.frustumCulled=true
    }
  })
  return clone
}

function applyPlacement(object:THREE.Object3D,placement:NativePlacement){
  object.position.set(...placement.position)
  object.rotation.y=placement.rotationY??0
  const scale=placement.scale??1
  if(Array.isArray(scale))object.scale.set(...scale)
  else object.scale.setScalar(scale)
  object.name=placement.label??`native-${placement.asset}`
  object.userData={
    ...object.userData,
    tryammNativeAsset:placement.asset,
    previewVisualOnly:true,
    collisionAuthority:'primitive-runtime',
  }
}

export async function loadTryammNativeCircleParkLayer(options?:{
  placements?:NativePlacement[]
  load?:LoadFn
}):Promise<NativeAssetLayerResult>{
  const placements=options?.placements??CIRCLE_PARK_NATIVE_PREVIEW_PLACEMENTS
  const loader=new GLTFLoader()
  const defaultLoad:LoadFn=async url=>{
    const gltf=await loader.loadAsync(url)
    return gltf.scene
  }
  const load=options?.load??defaultLoad

  const group=new THREE.Group()
  group.name='TRYAMM-Native-CirclePark-Preview-Layer'
  group.userData={
    provider:'tryamm-native',
    state:'PREVIEW',
    visualOnly:true,
    collisionAuthority:'existing-gameplay-runtime',
  }

  const byKey=new Map<TryammNativeRuntimeAssetKey,THREE.Group>()
  const failed:NativeAssetLayerResult['failed']=[]
  const usedUrls=new Set<string>()

  const uniqueKeys=[...new Set(placements.map(item=>item.asset))]
  await Promise.all(uniqueKeys.map(async key=>{
    const asset=TRYAMM_NATIVE_RUNTIME_ASSETS[key]
    try{
      const object=await load(asset.url)
      byKey.set(key,object)
      usedUrls.add(asset.url)
    }catch(error){
      failed.push({asset:key,url:asset.url,reason:String((error as Error)?.message||error)})
    }
  }))

  let loaded=0
  for(const placement of placements){
    const source=byKey.get(placement.asset)
    if(!source)continue
    const object=cloneForPlacement(source)
    applyPlacement(object,placement)
    group.add(object)
    loaded+=1
  }

  return{group,loaded,failed,usedUrls:[...usedUrls]}
}

export function disposeNativeAssetLayer(group:THREE.Object3D){
  const geometries=new Set<THREE.BufferGeometry>()
  const materials=new Set<THREE.Material>()
  const textures=new Set<THREE.Texture>()
  group.traverse(object=>{
    const mesh=object as THREE.Mesh
    if(mesh.geometry)geometries.add(mesh.geometry)
    const list=Array.isArray(mesh.material)?mesh.material:mesh.material?[mesh.material]:[]
    for(const material of list){
      materials.add(material)
      for(const value of Object.values(material)){
        if(value instanceof THREE.Texture)textures.add(value)
      }
    }
  })
  textures.forEach(texture=>texture.dispose())
  materials.forEach(material=>material.dispose())
  geometries.forEach(geometry=>geometry.dispose())
}
