// Rights-controlled All American Network music video discovery catalog.
// No sample video is assumed licensed; public catalog is intentionally empty.
// Only trusted server-approved manifest records may become public.
export const PUBLIC_MUSIC_VIDEO_CATALOG=Object.freeze([]);
export const VIDEO_RIGHTS_REQUIREMENTS=Object.freeze([
 'masterUseAuthorized',
 'compositionSyncAuthorized',
 'publicPerformanceReviewComplete',
 'performerReleasesVerified',
 'sampleAndArtworkRightsVerified',
 'territoryAndTermApproved',
 'captionsVerified',
 'moderationApproved',
 'videoEncodeVerified',
 'publisherApprovalLogged'
]);
const safeText=(value,max)=>typeof value==='string'?value.trim().slice(0,max):'';
export function createMusicVideoSubmissionDraft({title,artist,description,genre}={}){
 const t=safeText(title,120),a=safeText(artist,120);
 if(!t||!a)return null;
 return {schema:1,title:t,artist:a,description:safeText(description,600),genre:safeText(genre,50),
  status:'draft',publiclyPlayable:false,rightsVerified:false,externalDistributionAuthorized:false,monetizationAuthorized:false,
  streamManifestUrl:null,captionsUrl:null,territories:[],rightsChecks:{},verifiedPlays:0,verifiedSales:0};
}
export function isMusicVideoPublishable(video,now=Date.now(),territory='US'){
 if(!video||video.schema!==1||video.status!=='approved'||video.publiclyPlayable!==true||video.rightsVerified!==true||
 typeof video.title!=='string'||!video.title.trim()||typeof video.artist!=='string'||!video.artist.trim())return false;
 if(!video.rightsChecks||VIDEO_RIGHTS_REQUIREMENTS.some(k=>video.rightsChecks[k]!==true))return false;
 if(!Array.isArray(video.territories)||!video.territories.includes(territory))return false;
 if(!Number.isFinite(video.allowedFrom)||!Number.isFinite(video.allowedUntil)||video.allowedFrom>now||now>=video.allowedUntil)return false;
 if(!video.streamManifestUrl||typeof video.streamManifestUrl!=='string'||!/^https:\/\//.test(video.streamManifestUrl))return false;
 if(!video.captionsUrl||typeof video.captionsUrl!=='string'||!/^https:\/\//.test(video.captionsUrl))return false;
 return true;
}
export function listApprovedMusicVideos(catalog=PUBLIC_MUSIC_VIDEO_CATALOG,{now=Date.now(),territory='US'}={}){
 if(!Array.isArray(catalog))return [];
 return catalog.filter(v=>isMusicVideoPublishable(v,now,territory)).map(v=>({
  id:v.id,title:v.title,artist:v.artist,genre:v.genre||'Independent',description:v.description||'',
  streamManifestUrl:v.streamManifestUrl,captionsUrl:v.captionsUrl,rightsVerified:true
 }));
}
export const MUSIC_VIDEO_DISCOVERY_POLICY=Object.freeze({
 model:'Original and independently licensed music videos + artist profiles + direct fan merch links',
 artistOwnership:'No assignment of masters/compositions merely by video submission',
 paidPlacement:'Sponsored placement must be visibly labeled and cannot count toward independent editorial music charts',
 verifiedViews:'Deduplicate bot, autoplay and non-human events; no invented streams or payout promises',
 privacy:'No public display of customer information; consent required for music marketing',
 copyright:'Human review, notice-and-takedown process, rights audits and counter-notice workflow needed before release',
 status:'No licensed public music video inventory; transcoding, CDN, streaming analytics and payout systems are not yet verified'
});
