import {TRYAMM_NATIVE_RUNTIME_ASSETS,type TryammNativeRuntimeAssetKey} from './TryammNativeRuntimeAssetCatalog'

export type AssetRuntimeCertification={
  asset:TryammNativeRuntimeAssetKey
  state:'PREVIEW'|'CERTIFIED'
  visualReview:boolean
  assetPassport:boolean
  runtimePerformance:boolean
  collisionPromoted:boolean
  evidenceRefs:string[]
}

const certifications=new Map<TryammNativeRuntimeAssetKey,AssetRuntimeCertification>()

export function getNativeAssetCertification(asset:TryammNativeRuntimeAssetKey):AssetRuntimeCertification{
  return certifications.get(asset)??{
    asset,
    state:TRYAMM_NATIVE_RUNTIME_ASSETS[asset].state,
    visualReview:false,
    assetPassport:false,
    runtimePerformance:false,
    collisionPromoted:false,
    evidenceRefs:[],
  }
}

export function evaluateNativeAssetPromotion(input:AssetRuntimeCertification){
  const asset=TRYAMM_NATIVE_RUNTIME_ASSETS[input.asset]
  const blockers:string[]=[]
  if(!input.visualReview)blockers.push('human-visual-review')
  if(!input.assetPassport)blockers.push('asset-passport')
  if(!input.runtimePerformance)blockers.push('runtime-performance')
  if(!input.evidenceRefs.length)blockers.push('evidence-refs')
  if(asset.collisionAuthority==='visual-only'&&!input.collisionPromoted)blockers.push('collision-promotion-review')
  return{
    asset:input.asset,
    allowed:blockers.length===0,
    blockers,
    targetState:blockers.length?'PREVIEW':'CERTIFIED',
  } as const
}

export function recordNativeAssetCertification(input:AssetRuntimeCertification){
  const decision=evaluateNativeAssetPromotion(input)
  if(!decision.allowed)throw new Error(`native-asset-certification-blocked:${decision.blockers.join(',')}`)
  certifications.set(input.asset,{...input,state:'CERTIFIED'})
  return certifications.get(input.asset)!
}

export const NATIVE_ASSET_CERTIFICATION_POLICY={
  previewIsPlayable:true,
  previewIsVisualOnly:true,
  certificationRequires:['human-visual-review','asset-passport','runtime-performance','evidence-refs','collision-promotion-review'] as const,
  noAutomaticPromotionFromGeneration:true,
} as const
