import {getStubbsPassport} from './meetTheStubbsFamilyFriends'
import {getStreetVerseMeetTheStubbsEncounter} from './streetVerseMeetTheStubbsRoster'
import {TRYAMM_EDGE_EARNINGS_ECONOMY} from '../../data/TryammEdgeEarningsEconomy'

export type StubbsBusinessPath={characterId:string;businessId:string;label:string;world:string;activity:string}
export const STUBBS_BUSINESS_PATHS:StubbsBusinessPath[]=[
 {characterId:'jacobie-stubbs',businessId:'jacobie-vision',label:'Jacobie Vision Cybersecurity',world:'MiddleVerse',activity:'cyber-safety'},
 {characterId:'isaiah-stubbs',businessId:'isaiah-ai-tv',label:'Isaiah AI TV — Anyone Can Be a Star',world:'StarVerse',activity:'creator-audition'},
 {characterId:'aniyah-stubbs',businessId:'aniyah-64-track-studio',label:'Aniyah 64-Track Studio',world:'MusicVerse',activity:'music-session'},
 {characterId:'al-b',businessId:'guardian-security',label:'Security and Community Safety',world:'StreetVerse',activity:'safe-passage'},
 {characterId:'pastor-kofi',businessId:'servants-of-christ',label:'Servants of Christ Network',world:'FaithVerse',activity:'community-service'},
 {characterId:'benny',businessId:'ai-cafe',label:'AI Café and HoloGPT',world:'MiddleVerse',activity:'business-assistance'},
 {characterId:'raymond-jarreau',businessId:'omnicare360',label:'OmniCare360 Business Pathway',world:'MiddleVerse',activity:'community-business'},
 {characterId:'tae-monroe',businessId:'tae-monroe-creator',label:'Tae Monroe Creator Business',world:'CreatorVerse',activity:'creator-showcase'},
 {characterId:'marcus',businessId:'marcus-story',label:'Marcus — The City Remembers',world:'StreetVerse',activity:'story-investigation'},
]
export type ArrivalPathway={cityId:string;characterId:string;characterName:string;missions:{id:string;title:string;objective:string;action:string}[];businesses:StubbsBusinessPath[];travel:{fromCity:string;targetWorld:string;mode:'portal-preview'}[];earnings:{fictionalGameRewards:true;realEarningsStatus:'requires-verified-orders-and-settlement';edgeGridState:string;requiresAuthenticatedServer:true;paidJobVerificationRequired:true}}
/** Cross-city discovery metadata. This does not teleport, spawn 3D NPCs or authorize payouts. */
export function resolveStubbsArrivalPathway(cityId:string,characterId:string):ArrivalPathway|null{
 if(!/^[a-z]{2}-[a-z0-9-]{4,70}$/.test(cityId))return null
 const passport=getStubbsPassport(characterId)
 if(!passport)return null
 const encounter=getStreetVerseMeetTheStubbsEncounter(passport.id)
 const businesses=STUBBS_BUSINESS_PATHS.filter(b=>b.characterId===passport.id)
 return {cityId,characterId:passport.id,characterName:passport.displayName,missions:encounter?.missions||[],businesses,travel:businesses.map(b=>({fromCity:cityId,targetWorld:b.world,mode:'portal-preview'})),earnings:{fictionalGameRewards:true,realEarningsStatus:'requires-verified-orders-and-settlement',edgeGridState:TRYAMM_EDGE_EARNINGS_ECONOMY.state,requiresAuthenticatedServer:true,paidJobVerificationRequired:true}}
}
