import type {AssetFactoryJob,AssetStage} from './TryammAssetForge'

export type AssetEvidence={stage:AssetStage;uri:string;sha256?:string;createdAt:string;tool:string;license?:string}
export type AssetCertification='draft'|'processing'|'review'|'certified'|'rejected'

export interface AssetPassport{
 assetId:string;version:number;job:AssetFactoryJob;status:AssetCertification;evidence:AssetEvidence[];
 sourcePromptHash?:string;parentAssetIds:string[];approvedBy?:string;certifiedAt?:string;
}

export const ASSET_QUALITY_GATES={
 geometry:['valid-mesh','no-nan-vertices','bounded-scale','collision-ready'],
 rig:['bone-map-valid','weights-normalized','retarget-compatible'],
 visual:['pbr-valid','texture-budget','no-missing-materials'],
 runtime:['triangle-budget','texture-budget','lod-present','mobile-load-test'],
 rights:['source-recorded','license-recorded','real-person-consent-if-applicable'],
 safety:['no-sensitive-location-detail','no-unapproved-real-resident-clone'],
} as const

export function createAssetPassport(job:AssetFactoryJob):AssetPassport{
 return{assetId:job.id,version:1,job,status:'draft',evidence:[],parentAssetIds:[]}
}

export function addAssetEvidence(passport:AssetPassport,evidence:AssetEvidence):AssetPassport{
 return{...passport,version:passport.version+1,status:'processing',evidence:[...passport.evidence,evidence]}
}

export function evaluateAssetPassport(passport:AssetPassport){
 const required=passport.job.stages.filter(s=>!(s==='rig'||s==='animate')||passport.job.requiresRig)
 const evidenced=new Set(passport.evidence.map(e=>e.stage))
 const missing=required.filter(s=>!evidenced.has(s))
 const rightsOk=!passport.job.rightsEvidenceRequired||passport.evidence.some(e=>e.stage==='rights'&&Boolean(e.license))
 return{assetId:passport.assetId,missing,rightsOk,certifiable:missing.length===0&&rightsOk}
}

export const ASSET_VERSION_POLICY={
 immutableCertifiedArtifacts:true,
 newGenerationCreatesNewVersion:true,
 retainProvenanceChain:true,
 rollbackSupported:true,
 publishOnlyCertified:true,
} as const
