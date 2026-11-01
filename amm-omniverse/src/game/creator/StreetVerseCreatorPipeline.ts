export type CreatorAssetKind='character-reference'|'motion-video'|'motion-glb'|'outfit-fbx'|'outfit-glb';
export type CreatorAsset={id:string;kind:CreatorAssetKind;name:string;license:'owned'|'commercial-permission'|'unknown';status:'pending'|'approved'|'rejected';sourceUrl?:string;characterId?:string};
export type PipelineCheck={ok:boolean;reasons:string[];nextAction:string};
export function validateCreatorAsset(asset:CreatorAsset):PipelineCheck{
 const reasons:string[]=[];
 if(!/^[a-z0-9][a-z0-9_-]{1,63}$/i.test(asset.id))reasons.push('Invalid asset identifier');
 if(asset.name.length<1||asset.name.length>120)reasons.push('Invalid asset name');
 if(asset.license==='unknown')reasons.push('Commercial rights not confirmed');
 if(asset.status!=='approved')reasons.push('Asset not approved for use');
 if(asset.sourceUrl){try{const u=new URL(asset.sourceUrl);if(u.protocol!=='https:')reasons.push('Source must use HTTPS')}catch{reasons.push('Invalid source URL')}}
 return {ok:reasons.length===0,reasons,nextAction:asset.kind==='motion-video'?'Retarget externally, inspect skeleton, export GLB':asset.kind==='outfit-fbx'?'Fit and skin, convert FBX to GLB, validate animation':'Inspect GLB rig, morphs and rights'};
}
export type CreatorJob={id:string;asset:CreatorAsset;stage:'intake'|'rights-review'|'rig-inspection'|'retarget'|'preview'|'ready'|'blocked';notes:string[]};
export function planCreatorJob(asset:CreatorAsset):CreatorJob{const v=validateCreatorAsset(asset);return {id:'job-'+asset.id,asset,stage:v.ok?'rig-inspection':'blocked',notes:v.ok?[v.nextAction]:v.reasons}}
export function recommendProvider(kind:CreatorAssetKind):'metatailor'|'anymove'|'character-consistency'|'internal'{if(kind==='outfit-fbx'||kind==='outfit-glb')return 'metatailor';if(kind==='motion-video')return 'anymove';if(kind==='character-reference')return 'character-consistency';return 'internal'}
export type SalesLead={id:string;business:string;service:string;consentToContact:boolean;status:'new'|'qualified'|'contacted'|'closed'|'declined'};
export function draftLeadOutreach(lead:SalesLead):string|null{if(!lead.consentToContact||lead.status==='declined')return null;return `Hello, I'm reaching out from TRYAMM LLC about ${lead.service}. Would you be interested in a brief overview of our website and digital business services? There is no obligation. Reply STOP if you prefer no further contact.`}
// Planning only. Never send messages, process uploads, or run third-party models without authorization.
