export type AssetKind='character'|'animal'|'vehicle'|'building'|'prop'|'environment'
export type AssetStage='prompt-spec'|'generate'|'mesh-repair'|'retopology'|'uv-texture'|'rig'|'animate'|'lod'|'compress'|'rights'|'certify'

export interface AssetFactoryJob{
 id:string;kind:AssetKind;source:'owned'|'licensed'|'partner-api';stages:AssetStage[];
 target:'mobile'|'web'|'cinematic';maxTriangles:number;maxTextureSize:number;
 requiresRig:boolean;requiresAnimation:boolean;rightsEvidenceRequired:boolean
}

export const ASSET_FACTORY_STAGES:AssetStage[]=[
 'prompt-spec','generate','mesh-repair','retopology','uv-texture','rig','animate','lod','compress','rights','certify',
]

export const TRYAMM_ASSET_FACTORY={
 name:'TRYAMM Asset Forge',
 ownershipGoal:'Own the orchestration, asset specifications, training/evaluation data we are entitled to use, QA, optimization, provenance, runtime format and World Compiler integration.',
 providerStrategy:'Provider-neutral adapters. External generators can accelerate production without becoming a permanent dependency.',
 capabilities:[
  'text/image/reference-to-3D adapter layer','mesh validation and repair','automatic retopology targets',
  'PBR material validation','humanoid/quadruped/custom rig adapters','animation retargeting',
  'LOD generation','mobile compression','collision generation','asset provenance and rights ledger',
  'duplicate/style consistency checks','city/verse style packs','World Compiler publishing',
 ] as const,
 hardRules:[
  'Do not train on or persist third-party assets without applicable rights.',
  'Do not claim an externally generated model as proprietary underlying model technology.',
  'Keep provider-specific code behind replaceable adapters.',
  'Every production asset requires provenance and rights evidence.',
  'Certification fails closed when geometry, rig, performance or rights checks fail.',
 ] as const,
}

export function createAssetFactoryJob(id:string,kind:AssetKind,target:AssetFactoryJob['target']='mobile'):AssetFactoryJob{
 const rigged=kind==='character'||kind==='animal'
 return{id,kind,source:'owned',stages:ASSET_FACTORY_STAGES,target,
  maxTriangles:target==='mobile'?60000:target==='web'?120000:500000,
  maxTextureSize:target==='mobile'?2048:4096,requiresRig:rigged,requiresAnimation:rigged,rightsEvidenceRequired:true}
}

export function certifyAsset(job:AssetFactoryJob,evidence:Partial<Record<AssetStage,string>>){
 const required=job.stages.filter(s=>!(s==='rig'||s==='animate')||job.requiresRig)
 const missing=required.filter(stage=>!evidence[stage])
 return{assetId:job.id,required,missing,certified:missing.length===0}
}
