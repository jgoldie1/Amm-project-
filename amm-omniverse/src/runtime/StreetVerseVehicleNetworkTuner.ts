import {TRYAMM_NETWORK_CHANNELS,type BroadcastFeed,type TryammNetworkChannelId} from './TryammBroadcastOSRuntime'

/**
 * Passenger TV tuner for existing TRYAMM Broadcast OS channel entries.
 * These are program selections, not separate streams or a duplicate media player.
 */
export type VehicleTvPresetId =
 |'all-american-network'|'free-tv'|'holoverse-tv'|'faithverse-tv'
 |'isaiah-ai-tv'|'starverse-live'|'who-wants-to-be-a-star'
 |'servants-of-christ-network'|'streetverse-local-tv'
export type VehicleTvPreset={
 id:VehicleTvPresetId;dial:number;label:string;
 channelId:TryammNetworkChannelId|null;
 route:string|null;kind:'network'|'show'|'programming-slot';
 note:string
}
export const STREETVERSE_VEHICLE_TV_PRESETS:readonly VehicleTvPreset[]=[
 {id:'all-american-network',dial:1,label:'All American Network',channelId:'all-american-network',route:'/network',kind:'network',note:'Original entertainment, creator, community and business programming'},
 {id:'free-tv',dial:2,label:'TRYAMM Free TV',channelId:'all-american-network',route:'/free-tv',kind:'network',note:'Existing free ad-supported TV and commercial-break model; published media and playback must be verified'},
 {id:'holoverse-tv',dial:3,label:'HoloVerse TV',channelId:null,route:null,kind:'programming-slot',note:'HoloVerse video channel slot; dedicated verified feed not yet wired'},
 {id:'faithverse-tv',dial:4,label:'FaithVerse Broadcasting',channelId:null,route:'/faithverse',kind:'programming-slot',note:'FaithVerse video channel slot; select Servants of Christ for its registered ministry network'},
 {id:'isaiah-ai-tv',dial:5,label:'Isaiah AI TV',channelId:'isaiah-ai-tv',route:'/isaiah-ai-tv',kind:'network',note:'Talent discovery, shows and original AI-assisted productions'},
 {id:'starverse-live',dial:6,label:'StarVerse',channelId:'starverse-live',route:'/starverse',kind:'network',note:'Talent showcases, auditions and competitions'},
 {id:'who-wants-to-be-a-star',dial:7,label:'Who Wants to Be a Star',channelId:'isaiah-ai-tv',route:'/isaiah-ai-tv',kind:'show',note:'Show entry under Isaiah AI TV; show-specific playback needs an authorized published program'},
 {id:'servants-of-christ-network',dial:8,label:'Servants of Christ Ministry',channelId:'servants-of-christ-network',route:'/servants-of-christ',kind:'network',note:'Ministry broadcasting, teaching, worship and testimony'},
 {id:'streetverse-local-tv',dial:9,label:'StreetVerse Local TV',channelId:'streetverse-local-tv',route:'/streetverse',kind:'network',note:'Local news, community and StreetVerse field reports'}
] as const

export function stepVehicleTvPreset(current:VehicleTvPresetId,direction:-1|1):VehicleTvPreset{
 const count=STREETVERSE_VEHICLE_TV_PRESETS.length
 const index=STREETVERSE_VEHICLE_TV_PRESETS.findIndex(x=>x.id===current)
 const next=(index<0?0:index)+direction
 return STREETVERSE_VEHICLE_TV_PRESETS[(next+count)%count]
}
export function findVehicleTvPreset(id:string):VehicleTvPreset{
 return STREETVERSE_VEHICLE_TV_PRESETS.find(p=>p.id===id)??STREETVERSE_VEHICLE_TV_PRESETS[0]
}
export function currentVehicleTvListing(preset:VehicleTvPreset,feeds:readonly BroadcastFeed[]):{
 state:'programming-slot'|'no-published-feed'|'feed-listed';
 title:string;sourceLabel:string;isActualPlayback:false;route:string|null
}{
 if(!preset.channelId)return{state:'programming-slot',title:preset.note,sourceLabel:'Awaiting dedicated authorized channel feed',isActualPlayback:false,route:preset.route}
 const registered=TRYAMM_NETWORK_CHANNELS.some(x=>x.id===preset.channelId)
 if(!registered)return{state:'no-published-feed',title:'Channel is not registered',sourceLabel:'No current listing',isActualPlayback:false,route:preset.route}
 const candidate=feeds.find(f=>f.channelId===preset.channelId &&
  (preset.kind!=='show'||/who wants to be a star/i.test(f.title)) &&
  typeof f.title==='string'&&f.title.length>0)
 if(!candidate)return{state:'no-published-feed',title:preset.note,sourceLabel:'No active playback verified for this selection',isActualPlayback:false,route:preset.route}
 return{state:'feed-listed',title:candidate.title,sourceLabel:candidate.live?'Broadcast OS lists a live feed; stream not verified':'Recorded/listed program; stream not verified',isActualPlayback:false,route:preset.route}
}
