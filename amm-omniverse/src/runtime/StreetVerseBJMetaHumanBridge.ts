import * as THREE from 'three'

/**
 * MetaHuman Creator is an offline authoring stage, NOT a browser runtime.
 * FBX, native Unreal SkeletalMeshes, DNA and strand grooms must be converted,
 * baked/retargeted and validated into a web-safe GLB before being used here.
 *
 * The real BJ reference photographs stay PRIVATE and are never imported
 * from /public or an unauthenticated storefront.
 */
export const BJ_METAHUMAN_WEB_ASSET={
  characterId:'bj-stubbs',
  optimizedUrl:'/tryamm-assets/metahuman/bj-stubbs/BJ_STUBBS_METAHUMAN_WEB_OPTIMIZED.glb',
  previewAttribute:'data-streetverse-bj-meta-human',
  source:'Epic MetaHuman Creator + manually validated DCC GLB export',
  referencePhotosPublic:false,
  likenessApproved:false,
  readyForProduction:false,
} as const

/**
 * The new model is opt-in in a local/staging page.
 * An absent GLB or flag can never take down the live Chicago character.
 */
export function getPreviewBJMetaHumanUrl():string|null{
  if(typeof document==='undefined')return null
  return document.documentElement.dataset.streetverseBjMetaHuman==='preview'
    ?BJ_METAHUMAN_WEB_ASSET.optimizedUrl
    :null
}

export type BJMetaHumanModelAudit={
  ok:boolean
  renderableMeshes:number
  skinnedMeshes:number
  totalTriangles:number
  animationNames:string[]
  facialMorphNames:string[]
  issues:string[]
}

/**
 * Conservative compatibility check, not visual/likeness certification.
 * Never claim that a GLB is a genuine MetaHuman solely from filenames.
 */
export function auditBJMetaHumanForStreetVerse(
  root:THREE.Object3D,
  clips:readonly THREE.AnimationClip[],
):BJMetaHumanModelAudit{
  let renderableMeshes=0,skinnedMeshes=0,totalTriangles=0
  const morphs=new Set<string>()
  root.traverseVisible(node=>{
    if(!(node instanceof THREE.Mesh))return
    const p=node.geometry?.getAttribute('position')
    if(!p||p.count<3||p.itemSize<3)return
    renderableMeshes++
    const indices=node.geometry.index?.count??p.count
    totalTriangles+=Math.floor(indices/3)
    if(node instanceof THREE.SkinnedMesh&&node.skeleton?.bones.length)skinnedMeshes++
    for(const name of Object.keys(node.morphTargetDictionary||{}))morphs.add(name)
  })
  const animationNames=clips.map(c=>c.name)
  const facialMorphNames=[...morphs]
  const issues:string[]=[]
  if(renderableMeshes===0||totalTriangles===0)issues.push('No renderable triangles')
  if(skinnedMeshes===0)issues.push('No deforming skinned body/face')
  if(!clips.some(c=>/idle|stand|breath/i.test(c.name)))issues.push('Missing idle animation')
  if(!clips.some(c=>/walk|locomotion/i.test(c.name)))issues.push('Missing walking animation')
  if(!facialMorphNames.some(n=>/blink|eyeBlink/i.test(n)))issues.push('Missing eye-blink morph targets')
  if(!facialMorphNames.some(n=>/jawOpen|mouthOpen|viseme/i.test(n)))issues.push('Missing mouth-opening morph targets')
  return {
    ok:issues.length===0,
    renderableMeshes,skinnedMeshes,totalTriangles,
    animationNames,facialMorphNames,issues,
  }
}
