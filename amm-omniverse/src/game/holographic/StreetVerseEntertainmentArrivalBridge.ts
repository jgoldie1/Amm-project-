import {TRYAMM_NETWORK_CHANNELS} from '../../runtime/TryammBroadcastOSRuntime'
import {CROSSVERSE_LIVE_PK_RULES} from './CrossVerseLivePK'

/** StreetVerse entertainment discovery. Existing radio, broadcasting and PK runtimes
 * remain authoritative; this bridge never settles gifts, creates streams or awards cash.
 */
export const STREETVERSE_ENTERTAINMENT_VENUES=[
 {id:'street-radio',name:'StreetVerse Radio',route:'/holo-radio-streetverse.html',kind:'radio'},
 {id:'all-american',name:'All American Network',route:'/network',kind:'broadcast'},
 {id:'musicverse',name:'MusicVerse TV',route:'/network',kind:'music'},
 {id:'crossverse-live',name:'CrossVerse LIVE',route:'/crossverse-live.html',kind:'live'},
 {id:'omega-arena',name:'Omega LIVE / PK Arena',route:'/crossverse-live.html',kind:'omega-pk'},
] as const

export type OmegaArenaMode='performance'|'creator-collab'|'talent-showcase'|'team-versus-team'|'global-tournament'
export interface OmegaArenaBrief{
 id:string;cityId:string;title:string;mode:OmegaArenaMode
 creatorIds:string[];audience:'all-ages'|'adults';ranked:boolean
 giftState:'disabled'|'server-verification-required';status:'concept-only'
}
const CITY_ID=/^[a-z]{2}-[a-z0-9-]{4,70}$/
export function streetVerseEntertainmentForArrival(cityId:string){
 if(!CITY_ID.test(cityId))return null
 return {cityId,venueCatalog:STREETVERSE_ENTERTAINMENT_VENUES,
 broadcastChannels:TRYAMM_NETWORK_CHANNELS.map(c=>({id:c.id,name:c.name,routes:c.routes})),
 radioRuntime:'VerseRadioRuntime',
 crossVersePKRules:CROSSVERSE_LIVE_PK_RULES,
 streamActivation:'authenticated-provider-integration-required',
 giftSettlement:'server-verified-ledger-only',
 recording:'consent-and-rights-gated'}
}
export function createOmegaArenaBrief(input:{cityId:string;title:string;mode:OmegaArenaMode;creatorIds:string[];audience:'all-ages'|'adults';ranked:boolean}):OmegaArenaBrief{
 if(!CITY_ID.test(input.cityId)||!input.title?.trim()||input.title.length>100||!Array.isArray(input.creatorIds)||input.creatorIds.length<1||input.creatorIds.length>20)throw Error('invalid_omega_arena')
 if(!['performance','creator-collab','talent-showcase','team-versus-team','global-tournament'].includes(input.mode))throw Error('invalid_omega_mode')
 if(new Set(input.creatorIds).size!==input.creatorIds.length||input.creatorIds.some(x=>typeof x!=='string'||!/^[a-z0-9-]{2,70}$/.test(x)))throw Error('invalid_creator_ids')
 return {id:'omega-preview-'+input.cityId+'-'+input.mode,cityId:input.cityId,title:input.title.trim(),mode:input.mode,
 creatorIds:[...input.creatorIds],audience:input.audience,ranked:Boolean(input.ranked),
 giftState:'server-verification-required',status:'concept-only'}
}
export const OMEGA_LIVE_SAFETY={
 giftsCannotChangeRankedResults:true,neverCreateClientSidePayableRewards:true,
 noWageringOrGambling:true,moderationAndAgeControlsRequired:true,
 recordingConsentRequired:true,musicLicensingRequired:true,
 crossRegionPayoutComplianceRequired:true,creatorEarningsOnlyAfterVerifiedSettlement:true,
 accessibilityCaptionsAndOneHandNavigationRequired:true,
} as const
