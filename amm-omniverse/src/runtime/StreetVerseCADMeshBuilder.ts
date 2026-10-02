import type {CADBuildPlan,CADPrimitive} from './StreetVerseCADHoloBuildPipeline'

export type CADMeshBuildResult={
  group:import('three').Group
  meshCount:number
  triangleEstimate:number
  textured:boolean
  proposalGeometry:boolean
  warnings:string[]
}

function dimsFor(primitive:CADPrimitive){
  if(primitive.dimensionsM)return primitive.dimensionsM
  if(primitive.kind==='foundation')return{x:18,y:.4,z:14}
  if(primitive.kind==='floor-slab')return{x:18,y:.25,z:14}
  if(primitive.kind==='wall')return{x:18,y:Number(primitive.metadata?.heightM||3.4),z:14}
  if(primitive.kind==='roof')return{x:18,y:.35,z:14}
  if(primitive.kind==='elevator-shaft')return{x:2.4,y:10.2,z:2.4}
  if(primitive.kind==='plumbing-run'||primitive.kind==='drain-run'||primitive.kind==='electrical-run'||primitive.kind==='hvac-run')return{x:.12,y:.12,z:5}
  return{x:1,y:1,z:1}
}

export async function buildCADPreviewMesh(plan:CADBuildPlan):Promise<CADMeshBuildResult>{
  const THREE=await import('three')
  const root=new THREE.Group()
  root.name=`CAD_HOLOBUILD_${plan.request.id}`
  root.userData={
    schema:plan.schema,
    planId:plan.id,
    proposalGeometry:true,
    productionMutation:false,
    exactReconstruction:false,
    sourcePolicy:plan.sourcePolicy,
  }

  const warnings=[...plan.warnings]
  let meshCount=0
  let triangleEstimate=0
  let textured=false

  const materialBase=new THREE.MeshStandardMaterial({roughness:.72,metalness:.08})
  const materialGlass=new THREE.MeshPhysicalMaterial({transparent:true,opacity:.34,roughness:.18,metalness:.04,depthWrite:false})
  const materialUtility=new THREE.MeshStandardMaterial({roughness:.55,metalness:.18})

  const wrap=plan.request.facadeWraps?.find(item=>
    item.authorized&&item.persistentTextureAllowed&&item.provenance!=='reference-only'
  )
  let facadeMaterial=materialBase
  if(wrap?.uri){
    try{
      const texture=await new THREE.TextureLoader().loadAsync(wrap.uri)
      texture.colorSpace=THREE.SRGBColorSpace
      texture.wrapS=THREE.RepeatWrapping
      texture.wrapT=THREE.RepeatWrapping
      facadeMaterial=new THREE.MeshStandardMaterial({map:texture,roughness:.7,metalness:.05})
      textured=true
    }catch{
      warnings.push(`Authorized facade texture could not be loaded: ${wrap.sourceId}`)
    }
  }

  const addMesh=(geometry:import('three').BufferGeometry,material:import('three').Material,primitive:CADPrimitive,name:string)=>{
    const mesh=new THREE.Mesh(geometry,material)
    const p=primitive.positionM||{x:0,y:0,z:0}
    const r=primitive.rotationDeg||{x:0,y:0,z:0}
    mesh.position.set(p.x,p.y,p.z)
    mesh.rotation.set(THREE.MathUtils.degToRad(r.x),THREE.MathUtils.degToRad(r.y),THREE.MathUtils.degToRad(r.z))
    mesh.name=name
    mesh.userData={cadId:primitive.id,cadKind:primitive.kind,levelId:primitive.levelId,roomId:primitive.roomId,...primitive.metadata}
    root.add(mesh)
    meshCount++
    triangleEstimate+=Math.floor((geometry.index?.count||geometry.getAttribute('position')?.count||0)/3)
    return mesh
  }

  for(const primitive of plan.cad){
    const d=dimsFor(primitive)
    if(primitive.kind==='foundation'||primitive.kind==='floor-slab'||primitive.kind==='roof'){
      addMesh(new THREE.BoxGeometry(d.x,d.y,d.z),facadeMaterial.clone(),primitive,primitive.kind)
      continue
    }
    if(primitive.kind==='wall'){
      const y=Number(primitive.positionM?.y??d.y/2)
      const thickness=.25
      const wallGroup=new THREE.Group()
      wallGroup.name=`wall-shell-${primitive.id}`
      const wallParts=[
        {x:0,y,z:d.z/2,w:d.x,h:d.y,depth:thickness},
        {x:0,y,z:-d.z/2,w:d.x,h:d.y,depth:thickness},
        {x:d.x/2,y,z:0,w:thickness,h:d.y,depth:d.z},
        {x:-d.x/2,y,z:0,w:thickness,h:d.y,depth:d.z},
      ]
      for(const part of wallParts){
        const geometry=new THREE.BoxGeometry(part.w,part.h,part.depth)
        const mesh=new THREE.Mesh(geometry,facadeMaterial.clone())
        mesh.position.set(part.x,part.y,part.z)
        mesh.userData={cadId:primitive.id,cadKind:'wall',proposalGeometry:true}
        wallGroup.add(mesh);meshCount++;triangleEstimate+=12
      }
      root.add(wallGroup)
      continue
    }
    if(primitive.kind==='stair'){
      const stair=new THREE.Group()
      stair.name=`stair-${primitive.id}`
      const steps=12
      for(let i=0;i<steps;i++){
        const stepMesh=new THREE.Mesh(new THREE.BoxGeometry(1.8,.18,.34),materialBase.clone())
        stepMesh.position.set(0,.09+i*.22,i*.3)
        stepMesh.userData={cadId:primitive.id,cadKind:'stair',step:i}
        stair.add(stepMesh);meshCount++;triangleEstimate+=12
      }
      root.add(stair)
      continue
    }
    if(primitive.kind==='elevator-shaft'){
      const shaft=addMesh(new THREE.BoxGeometry(d.x,d.y,d.z),materialGlass.clone(),primitive,`elevator-${primitive.id}`)
      shaft.userData.interactiveRig='elevator'
      continue
    }
    if(primitive.kind==='door-opening'||primitive.kind==='window-opening'){
      const isDoor=primitive.kind==='door-opening'
      const geometry=new THREE.BoxGeometry(isDoor?1.05:1.35,isDoor?2.15:1.2,.12)
      const mesh=addMesh(geometry,isDoor?materialBase.clone():materialGlass.clone(),primitive,primitive.kind)
      mesh.userData.interactiveRig=isDoor?'door':'window'
      continue
    }
    if(['plumbing-run','drain-run','electrical-run','hvac-run'].includes(primitive.kind)){
      const geometry=new THREE.CylinderGeometry(d.x/2,d.x/2,d.z,8)
      const mesh=addMesh(geometry,materialUtility.clone(),primitive,primitive.kind)
      mesh.rotation.x=Math.PI/2
      mesh.userData.nonStructuralUtilitySimulation=true
      continue
    }
    if(primitive.kind==='collision'||primitive.kind==='navmesh-zone'){
      const marker=new THREE.Object3D()
      marker.name=primitive.kind
      marker.userData={cadId:primitive.id,cadKind:primitive.kind,nonRendered:true,...primitive.metadata}
      root.add(marker)
    }
  }

  root.traverse(object=>{
    if(object instanceof THREE.Mesh){
      object.castShadow=true
      object.receiveShadow=true
    }
  })

  return{group:root,meshCount,triangleEstimate,textured,proposalGeometry:true,warnings}
}

export function disposeCADPreviewMesh(result:CADMeshBuildResult){
  result.group.traverse(object=>{
    const mesh=object as import('three').Mesh
    if(!mesh.isMesh)return
    mesh.geometry?.dispose?.()
    const materials=Array.isArray(mesh.material)?mesh.material:[mesh.material]
    for(const material of materials){
      const map=(material as import('three').MeshStandardMaterial).map
      map?.dispose?.()
      material?.dispose?.()
    }
  })
}
