import type {DiscoveryCandidate,OracleDecision} from './StreetVersePerformanceOracle'

export type ClipEditRecipe={
 trimSilence:boolean;normalizeRootMotion:boolean;loopSeam:boolean;footLock:boolean
 retargetSkeleton:string;lods:Array<'full'|'mobile'|'crowd'>;compress:boolean
 generatePreview:boolean;preserveSourceAttribution:boolean
}

export function createClipEditJob(candidate:DiscoveryCandidate,decision:OracleDecision,retargetSkeleton='tryamm-humanoid-v1'){
 if(decision.decision!=='approve-processing')return {status:'blocked' as const,candidateId:candidate.id,decision}
 const recipe:ClipEditRecipe={
  trimSilence:true,normalizeRootMotion:true,loopSeam:true,footLock:true,retargetSkeleton,
  lods:['full','mobile','crowd'],compress:true,generatePreview:true,preserveSourceAttribution:true
 }
 return {status:'queued' as const,candidateId:candidate.id,sourceUrl:candidate.sourceUrl,recipe,
  outputs:['animation.glb','animation.mobile.glb','animation.crowd.glb','preview.mp4','manifest.json']}
}

export function canPublishEditedClip(candidate:DiscoveryCandidate,decision:OracleDecision){
 return decision.decision==='approve-processing'&&candidate.downloadAllowed&&candidate.commercialUse&&candidate.rights!=='blocked'&&candidate.rights!=='permission-required'
}
