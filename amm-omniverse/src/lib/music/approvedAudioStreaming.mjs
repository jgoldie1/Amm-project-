// All American Records streaming audio: deliberately empty until server-approved original assets.
// Actual recordings require master, composition, performer rights and territory/date approvals.
export const PUBLIC_APPROVED_AUDIO_CATALOG=Object.freeze([]);
export const AUDIO_RELEASE_REQUIREMENTS=Object.freeze(['masterStreamingAuthorized','compositionStreamingAuthorized','performerRightsReviewed','sampleClearanceVerified','territoryAndTermApproved','metadataVerified','accessibilityMetadataVerified','moderationApproved','publisherApprovalLogged']);
export function createAudioReviewDraft({title,artist,genre,album}={}){
 const clean=(v,max)=>typeof v==='string'?v.trim().slice(0,max):'';
 if(!clean(title,120)||!clean(artist,120))return null;
 return {schema:1,title:clean(title,120),artist:clean(artist,120),genre:clean(genre,50),album:clean(album,120),status:'draft',publiclyPlayable:false,rightsVerified:false,streamUrl:null,territories:[],plays:0,royaltiesVerified:false,monetizationAuthorized:false};
}
export function isAudioStreamApproved(a,now=Date.now(),territory='US'){
 return !!a&&a.schema===1&&a.status==='approved'&&a.publiclyPlayable===true&&a.rightsVerified===true&&
  typeof a.artist==='string'&&a.artist.trim()&&typeof a.title==='string'&&a.title.trim()&&
  AUDIO_RELEASE_REQUIREMENTS.every(k=>a.rightsChecks?.[k]===true)&&
  Array.isArray(a.territories)&&a.territories.includes(territory)&&
  Number.isFinite(a.allowedFrom)&&Number.isFinite(a.allowedUntil)&&a.allowedFrom<=now&&a.allowedUntil>now&&
  typeof a.streamUrl==='string'&&/^https:\/\//.test(a.streamUrl);
}
export function approvedAudioTracks(catalog=PUBLIC_APPROVED_AUDIO_CATALOG,{now=Date.now(),territory='US',query='',genre='All'}={}){
 const q=String(query).trim().slice(0,120).toLowerCase();
 return (Array.isArray(catalog)?catalog:[]).filter(x=>isAudioStreamApproved(x,now,territory)).filter(x=>
  (genre==='All'||x.genre===genre)&&(!q||[x.title,x.artist,x.genre,x.album].join(' ').toLowerCase().includes(q))
 ).map(x=>({id:x.id,title:x.title,artist:x.artist,genre:x.genre||'Independent',album:x.album||'',streamUrl:x.streamUrl,rightsVerified:true}))
 .sort((a,b)=>String(a.artist).localeCompare(String(b.artist))||String(a.title).localeCompare(String(b.title)));
}
