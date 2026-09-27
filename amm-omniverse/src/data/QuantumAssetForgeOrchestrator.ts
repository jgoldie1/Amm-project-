import {createAssetFactoryJob,type AssetFactoryJob,type AssetKind} from './TryammAssetForge'
import {GLOBAL_WORLD_COMPILER} from './GlobalWorldCompiler'

export type AssetDemand={cityId:string;kind:AssetKind;quantity:number;stylePack:string;priority:number}

export const FIRST_WAVE_ASSET_DEMAND:AssetDemand[]=GLOBAL_WORLD_COMPILER.firstGlobalWave.flatMap(cityId=>[
 {cityId,kind:'character',quantity:24,stylePack:`${cityId}-people`,priority:100},
 {cityId,kind:'building',quantity:16,stylePack:`${cityId}-architecture`,priority:90},
 {cityId,kind:'vehicle',quantity:10,stylePack:`${cityId}-mobility`,priority:80},
 {cityId,kind:'prop',quantity:20,stylePack:`${cityId}-street-props`,priority:70},
 {cityId,kind:'environment',quantity:12,stylePack:`${cityId}-environment`,priority:70},
])

export function createCityAssetQueue(demands:AssetDemand[]=FIRST_WAVE_ASSET_DEMAND){
 return demands.sort((a,b)=>b.priority-a.priority).flatMap(d=>
  Array.from({length:d.quantity},(_,i)=>({
   demand:d,job:createAssetFactoryJob(`${d.cityId}-${d.kind}-${String(i+1).padStart(3,'0')}`,d.kind,'mobile'),
  }))
 )
}

export interface AssetProviderAdapter{
 id:string;capabilities:AssetKind[];generate(job:AssetFactoryJob):Promise<{providerAssetId:string;artifactUrl?:string}>
}

export const ASSET_PROVIDER_POLICY={
 preferredMode:'owned-first-provider-neutral',
 allowExternalAcceleration:true,
 persistProviderSecretsClientSide:false,
 requireLicenseReview:true,
 requireProvenance:true,
 requireHumanApprovalForRealPersonLikeness:true,
 fallbackOrder:['owned-model','licensed-provider','manual-artist'] as const,
}

export const FUTURE_ASSET_FORGE_ROADMAP=[
 'owned procedural buildings and streets',
 'owned character identity and wardrobe consistency',
 'owned rig validation and animation retargeting',
 'owned topology and mobile LOD optimization',
 'owned material and texture QA',
 'owned collision and navigation mesh generation',
 'owned provenance and rights ledger',
 'owned city style packs and cultural review workflow',
 'owned synthetic population generator with no real-resident cloning',
 'owned asset benchmark and quality scoring',
 'optional licensed generator adapters',
 'eventual internally trained generators only on data TRYAMM is entitled to use',
] as const
