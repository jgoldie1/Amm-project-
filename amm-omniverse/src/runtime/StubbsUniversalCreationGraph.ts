/**
 * Stubbs Universal Creation Graph (UCG), original and offline.
 * Links an approved creative asset to game, film, commerce, studio, and XR outputs
 * without copying binary assets, processing payments, or publishing to production.
 */
export type CreativeSurface='streetverse'|'omnibox'|'isaiah-tv'|'aniyah-studio'|'marketplace'|'xr'|'training'
export type CreativeKind='scene'|'character'|'motion'|'music'|'product'|'story'|'business'
export type CreativeNode={
 id:string;kind:CreativeKind;revision:number;ownerWorkspaceId:string;
 sourceRefs:string[];licensedAssetIds:string[];consentRefs:string[];
 rightsStatus:'pending'|'approved'|'rejected';commercialUseApproved:boolean;
 accessibleAlternatives:string[];contentRating:'general'|'teen'|'adult';
}
export type CreativeDestination={
 surface:CreativeSurface;assetFormat:'glb'|'blend'|'mp4'|'wav'|'json';
 maxBytes:number;requiresReview:boolean;status:'draft'|'verified';
}
export type CreativeRelease={node:CreativeNode;destinations:CreativeDestination[]}
export type CreationDecision={ready:boolean;errors:string[]}
const supportedFormats:Record<CreativeSurface,CreativeDestination['assetFormat'][]>={
 streetverse:['glb','json'],omnibox:['blend','mp4','json'],'isaiah-tv':['mp4','json'],
 'aniyah-studio':['wav','mp4','json'],marketplace:['glb','mp4','json'],
 xr:['glb','json'],training:['mp4','json'],
}
export function validateCreativeRelease(release:CreativeRelease):CreationDecision{
 const e:string[]=[],n=release.node
 if(!/^[A-Za-z0-9_-]{1,80}$/.test(n.id)||!/^[A-Za-z0-9_-]{1,80}$/.test(n.ownerWorkspaceId))e.push('invalid_identity')
 if(!Number.isSafeInteger(n.revision)||n.revision<1)e.push('invalid_revision')
 if(n.rightsStatus!=='approved'||!n.commercialUseApproved)e.push('rights_not_approved')
 if(!n.sourceRefs.length||!n.licensedAssetIds.length)e.push('source_or_asset_evidence_missing')
 if(n.kind==='character'||n.kind==='motion'){
  if(!n.consentRefs.length)e.push('performer_consent_missing')
 }
 if(!n.accessibleAlternatives.length)e.push('accessibility_fallback_missing')
 if(!release.destinations.length)e.push('no_output_target')
 for(const d of release.destinations){
  if(!supportedFormats[d.surface]?.includes(d.assetFormat))e.push('unsupported_target_format:'+d.surface)
  if(!Number.isSafeInteger(d.maxBytes)||d.maxBytes<1||d.maxBytes>2_000_000_000)e.push('invalid_size_cap:'+d.surface)
  if(d.status!=='verified')e.push('output_unverified:'+d.surface)
  if(d.requiresReview)e.push('explicit_review_required:'+d.surface)
  if(n.contentRating==='adult'&&(['isaiah-tv','training'] as CreativeSurface[]).includes(d.surface))e.push('adult_content_restricted:'+d.surface)
 }
 return{ready:e.length===0,errors:[...new Set(e)]}
}
/** Return a read-only staging manifest. Callers must authorize real publishing separately. */
export function stageCreativeRelease(release:CreativeRelease){
 const decision=validateCreativeRelease(release)
 return {status:decision.ready?'staging_ready':'blocked',decision,
  manifest:decision.ready?{assetId:release.node.id,revision:release.node.revision,
   workspace:release.node.ownerWorkspaceId,outputs:release.destinations.map(x=>({surface:x.surface,format:x.assetFormat}))}:null}
}
