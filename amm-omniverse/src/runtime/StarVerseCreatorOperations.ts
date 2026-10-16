/**
 * StarVerse local creator operations preview. None of this is a casting system,
 * sponsor marketplace, royalty engine, ad server, audience vote tally,
 * media-rights registry or verified identity system.
 *
 * No personal addresses, government IDs, DOBs or contact details are collected.
 * Never treat unverified user-entered metadata as verified licenses, bookings,
 * impressions, earnings or publishing permissions.
 */
export type StarCompetitionTrack='singing'|'acting'|'dance'|'comedy'|'gaming'|'storytelling'|'community'
export type StarRightsAsset='music'|'video'|'performance'|'image'|'script'|'location'|'brand'
export type StarRightsStatus='unverified'|'needs-licensor-review'|'creator-claims-ownership'
export type StarSponsorPlacement='episode'|'virtual-billboard'|'live-break'|'reel'
export type StarProductionMilestone='draft'|'audition-plan'|'rights-checklist'|'caption-plan'|'sponsor-proposal'|'billboard-concept'|'broadcast-draft'
export type StarCreatorPassport={stageName:string;bio:string;skills:StarCompetitionTrack[];accessibilityPreferences:{captions:boolean;reducedMotion:boolean;oneHandControls:boolean};languages:string[];portfolioNotes:string;visibility:'private-local'}
export type StarRightsRecord={id:string;assetType:StarRightsAsset;assetLabel:string;claim:StarRightsStatus;notes:string;verified:false;commercialUseAuthorized:false}
export type StarSponsorDraft={id:string;brandLabel:string;placement:StarSponsorPlacement;concept:string;budgetCents:0;status:'LOCAL_PROPOSAL';contractSigned:false;inventoryReserved:false;moneyMoved:false}
export type StarCaptionPlan={originalLanguage:string;translationLanguages:string[];captionWorkflow:'manual-review-required';humanReviewed:false;mediaCaptionFileAttached:false}
export type StarCompetitionPlan={track:StarCompetitionTrack;episodeTitle:string;format:'free-showcase';status:'LOCAL_PREVIEW';realVotes:0;realAuditions:0;finalistsSelected:false}
export type StarCreatorOps={
 schema:'tryamm.starverse.creator-operations.v1'
 passport:StarCreatorPassport
 competition:StarCompetitionPlan
 rights:StarRightsRecord[]
 sponsor:StarSponsorDraft[]
 captions:StarCaptionPlan
 milestones:StarProductionMilestone[]
 lastUpdated:string
}
export const STAR_OPS_KEY='tryamm.starverse.creator-operations.v1'
export const STAR_COMPETITION_TRACKS=[
 {id:'singing',label:'Singing / music'},{id:'acting',label:'Acting'},{id:'dance',label:'Dance'},
 {id:'comedy',label:'Comedy'},{id:'gaming',label:'Gaming / PK'},{id:'storytelling',label:'Storytelling'},{id:'community',label:'Community talent'},
] as const
export const STAR_RIGHTS_ASSETS=['music','video','performance','image','script','location','brand'] as const
export const STAR_SPONSOR_PLACEMENTS=['episode','virtual-billboard','live-break','reel'] as const
export const STAR_MILESTONES=['draft','audition-plan','rights-checklist','caption-plan','sponsor-proposal','billboard-concept','broadcast-draft'] as const
const LOCALES=['en','es','fr','pt','ar','sw','yo','ig','ha','zh','ja'] as const
const clean=(v:unknown,limit:number)=>String(v??'').slice(0,limit) // preserve spaces during controlled mobile typing
const unique=<T extends string>(arr:unknown,choices:readonly T[],max:number):T[]=>Array.isArray(arr)?Array.from(new Set(arr.filter((x):x is T=>typeof x==='string'&&choices.includes(x as T)))).slice(0,max):[]
export function newStarCreatorOps():StarCreatorOps{
 return{
  schema:'tryamm.starverse.creator-operations.v1',
  passport:{stageName:'',bio:'',skills:[],accessibilityPreferences:{captions:true,reducedMotion:true,oneHandControls:true},languages:['en'],portfolioNotes:'',visibility:'private-local'},
  competition:{track:'singing',episodeTitle:'Who Wants to Be a Star?',format:'free-showcase',status:'LOCAL_PREVIEW',realVotes:0,realAuditions:0,finalistsSelected:false},
  rights:[],sponsor:[],
  captions:{originalLanguage:'en',translationLanguages:[],captionWorkflow:'manual-review-required',humanReviewed:false,mediaCaptionFileAttached:false},
  milestones:[],lastUpdated:new Date().toISOString(),
 }
}
export function normalizedStarCreatorOps(raw:unknown):StarCreatorOps{
 const initial=newStarCreatorOps()
 if(!raw||typeof raw!=='object'||(raw as {schema?:string}).schema!==initial.schema)return initial
 const v=raw as Partial<StarCreatorOps>
 const stageName=clean(v.passport?.stageName,90)
 const rights=Array.isArray(v.rights)?v.rights.slice(-20).flatMap(x=>{
  if(!STAR_RIGHTS_ASSETS.includes(x.assetType))return []
  return[{id:clean(x.id,80)||'right-'+Date.now(),assetType:x.assetType,assetLabel:clean(x.assetLabel,120),
    claim:(x.claim==='creator-claims-ownership'||x.claim==='needs-licensor-review')?x.claim:'unverified' as StarRightsStatus,
    notes:clean(x.notes,240),verified:false as const,commercialUseAuthorized:false as const}]
 }):[]
 const sponsor=Array.isArray(v.sponsor)?v.sponsor.slice(-10).flatMap(x=>{
  if(!STAR_SPONSOR_PLACEMENTS.includes(x.placement))return []
  return[{id:clean(x.id,80)||'sponsor-'+Date.now(),brandLabel:clean(x.brandLabel,100),
    placement:x.placement,concept:clean(x.concept,240),budgetCents:0 as const,
    status:'LOCAL_PROPOSAL' as const,contractSigned:false as const,inventoryReserved:false as const,moneyMoved:false as const}]
 }):[]
 return{
  schema:initial.schema,
  passport:{stageName,bio:clean(v.passport?.bio,280),
   skills:unique(v.passport?.skills,STAR_COMPETITION_TRACKS.map(x=>x.id),7),
   accessibilityPreferences:{captions:v.passport?.accessibilityPreferences?.captions!==false,
    reducedMotion:v.passport?.accessibilityPreferences?.reducedMotion!==false,
    oneHandControls:v.passport?.accessibilityPreferences?.oneHandControls!==false},
   languages:unique(v.passport?.languages,LOCALES,4).length?unique(v.passport?.languages,LOCALES,4):['en'],
   portfolioNotes:clean(v.passport?.portfolioNotes,280),visibility:'private-local'},
  competition:{track:STAR_COMPETITION_TRACKS.some(x=>x.id===v.competition?.track)?v.competition!.track:'singing',
   episodeTitle:clean(v.competition?.episodeTitle,110)||'Who Wants to Be a Star?',
   format:'free-showcase',status:'LOCAL_PREVIEW',realVotes:0,realAuditions:0,finalistsSelected:false},
  rights,sponsor,
  captions:{originalLanguage:LOCALES.includes(v.captions?.originalLanguage as typeof LOCALES[number])?v.captions!.originalLanguage:'en',
   translationLanguages:unique(v.captions?.translationLanguages,LOCALES,4),
   captionWorkflow:'manual-review-required',humanReviewed:false,mediaCaptionFileAttached:false},
  milestones:unique(v.milestones,STAR_MILESTONES,7),
  lastUpdated:clean(v.lastUpdated,50)||initial.lastUpdated,
 }
}
export function saveStarCreatorOps(input:StarCreatorOps):StarCreatorOps{
 const state=normalizedStarCreatorOps(input)
 state.lastUpdated=new Date().toISOString()
 if(typeof window!=='undefined')try{window.localStorage.setItem(STAR_OPS_KEY,JSON.stringify(state))}catch{}
 return state
}
export function loadStarCreatorOps():StarCreatorOps{
 if(typeof window==='undefined')return newStarCreatorOps()
 try{const raw=window.localStorage.getItem(STAR_OPS_KEY);return raw&&raw.length<=16000?normalizedStarCreatorOps(JSON.parse(raw)):newStarCreatorOps()}catch{return newStarCreatorOps()}
}
export function clearStarCreatorOps(){
 if(typeof window!=='undefined')try{window.localStorage.removeItem(STAR_OPS_KEY)}catch{}
}
export function prepareCompetitionRunOfShow(ops:StarCreatorOps){
 return{
  schema:'tryamm.starverse.competition-run-of-show.v1',
  series:'Who Wants to Be a Star?',
  title:ops.competition.episodeTitle,
  track:ops.competition.track,
  freeEntry:true,
  rounds:[
   {id:'audition',label:'Optional creator introduction (consent required)'},
   {id:'performance',label:'Performance, act or recorded showcase'},
   {id:'feedback',label:'Moderated constructive feedback'},
   {id:'finale',label:'Human-reviewed editorial finale; no pay-to-win gifting'},
  ],
  audienceVotesVerified:0,judgesVerified:false,contestantsRegistered:0,
  youthEntryRequiresGuardianApproval:true,onlineCompetitionActive:false,
  serverAntiFraudRequired:true,winnerSelected:false,
 } as const
}
export function starLocalAnalytics(ops:StarCreatorOps){
 const milestones=unique(ops.milestones,STAR_MILESTONES,7)
 return{
  localProductionProgress:milestones.length,
  localMilestoneTotal:STAR_MILESTONES.length,
  rightsMetadataItems:ops.rights.length,
  sponsorConcepts:ops.sponsor.length,
  captionLanguagesPlanned:ops.captions.translationLanguages.length,
  audienceReach:null,verifiedViews:null,verifiedAuditions:null,paidImpressions:null,creatorEarningsCents:null,
  measuredBy:'this-device local drafts only' as const,
 }
}
export function starRightsReleaseGate(ops:StarCreatorOps){
 return{
  submittedLicenses:0,
  verifiedLicenses:0,
  creatorClaims:ops.rights.filter(x=>x.claim==='creator-claims-ownership').length,
  unverified:ops.rights.length,
  eligibleForCommercialPublish:false,
  humanRightsClearanceRequired:true,
 } as const
}
