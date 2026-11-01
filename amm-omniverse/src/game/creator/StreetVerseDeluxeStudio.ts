import {validateCreatorAsset,type CreatorAsset} from './StreetVerseCreatorPipeline';
export type DeluxeTier='starter'|'pro'|'deluxe';
export type DeluxeFeature='character-identity'|'rig-inspection'|'animation-retarget'|'wardrobe-fitting'|'facial-performance'|'voice-dialogue'|'story-capture'|'commerce-link';
export const DELUXE_FEATURES:Record<DeluxeTier,readonly DeluxeFeature[]>={
 starter:['character-identity','rig-inspection'],
 pro:['character-identity','rig-inspection','animation-retarget','facial-performance','voice-dialogue'],
 deluxe:['character-identity','rig-inspection','animation-retarget','wardrobe-fitting','facial-performance','voice-dialogue','story-capture','commerce-link']
};
export type SkeletonAudit={bones:string[];morphTargets:string[];animations:string[];meshCount:number;skinnedMeshCount:number};
export type DeluxeReadiness={eligible:boolean;warnings:string[];capabilities:{bodyAnimation:boolean;facialExpressions:boolean;lipSyncReady:boolean;outfitRiggingReady:boolean}};
const facialNames=/smile|happy|blink|jaw|mouth|viseme|frown|angry|sad/i;
export function auditAvatar(a:SkeletonAudit):DeluxeReadiness{
 const bones=new Set(a.bones.map(x=>x.toLowerCase()));
 const hasRoot=Array.from(bones).some(x=>/hip|pelvis|root/.test(x));
 const hasHead=Array.from(bones).some(x=>/head/.test(x));
 const hasMouth=a.morphTargets.some(x=>/mouth|viseme|jaw/i.test(x));
 const hasFace=a.morphTargets.some(x=>facialNames.test(x));
 const warnings:string[]=[];
 if(!a.skinnedMeshCount)warnings.push('No skinned mesh detected: retargeting needs a rig');
 if(!hasRoot||!hasHead)warnings.push('Missing recognized hip/root or head bones: inspect naming and hierarchy');
 if(!a.animations.length)warnings.push('No embedded animations: external clips required');
 if(!hasFace)warnings.push('No recognized facial morphs: use bone/caption fallback');
 if(!hasMouth)warnings.push('No recognized lip-sync morphs: speech captions only until rigged');
 return {eligible:a.skinnedMeshCount>0&&hasRoot&&hasHead,warnings,capabilities:{bodyAnimation:a.skinnedMeshCount>0&&hasRoot,facialExpressions:hasFace,lipSyncReady:hasMouth,outfitRiggingReady:a.skinnedMeshCount>0&&hasRoot}};
}
export type DeluxeJob={id:string;asset:CreatorAsset;tier:DeluxeTier;features:readonly DeluxeFeature[];status:'blocked'|'awaiting-rig-audit'};
export function createDeluxeJob(asset:CreatorAsset,tier:DeluxeTier):DeluxeJob{
 const valid=validateCreatorAsset(asset);
 return {id:'deluxe-'+asset.id,asset,tier,features:DELUXE_FEATURES[tier],status:valid.ok?'awaiting-rig-audit':'blocked'};
}
// Independently implemented orchestration; does not copy proprietary MTA internals,
// claim automated video-to-motion inference, or run a paid AI model.
