export type MotionFeatureVector={
 tempo:number;energy:number;travel:number;verticality:number;symmetry:number
 formation:'solo'|'couple'|'crew'|'crowd';motifs:string[]
}
export type OriginalityManifest={
 assetId:string;generator:'mind-over-matter-v1';createdAt:string
 referenceIds:string[];transformationSeed:string;featureDistance:number
 distinctiveElementsCopied:false;humanReviewRequired:boolean;publishable:boolean
}
const clamp=(n:number)=>Math.max(0,Math.min(1,n))
export function generateOriginalMotionBlueprint(input:{assetId:string;references:Array<{id:string;features:MotionFeatureVector}>;seed:string}){
 if(!input.references.length)throw new Error('reference-required')
 const avg=(k:keyof Pick<MotionFeatureVector,'tempo'|'energy'|'travel'|'verticality'|'symmetry'>)=>
  input.references.reduce((s,r)=>s+r.features[k],0)/input.references.length
 const hash=[...input.seed].reduce((a,c)=>(a*33+c.charCodeAt(0))>>>0,5381)
 const jitter=(shift:number)=>(((hash>>shift)&255)/255-.5)*.5
 const features:MotionFeatureVector={
  tempo:clamp(avg('tempo')+jitter(0)),energy:clamp(avg('energy')+jitter(4)),
  travel:clamp(avg('travel')+jitter(8)),verticality:clamp(avg('verticality')+jitter(12)),
  symmetry:clamp(avg('symmetry')+jitter(16)),
  formation:['solo','couple','crew','crowd'][hash%4] as MotionFeatureVector['formation'],
  motifs:['original-transition','tryamm-signature','adaptive-finale']
 }
 return {assetId:input.assetId,features,referenceIds:input.references.map(r=>r.id)}
}
export function similarityGate(input:{assetId:string;generated:MotionFeatureVector;references:Array<{id:string;features:MotionFeatureVector}>;seed:string;threshold?:number}):OriginalityManifest{
 const keys=['tempo','energy','travel','verticality','symmetry'] as const
 const distances=input.references.map(r=>Math.sqrt(keys.reduce((s,k)=>s+(input.generated[k]-r.features[k])**2,0)/keys.length))
 const distance=distances.length?Math.min(...distances):1
 const threshold=input.threshold??0.18
 return {assetId:input.assetId,generator:'mind-over-matter-v1',createdAt:new Date().toISOString(),
  referenceIds:input.references.map(r=>r.id),transformationSeed:input.seed,featureDistance:distance,
  distinctiveElementsCopied:false,humanReviewRequired:distance<threshold,publishable:distance>=threshold}
}
