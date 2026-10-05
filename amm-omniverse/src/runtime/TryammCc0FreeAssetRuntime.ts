import * as THREE from 'three'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js'
import {TRYAMM_CC0_FREE_ASSETS} from '../data/TryammCc0FreeAssetCatalog'

const loader=new GLTFLoader()

type Placement={
  key:keyof typeof TRYAMM_CC0_FREE_ASSETS
  position:[number,number,number]
  rotationY?:number
  targetHeight?:number
  targetLength?:number
  name?:string
}

function fitObject(object:THREE.Object3D,placement:Placement){
  object.updateMatrixWorld(true)
  const box=new THREE.Box3().setFromObject(object)
  const size=new THREE.Vector3()
  box.getSize(size)
  let scale=1
  if(placement.targetHeight&&size.y>0.001)scale=placement.targetHeight/size.y
  else if(placement.targetLength){
    const longest=Math.max(size.x,size.z)
    if(longest>0.001)scale=placement.targetLength/longest
  }
  scale=THREE.MathUtils.clamp(scale,0.02,40)
  object.scale.setScalar(scale)
  object.updateMatrixWorld(true)
  const adjusted=new THREE.Box3().setFromObject(object)
  object.position.y-=adjusted.min.y
}

function disposeObject(object:THREE.Object3D){
  object.traverse(node=>{
    if(!(node instanceof THREE.Mesh))return
    node.geometry?.dispose()
    const materials=Array.isArray(node.material)?node.material:[node.material]
    for(const material of materials){
      if(!material)continue
      for(const value of Object.values(material as unknown as Record<string,unknown>)){
        if(value instanceof THREE.Texture)value.dispose()
      }
      material.dispose()
    }
  })
  object.removeFromParent()
}

const PLACEMENTS:ReadonlyArray<Placement>=[
  {key:'police',position:[-31,0,50],rotationY:Math.PI,targetLength:4.7,name:'cc0-police-unit'},
  {key:'firetruck',position:[-40,0,50],rotationY:Math.PI,targetLength:7.2,name:'cc0-firetruck-unit'},
  {key:'sedan',position:[12,0,52],rotationY:0,targetLength:4.4,name:'cc0-parked-sedan'},
  {key:'suv',position:[20,0,52],rotationY:0,targetLength:4.8,name:'cc0-parked-suv'},
  {key:'taxi',position:[28,0,52],rotationY:0,targetLength:4.5,name:'cc0-parked-taxi'},
  {key:'van',position:[36,0,52],rotationY:0,targetLength:5.0,name:'cc0-delivery-van'},
  {key:'commercialA',position:[63,0,42],rotationY:-Math.PI/2,targetHeight:13,name:'cc0-commercial-a'},
  {key:'commercialB',position:[63,0,16],rotationY:-Math.PI/2,targetHeight:12,name:'cc0-commercial-b'},
  {key:'suburbanA',position:[-66,0,20],rotationY:Math.PI/2,targetHeight:8.5,name:'cc0-suburban-a'},
  {key:'trafficLight',position:[8,0,8],rotationY:0,targetHeight:4.5,name:'cc0-traffic-light-ne'},
  {key:'trafficLight',position:[-8,0,-8],rotationY:Math.PI,targetHeight:4.5,name:'cc0-traffic-light-sw'},
  {key:'dumpster',position:[57,0,30],rotationY:Math.PI/2,targetLength:2.3,name:'cc0-dumpster'},
  {key:'bench',position:[-45,0,58],rotationY:0,targetLength:1.8,name:'cc0-circle-park-bench'},
  {key:'trashcan',position:[-42,0,57],rotationY:0,targetHeight:1.0,name:'cc0-circle-park-trash'},
  {key:'treeOak',position:[-38,0,62],targetHeight:5.2,name:'cc0-oak-1'},
  {key:'treeOak',position:[-28,0,63],targetHeight:5.5,name:'cc0-oak-2'},
  {key:'treeDetailed',position:[-18,0,60],targetHeight:5.8,name:'cc0-tree-detailed-1'},
  {key:'bush',position:[-43,0,61],targetHeight:1.0,name:'cc0-bush-1'},
  {key:'bush',position:[-34,0,61],targetHeight:1.0,name:'cc0-bush-2'},
]

export type TryammCc0FreeAssetLayer={
  group:THREE.Group
  loaded:number
  failed:number
  dispose:()=>void
}

export async function createTryammCc0FreeAssetLayer(scene:THREE.Scene):Promise<TryammCc0FreeAssetLayer>{
  const group=new THREE.Group()
  group.name='tryamm-cc0-free-asset-layer'
  group.userData={
    source:'github-cc0',
    upstream:'Kenney',
    sourceMirror:'Hidencod/tge-assets',
    license:'CC0-1.0',
    creditsUsed:0,
    visualOnly:true,
  }
  scene.add(group)
  let loaded=0,failed=0,cancelled=false
  const objects:THREE.Object3D[]=[]

  await Promise.all(PLACEMENTS.map(async placement=>{
    const asset=TRYAMM_CC0_FREE_ASSETS[placement.key]
    try{
      const gltf=await loader.loadAsync(asset.url)
      if(cancelled){disposeObject(gltf.scene);return}
      const object=gltf.scene
      object.name=placement.name||`cc0-${asset.id}`
      object.position.set(...placement.position)
      object.rotation.y=placement.rotationY||0
      fitObject(object,placement)
      object.userData={
        ...object.userData,
        tryammCc0Asset:true,
        assetId:asset.id,
        sourcePack:asset.sourcePack,
        license:asset.license,
        visualOnly:true,
        collisionAuthority:false,
      }
      object.traverse(node=>{
        if(node instanceof THREE.Mesh){
          node.castShadow=true
          node.receiveShadow=true
          node.frustumCulled=true
        }
      })
      group.add(object)
      objects.push(object)
      loaded++
    }catch{
      failed++
    }
  }))

  if(typeof window!=='undefined')window.dispatchEvent(new CustomEvent('tryamm:cc0-free-assets-ready',{detail:{
    loaded,
    failed,
    creditsUsed:0,
    upstream:'Kenney',
    source:'github-pinned-glb',
    visualOnly:true,
  }}))

  const dispose=()=>{
    cancelled=true
    objects.forEach(disposeObject)
    group.removeFromParent()
  }
  return {group,loaded,failed,dispose}
}
