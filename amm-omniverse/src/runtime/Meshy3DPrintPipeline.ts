import * as THREE from 'three'

export type MeshyPrintFormat='stl-binary'|'obj'|'glb'
export type MeshyPrintProfile='figurine'|'prototype'|'prop'|'architecture'|'mechanical-reference'

export interface MeshyPrintableAnalysis{
  meshCount:number
  skinnedMeshCount:number
  vertexCount:number
  triangleCount:number
  width:number
  height:number
  depth:number
  finiteBounds:boolean
  nonEmpty:boolean
  warnings:string[]
}

export interface MeshyPrintPrepManifest{
  schema:'tryamm.meshy.print-prep.v1'
  sourceAssetId:string
  sourceUrl:string
  sourceFormat:'glb'
  outputFormat:MeshyPrintFormat
  profile:MeshyPrintProfile
  targetHeightMm:number
  orientation:'z-up'
  analysis:MeshyPrintableAnalysis
  rightsAcknowledged:boolean
  commercialUseRequiresRightsReview:true
  slicerRequired:true
  machineProfileRequired:true
  emitsMachineCommands:false
  createdAt:string
}

export const MESHY_3D_PRINT_PIPELINE={
  name:'TRYAMM Meshy 3D Print Prep',
  source:'published Meshy GLB',
  outputs:['binary STL','OBJ','print-prep manifest'] as const,
  units:'export target uses millimeters',
  orientation:'Y-up GLB is converted to Z-up print orientation',
  preservesSourceGlb:true,
  doesNotGenerateGcode:true,
  doesNotSendActuatorCommands:true,
  slicerRequired:true,
  machineProfileRequired:true,
  rightsReviewRequiredForCommercialProduction:true,
  topologyNote:'Basic scene validation is performed in-browser. Watertight/manifold certification still belongs in a mesh-repair/slicer/engineering tool before physical production.',
} as const

export function analyzeMeshyPrintableScene(root:THREE.Object3D):MeshyPrintableAnalysis{
  let meshCount=0,skinnedMeshCount=0,vertexCount=0,triangleCount=0
  root.updateMatrixWorld(true)
  root.traverse(node=>{
    if(!(node instanceof THREE.Mesh))return
    meshCount++
    if(node instanceof THREE.SkinnedMesh)skinnedMeshCount++
    const geometry=node.geometry
    const position=geometry?.getAttribute?.('position')
    if(position)vertexCount+=position.count
    if(geometry?.index)triangleCount+=Math.floor(geometry.index.count/3)
    else if(position)triangleCount+=Math.floor(position.count/3)
  })
  const box=new THREE.Box3().setFromObject(root)
  const size=new THREE.Vector3()
  if(!box.isEmpty())box.getSize(size)
  const finiteBounds=[size.x,size.y,size.z].every(Number.isFinite)
  const nonEmpty=meshCount>0&&triangleCount>0&&finiteBounds&&Math.max(size.x,size.y,size.z)>0
  const warnings:string[]=[]
  if(!meshCount)warnings.push('no-meshes')
  if(!triangleCount)warnings.push('no-triangles')
  if(skinnedMeshCount)warnings.push('skinned-mesh-will-export-current-pose')
  if(!finiteBounds)warnings.push('non-finite-bounds')
  if(nonEmpty&&Math.min(size.x,size.y,size.z)<=1e-5)warnings.push('near-zero-axis-thickness')
  if(triangleCount>1_500_000)warnings.push('very-high-triangle-count')
  return{meshCount,skinnedMeshCount,vertexCount,triangleCount,width:size.x,height:size.y,depth:size.z,finiteBounds,nonEmpty,warnings}
}

export function cloneForPrint(root:THREE.Object3D,targetHeightMm:number){
  const heightMm=Math.max(5,Math.min(2000,Number(targetHeightMm)||120))
  const clone=root.clone(true)
  clone.updateMatrixWorld(true)
  const before=new THREE.Box3().setFromObject(clone)
  const size=new THREE.Vector3();before.getSize(size)
  if(!Number.isFinite(size.y)||size.y<=0)throw new Error('printable-height-invalid')
  const scale=heightMm/size.y
  clone.scale.multiplyScalar(scale)
  // Three/Meshy scenes are Y-up. Most print tooling expects Z-up.
  clone.rotation.x+=Math.PI/2
  clone.updateMatrixWorld(true)
  const box=new THREE.Box3().setFromObject(clone)
  if(box.isEmpty())throw new Error('printable-bounds-empty')
  clone.position.z-=box.min.z
  clone.updateMatrixWorld(true)
  return{object:clone,targetHeightMm:heightMm,scale}
}

export function canPrepareMeshyPrint(input:{analysis:MeshyPrintableAnalysis;rightsAcknowledged:boolean}){
  const reasons:string[]=[]
  if(!input.analysis.nonEmpty)reasons.push('invalid-or-empty-geometry')
  if(!input.rightsAcknowledged)reasons.push('rights-not-acknowledged')
  return{allowed:reasons.length===0,reasons}
}

export function makeMeshyPrintManifest(input:{
  sourceAssetId:string
  sourceUrl:string
  outputFormat:MeshyPrintFormat
  profile:MeshyPrintProfile
  targetHeightMm:number
  analysis:MeshyPrintableAnalysis
  rightsAcknowledged:boolean
}):MeshyPrintPrepManifest{
  return{
    schema:'tryamm.meshy.print-prep.v1',
    sourceAssetId:input.sourceAssetId,
    sourceUrl:input.sourceUrl,
    sourceFormat:'glb',
    outputFormat:input.outputFormat,
    profile:input.profile,
    targetHeightMm:Math.max(5,Math.min(2000,Number(input.targetHeightMm)||120)),
    orientation:'z-up',
    analysis:input.analysis,
    rightsAcknowledged:Boolean(input.rightsAcknowledged),
    commercialUseRequiresRightsReview:true,
    slicerRequired:true,
    machineProfileRequired:true,
    emitsMachineCommands:false,
    createdAt:new Date().toISOString(),
  }
}

export async function loadMeshyPrintableGlb(url:string){
  if(!url)throw new Error('meshy-print-source-required')
  const {GLTFLoader}=await import('three/examples/jsm/loaders/GLTFLoader.js')
  const loader=new GLTFLoader()
  const gltf=await loader.loadAsync(url)
  return gltf.scene
}

export async function exportMeshyPrintFile(root:THREE.Object3D,format:'stl-binary'|'obj',targetHeightMm:number){
  const {object}=cloneForPrint(root,targetHeightMm)
  try{
    if(format==='stl-binary'){
      const {STLExporter}=await import('three/examples/jsm/exporters/STLExporter.js')
      const exporter=new STLExporter()
      const data=exporter.parse(object,{binary:true})
      const bytes=data instanceof DataView?data.buffer:data
      return new Blob([bytes],{type:'model/stl'})
    }
    const {OBJExporter}=await import('three/examples/jsm/exporters/OBJExporter.js')
    const exporter=new OBJExporter()
    return new Blob([exporter.parse(object)],{type:'text/plain'})
  }finally{
    object.traverse(node=>{
      if(!(node instanceof THREE.Mesh))return
      node.geometry?.dispose?.()
      const materials=Array.isArray(node.material)?node.material:[node.material]
      materials.forEach(material=>material?.dispose?.())
    })
  }
}
