/**
 * StarVerse → Isaiah AI TV → All American Network local production desk.
 * Local creative drafts only. This module never uploads media, accepts a talent
 * application, clears rights, buys billboard space, publishes TV/streaming feeds,
 * issues wages, authorizes a monetized impression or sends external posts.
 */
export type StarTalentFormat='audition'|'music'|'movie'|'video'|'pk-special'|'podcast'
export type StarDistribution='isaiah-tv'|'all-american-network'|'holo-music'|'holo-drama'|'free-tv'|'digital-billboard'|'streetverse-billboard'|'reels'
export type StarReviewStatus='LOCAL_DRAFT'|'REVIEW_PREPARED'
export type StarTalentDraft={
 schema:'tryamm.starverse.network-draft.v1'
 id:string
 title:string
 creatorCredit:string
 format:StarTalentFormat
 synopsis:string
 status:StarReviewStatus
 destinations:StarDistribution[]
 audience:'general'|'teen'
 musicRightsAttested:boolean
 visualRightsAttested:boolean
 consentAttested:boolean
 guardianConsentVerified:boolean
 createdAt:string
 updatedAt:string
}
export type StarProductionPlan={
 schema:'tryamm.starverse.production-plan.v1'
 draftId:string
 status:'PREVIEW_ONLY'
 productionSteps:readonly string[]
 destinationRequests:{id:StarDistribution;name:string;ready:false;reviewRequired:true}[]
 canRequestHumanReview:boolean
 publicDistributionAuthorized:false
 externalStreamingActive:false
 billboardsBooked:false
 payoutsAuthorized:false
}
export const STAR_DRAFT_KEY='tryamm.starverse.network-draft.v1'
export const STAR_FORMATS=[
 {id:'audition',label:'Anyone Can Be a Star • Audition',desc:'Introduce your talent and prepare a free audition preview'},
 {id:'music',label:'Holo Music • Artist Showcase',desc:'Plan a concert, song, video, or 64-track session'},
 {id:'movie',label:'Holo Movie • Film Premiere',desc:'Develop short film, episode or 30–120 minute movie'},
 {id:'video',label:'Holo Video • Creator Show',desc:'Documentaries, interviews, sports, education and creator videos'},
 {id:'pk-special',label:'PK Living Worlds • TV Special',desc:'Turn a game chapter into a broadcast-ready show concept'},
 {id:'podcast',label:'All American Podcast',desc:'Plan a voice, video or creator interview show'},
] as const
export const STAR_DISTRIBUTION=[
 {id:'isaiah-tv',name:'Isaiah AI TV',path:'/isaiah-ai-tv',meaning:'Talent discovery, show packages and editorial review'},
 {id:'all-american-network',name:'All American Network',path:'/network',meaning:'Network programming and producer review'},
 {id:'holo-music',name:'Holo Music Streaming',path:'/holo-music',meaning:'Rights-cleared music catalog and radio'},
 {id:'holo-drama',name:'Holo Movies / Holo Drama',path:'/holo-drama',meaning:'Episodes, movie stories and creator series'},
 {id:'free-tv',name:'All American Free TV',path:'/free-tv',meaning:'Advertising-supported viewing when feeds are live'},
 {id:'digital-billboard',name:'All American Digital Billboards',path:'/network/talent-studio',meaning:'DOOH creative proposals; no physical placement booked'},
 {id:'streetverse-billboard',name:'StreetVerse In-World Billboards',path:'/streetverse',meaning:'Virtual outdoor ad creative awaiting in-world placement'},
 {id:'reels',name:'Holo Reels / Omni Box',path:'/reel-creator',meaning:'Preview, edit, save and verified publishing'},
] as const
const FORMATS=STAR_FORMATS.map(x=>x.id) as readonly string[]
const DISTRIBUTIONS=STAR_DISTRIBUTION.map(x=>x.id) as readonly string[]
export function newStarTalentDraft(format:StarTalentFormat='audition'):StarTalentDraft{
 const now=new Date().toISOString()
 return{schema:'tryamm.starverse.network-draft.v1',
  id:'star-local-'+(typeof crypto!=='undefined'&&typeof crypto.randomUUID==='function'?crypto.randomUUID():Date.now().toString(36)),
  title:'',creatorCredit:'',format,synopsis:'',status:'LOCAL_DRAFT',
  destinations:['isaiah-tv','all-american-network','reels'],audience:'general',
  musicRightsAttested:false,visualRightsAttested:false,consentAttested:false,guardianConsentVerified:false,
  createdAt:now,updatedAt:now}
}
export function updateStarTalentDraft(draft:StarTalentDraft,fields:Partial<Pick<StarTalentDraft,'title'|'creatorCredit'|'synopsis'|'format'|'audience'|'destinations'|'musicRightsAttested'|'visualRightsAttested'|'consentAttested'>>):StarTalentDraft{
 const format=fields.format&&FORMATS.includes(fields.format)?fields.format:draft.format
 const destinations=fields.destinations?Array.from(new Set(fields.destinations.filter(id=>DISTRIBUTIONS.includes(id)))):draft.destinations
 const audience=fields.audience==='teen'?'teen':fields.audience==='general'?'general':draft.audience
 return{...draft,...fields,format,destinations,audience,title:String(fields.title??draft.title).slice(0,120),
  creatorCredit:String(fields.creatorCredit??draft.creatorCredit).slice(0,100),
  synopsis:String(fields.synopsis??draft.synopsis).slice(0,500),
  status:'LOCAL_DRAFT',guardianConsentVerified:false,updatedAt:new Date().toISOString()}
}
export function readyForStarHumanReview(draft:StarTalentDraft):boolean{
 return draft.title.trim().length>=3&&draft.creatorCredit.trim().length>=2&&draft.synopsis.trim().length>=12&&
  draft.destinations.length>0&&draft.musicRightsAttested&&draft.visualRightsAttested&&draft.consentAttested&&
  draft.audience==='general'
}
export function prepareStarTalentReview(draft:StarTalentDraft):StarTalentDraft{
 if(!readyForStarHumanReview(draft))return{...draft,status:'LOCAL_DRAFT'}
 return{...draft,status:'REVIEW_PREPARED',updatedAt:new Date().toISOString()}
}
export function starProductionPlan(draft:StarTalentDraft):StarProductionPlan{
 const rights=readyForStarHumanReview(draft)
 const base=[
  'Draft a performance, script, PK special or audition concept',
  'Record or upload original media in the existing TRYAMM creator tools',
  'Secure talent, music, venue, footage and likeness clearances',
  'Add captions, accessible controls, translation and audience age rating',
  'Submit through an authenticated moderation and editorial review service (not connected to this local desk)',
  'Publish only after explicit human editorial, rights, provider and distribution approval',
 ] as const
 return{schema:'tryamm.starverse.production-plan.v1',draftId:draft.id,status:'PREVIEW_ONLY',
  productionSteps:base,
  destinationRequests:draft.destinations.map(id=>({id,name:STAR_DISTRIBUTION.find(x=>x.id===id)?.name||id,ready:false,reviewRequired:true})),
  canRequestHumanReview:rights,publicDistributionAuthorized:false,externalStreamingActive:false,billboardsBooked:false,payoutsAuthorized:false}
}
export function readStarTalentDraft():StarTalentDraft|null{
 if(typeof window==='undefined')return null
 try{
  const raw=localStorage.getItem(STAR_DRAFT_KEY)
  if(!raw||raw.length>10000)return null
  const d=JSON.parse(raw) as Partial<StarTalentDraft>
  if(d.schema!=='tryamm.starverse.network-draft.v1'||!FORMATS.includes(String(d.format)))return null
  const base=newStarTalentDraft(d.format)
  return{...base,id:String(d.id||base.id).slice(0,110),title:String(d.title||'').slice(0,120),creatorCredit:String(d.creatorCredit||'').slice(0,100),synopsis:String(d.synopsis||'').slice(0,500),
   status:d.status==='REVIEW_PREPARED'?'REVIEW_PREPARED':'LOCAL_DRAFT',
   destinations:Array.from(new Set((Array.isArray(d.destinations)?d.destinations:[]).filter(x=>DISTRIBUTIONS.includes(x)))),
   audience:d.audience==='teen'?'teen':'general',
   musicRightsAttested:d.musicRightsAttested===true,visualRightsAttested:d.visualRightsAttested===true,consentAttested:d.consentAttested===true,
   guardianConsentVerified:false,createdAt:String(d.createdAt||base.createdAt),updatedAt:String(d.updatedAt||base.updatedAt)}
 }catch{return null}
}
export function writeStarTalentDraft(draft:StarTalentDraft){
 if(typeof window==='undefined')return
 try{localStorage.setItem(STAR_DRAFT_KEY,JSON.stringify(draft))}catch{}
}
export type StarBillboardSpec={schema:'tryamm.all-american.billboard-preview.v1';format:'16:9 digital signage concept';title:string;creatorCredit:string;headline:string;callToAction:'Watch on TRYAMM';markets:readonly string[];network:'All American Network';status:'DRAFT';providerBooked:false;adDeliveryVerified:false;rightsReviewRequired:true}
export function starBillboardPreview(draft:StarTalentDraft):StarBillboardSpec{
 return{schema:'tryamm.all-american.billboard-preview.v1',format:'16:9 digital signage concept',
  title:draft.title||'Your next star',creatorCredit:draft.creatorCredit||'TRYAMM Creator',
  headline:(draft.title||'Anyone Can Be a Star').slice(0,80),
  callToAction:'Watch on TRYAMM',markets:['Chicago','Lagos','Abuja'],
  network:'All American Network',status:'DRAFT',providerBooked:false,adDeliveryVerified:false,rightsReviewRequired:true}
}
