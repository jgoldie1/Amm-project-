import {TRYAMM_NETWORK_CHANNELS,type TryammNetworkChannelId} from './TryammBroadcastOSRuntime'
import type {StreetVerseTransitMode} from './StreetVerseTransitDisplayRuntime'

/** Non-authoritative, deterministic animation offsets, not networked travel physics. */
export type TransitMotionFrame={travelM:number;swayDeg:number;heaveM:number;headTurnDeg:number;wheelDeg:number;beltM:number}
export function computeTransitMotion(mode:StreetVerseTransitMode,elapsedSeconds:number,speedMps:number):TransitMotionFrame{
 const t=Number.isFinite(elapsedSeconds)?Math.max(0,elapsedSeconds):0
 const speed=Number.isFinite(speedMps)?Math.max(0,Math.min(80,speedMps)):0
 const intensity=speed===0?0:Math.min(1,speed/12)
 const rail=mode==='el-train',air=mode==='plane',walk=mode==='airport-walkway'
 return {
  travelM:t*speed,
  swayDeg:Math.sin(t*(rail?1.8:air?.55:2.4))*intensity*(air?.6:rail?1.2:1.6),
  heaveM:Math.sin(t*(rail?7:air?1.4:4))*intensity*(air?.012:rail?.012:.02),
  headTurnDeg:Math.sin(t*.75)*Math.min(12,4+intensity*6),
  wheelDeg:walk?0:(t*speed/Math.max(.1,.34))*180/Math.PI,
  beltM:walk?t*speed:0
 }
}
export type VehicleMediaSlot='dashboard'|'seatback-tv'|'overhead-screen'|'station-sign'|'airport-gate'|'cabin-radio'
export type VehicleMediaState={slot:VehicleMediaSlot;channelId:TryammNetworkChannelId;title:string;source:'tryamm-broadcast-os'|'verse-radio';isLiveVerified:false;advertisement:TransitSponsorCard|null}
export type TransitSponsorCard={id:string;brand:string;message:string;approved:boolean;rightsCleared:boolean;label:'ADVERTISEMENT';durationSeconds:number}
export function safeTransitSponsor(ad:TransitSponsorCard|null):TransitSponsorCard|null{
 if(!ad?.approved||!ad.rightsCleared||!ad.id||!ad.brand)return null
 return {...ad,brand:ad.brand.replace(/[<>]/g,'').slice(0,50),message:ad.message.replace(/[<>]/g,'').slice(0,160),durationSeconds:Math.max(5,Math.min(60,Number.isFinite(ad.durationSeconds)?ad.durationSeconds:15)),label:'ADVERTISEMENT'}
}
export function makeTransitMedia(slot:VehicleMediaSlot,channelId:TryammNetworkChannelId,ad:TransitSponsorCard|null=null):VehicleMediaState{
 const channel=TRYAMM_NETWORK_CHANNELS.find(x=>x.id===channelId)
 return {slot,channelId,title:channel?.name||'TRYAMM Network',source:slot==='cabin-radio'?'verse-radio':'tryamm-broadcast-os',isLiveVerified:false,advertisement:safeTransitSponsor(ad)}
}
export const TRANSIT_MEDIA_DEFAULTS:Record<StreetVerseTransitMode,{slot:VehicleMediaSlot;channelId:TryammNetworkChannelId}>={
 car:{slot:'dashboard',channelId:'streetverse-local-tv'},
 bus:{slot:'overhead-screen',channelId:'all-american-network'},
 'el-train':{slot:'overhead-screen',channelId:'streetverse-local-tv'},
 plane:{slot:'seatback-tv',channelId:'all-american-network'},
 'airport-walkway':{slot:'airport-gate',channelId:'tryamm-news'}
}
