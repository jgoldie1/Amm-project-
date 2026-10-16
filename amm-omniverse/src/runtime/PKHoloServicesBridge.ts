import type {PKStoryDraft} from './PKLivingWorldsBridge'

/** Preview-only service missions for the PK show. Nothing here books rides, accepts
 * food orders, offers paid jobs, starts drones, initiates payments, or publishes media. */
export type PKHoloServiceId='music'|'menu'|'ride'|'delivery'|'drone'|'ads'|'lingo'|'guardian'|'builder'|'logistics'|'marketplace'|'reels'
export type PKHoloService={
 id:PKHoloServiceId
 label:string
 icon:string
 quest:string
 middleverseRole:string
 route:string
 status:'BETA'|'SIMULATION'|'PROVIDER_GATED'
 requiresRights:boolean
}
export const PK_HOLO_SERVICES:readonly PKHoloService[]=[
 {id:'music',label:'Holo Music',icon:'♫',quest:'Produce a rights-cleared concert or music challenge',middleverseRole:'producer / audio editor',route:'/holo-music',status:'BETA',requiresRights:true},
 {id:'menu',label:'Holo Menu',icon:'🍽',quest:'Design a fictional festival menu and choose vendors',middleverseRole:'restaurant onboarding / menu assistant',route:'/holo-food',status:'BETA',requiresRights:false},
 {id:'ride',label:'Holo Ride Share',icon:'🚘',quest:'Plan a simulated accessible trip to the event',middleverseRole:'transport operations / support',route:'/holo-ride-share',status:'PROVIDER_GATED',requiresRights:false},
 {id:'delivery',label:'Holo Delivery',icon:'📦',quest:'Complete a fictional noncash courier challenge',middleverseRole:'delivery coordinator / customer support',route:'/holo-food',status:'SIMULATION',requiresRights:false},
 {id:'drone',label:'Holo Drone',icon:'🚁',quest:'Storyboard a virtual aerial camera or delivery mission',middleverseRole:'licensed operator / compliance review',route:'/holo-ride-share',status:'PROVIDER_GATED',requiresRights:true},
 {id:'ads',label:'Holo Ads',icon:'📣',quest:'Design a sponsor placement awaiting brand and rights approval',middleverseRole:'campaign producer / ad operations',route:'/',status:'BETA',requiresRights:true},
 {id:'lingo',label:'Holo Lingo',icon:'🌐',quest:'Prepare translated captions for both teams',middleverseRole:'translator / accessibility reviewer',route:'/',status:'BETA',requiresRights:false},
 {id:'guardian',label:'Holo Guardian',icon:'🛡',quest:'Review audience safety, fairness and accessibility',middleverseRole:'trust and safety moderator',route:'/',status:'BETA',requiresRights:false},
 {id:'builder',label:'Holo Builder',icon:'🧰',quest:'Prototype an accessible festival stage',middleverseRole:'world builder / QA',route:'/',status:'BETA',requiresRights:false},
 {id:'logistics',label:'Holo Logistics',icon:'🚛',quest:'Plan stage equipment arrival and backstage inventory',middleverseRole:'dispatch / logistics planner',route:'/',status:'SIMULATION',requiresRights:false},
 {id:'marketplace',label:'Holo Marketplace',icon:'🛍',quest:'Preview verified event merchandise with no automatic purchase',middleverseRole:'commerce operator / seller support',route:'/marketplace',status:'BETA',requiresRights:true},
 {id:'reels',label:'Holo Reels',icon:'🎞',quest:'Plan and edit a highlight clip with consent',middleverseRole:'video editor / captions reviewer',route:'/reel-creator',status:'BETA',requiresRights:true},
] as const

export type PKHoloServicePreview={
 schema:'tryamm.pk.holo-service-preview.v1'
 storyId:string
 chapterCount:number
 serviceId:PKHoloServiceId
 title:string
 quest:string
 middleverseRole:string
 route:string
 source:'pk-living-worlds'
 previewOnly:true
 verifiedWork:false
 payable:false
 providerActionAuthorized:false
 worldMutationAuthorized:false
 rightsReviewRequired:boolean
}
export function buildPKHoloServicePreview(story:PKStoryDraft,id:PKHoloServiceId):PKHoloServicePreview{
 const service=PK_HOLO_SERVICES.find(s=>s.id===id)
 if(!service)throw new Error('Unknown Holo Service')
 return {
  schema:'tryamm.pk.holo-service-preview.v1',storyId:story.id,
  chapterCount:story.chapters.length,serviceId:id,title:service.label,
  quest:service.quest,middleverseRole:service.middleverseRole,route:service.route,source:'pk-living-worlds',
  previewOnly:true,verifiedWork:false,payable:false,providerActionAuthorized:false,
  worldMutationAuthorized:false,rightsReviewRequired:service.requiresRights,
 }
}
