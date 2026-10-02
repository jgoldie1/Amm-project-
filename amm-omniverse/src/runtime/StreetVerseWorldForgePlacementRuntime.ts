import {subscribeStreetVerseScene} from '../game/streetverseSceneRegistry'
import {loadPublishedMeshyManifest} from './StreetVerseMeshyAssetManifest'

export type WorldForgePlacement={
  assetId:string
  label:string
  kind:'building'|'character'|'vehicle'|'prop'|'street-furniture'|'infrastructure'
  districtId:string
  x:number
  y:number
  z:number
  rotationY:number
  scale:number
  collision:boolean
  enabled:boolean
  updatedAt:string
}

const KEY='tryamm.world-forger.placements.v1'
let installed=false
let disposeScene:(()=>void)|null=null
let activeRoot:any=null
let activeBoxes:any[]=[]

function readPlacements():WorldForgePlacement[]{
  try{
    const raw=JSON.parse(localStorage.getItem(KEY)||'[]')
    return Array.isArray(raw)?raw.filter(item=>item?.assetId&&item?.districtId&&item?.enabled!==false):[]
  }catch{return[]}
}

export function saveWorldForgePlacement(input:Omit<WorldForgePlacement,'updatedAt'>){
  const all=readPlacements().filter(item=>item.assetId!==input.assetId)
  const next={...input,updatedAt:new Date().toISOString()}
  localStorage.setItem(KEY,JSON.stringify([...all,next]))
  window.dispatchEvent(new CustomEvent('tryamm:world-forge-placement-saved',{detail:next}))
  return next
}

export function removeWorldForgePlacement(assetId:string){
  const all=readPlacements().filter(item=>item.assetId!==assetId)
  localStorage.setItem(KEY,JSON.stringify(all))
  window.dispatchEvent(new CustomEvent('tryamm:world-forge-placement-removed',{detail:{assetId}}))
}

function selectedDistrict(){
  const params=new URLSearchParams(window.location.search)
  return params.get('forgeDistrict')||localStorage.getItem('tryamm.world-forger.active-district.v1')||'circle-park-abla'
}

async function buildDistrictScene(handle:any,districtId:string){
  const placements=readPlacements().filter(item=>item.districtId===districtId)
  if(!placements.length){
    window.dispatchEvent(new CustomEvent('tryamm:world-forge-placement-state',{detail:{districtId,ready:0,pending:0,placements:0}}))
    return
  }

  const manifest=await loadPublishedMeshyManifest(districtId)
  const assetById=new Map(manifest.map(asset=>[asset.assetId,asset]))
  const THREE=await import('three')
  const {GLTFLoader}=await import('three/examples/jsm/loaders/GLTFLoader.js')
  const loader=new GLTFLoader()
  const root=new THREE.Group()
  root.name=`tryamm-world-forge-${districtId}`
  let ready=0,pending=0,failed=0

  for(const placement of placements){
    const asset=assetById.get(placement.assetId)
    if(!asset?.url){pending++;continue}
    try{
      const gltf=await loader.loadAsync(asset.url)
      const object=gltf.scene
      object.name=`world-forge:${placement.assetId}`
      object.position.set(Number(placement.x)||0,Number(placement.y)||0,Number(placement.z)||0)
      object.rotation.y=Number(placement.rotationY)||0
      const scale=Math.max(.01,Math.min(100,Number(placement.scale)||1))
      object.scale.setScalar(scale)
      object.traverse((node:any)=>{
        if(node?.isMesh){
          node.castShadow=true
          node.receiveShadow=true
          node.userData={...(node.userData||{}),worldForgeAssetId:placement.assetId,worldForgeKind:placement.kind,districtId}
        }
      })
      root.add(object)
      if(placement.collision&&['building','infrastructure','prop','street-furniture'].includes(placement.kind)){
        object.updateMatrixWorld(true)
        const box=new THREE.Box3().setFromObject(object)
        if(!box.isEmpty()){
          handle.collisionBoxes.push(box)
          activeBoxes.push(box)
        }
      }
      ready++
      window.dispatchEvent(new CustomEvent('tryamm:world-forge-asset-placed',{detail:{assetId:placement.assetId,label:placement.label,kind:placement.kind,districtId,x:placement.x,y:placement.y,z:placement.z,scale}}))
    }catch(error){
      failed++
      window.dispatchEvent(new CustomEvent('tryamm:world-forge-placement-error',{detail:{assetId:placement.assetId,districtId,error:error instanceof Error?error.message:String(error)}}))
    }
  }

  if(root.children.length){
    handle.scene.add(root)
    activeRoot=root
  }
  window.dispatchEvent(new CustomEvent('tryamm:world-forge-placement-state',{detail:{districtId,ready,pending,failed,placements:placements.length}}))
}

function clearActive(handle:any){
  if(activeRoot){
    handle?.scene?.remove?.(activeRoot)
    activeRoot.traverse?.((node:any)=>{
      if(node?.isMesh){
        node.geometry?.dispose?.()
        const materials=Array.isArray(node.material)?node.material:[node.material]
        materials.forEach((material:any)=>material?.dispose?.())
      }
    })
    activeRoot=null
  }
  if(handle?.collisionBoxes&&activeBoxes.length){
    handle.collisionBoxes.splice(0,handle.collisionBoxes.length,...handle.collisionBoxes.filter((box:any)=>!activeBoxes.includes(box)))
  }
  activeBoxes=[]
}

export function installStreetVerseWorldForgePlacementRuntime(){
  if(installed||typeof window==='undefined')return()=>{}
  installed=true
  let currentHandle:any=null
  disposeScene=subscribeStreetVerseScene(handle=>{
    if(currentHandle)clearActive(currentHandle)
    currentHandle=handle
    if(!handle)return
    if(!window.location.pathname.startsWith('/streetverse'))return
    const districtId=selectedDistrict()
    try{localStorage.setItem('tryamm.world-forger.active-district.v1',districtId)}catch{}
    void buildDistrictScene(handle,districtId)
  })

  const onRefresh=()=>{
    if(!currentHandle)return
    clearActive(currentHandle)
    void buildDistrictScene(currentHandle,selectedDistrict())
  }
  window.addEventListener('tryamm:world-forge-placement-saved',onRefresh)
  window.addEventListener('tryamm:world-forge-meshy-started',onRefresh)
  window.addEventListener('tryamm:world-forge-refresh',onRefresh)
  window.dispatchEvent(new CustomEvent('tryamm:world-forge-placement-runtime-ready',{detail:{path:'/world-forger',lazyGlb:true,dynamicCollision:true}}))

  return()=>{
    if(currentHandle)clearActive(currentHandle)
    disposeScene?.()
    disposeScene=null
    window.removeEventListener('tryamm:world-forge-placement-saved',onRefresh)
    window.removeEventListener('tryamm:world-forge-meshy-started',onRefresh)
    window.removeEventListener('tryamm:world-forge-refresh',onRefresh)
    installed=false
  }
}
