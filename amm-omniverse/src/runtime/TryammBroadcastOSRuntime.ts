import {TRYAMM_BROADCAST_NETWORK} from '../game/holographic/TryammBroadcastNetwork'
import {SERVANTS_OF_CHRIST_BROADCAST_CHANNEL} from '../game/holographic/MinistryBroadcastNetwork'
import {ISAIAH_AI_TV} from '../game/holographic/IsaiahAiTvStarVerse'

export type TryammNetworkChannelId=
  |'all-american-network'
  |'streetverse-local-tv'
  |'isaiah-ai-tv'
  |'starverse-live'
  |'servants-of-christ-network'
  |'sportsverse-live'
  |'tryamm-reality'
  |'tryamm-talk'
  |'musicverse-tv'
  |'tryamm-news'

export type TryammDistributionStatus='ready'|'package-ready'|'provider-gated'|'license-gated'

export type TryammNetworkChannel={
  id:TryammNetworkChannelId
  name:string
  lane:'general'|'local'|'faith'|'talent'|'sports'|'reality'|'talk'|'music'|'news'
  description:string
  formats:string[]
  routes:string[]
  familySafe:boolean
  live:boolean
  vod:boolean
}

export type BroadcastFeed={
  id:string
  title:string
  source:string
  channelId:TryammNetworkChannelId
  kind:'live'|'clip'|'field-report'|'sports'|'faith'|'talent'|'reality'
  startedAt:string
  live:boolean
  route?:string
  communityArea?:string
}

export type BroadcastOSState={
  activeFeeds:BroadcastFeed[]
  scheduled:number
  lastUpdated:string
}

const KEY='tryamm.broadcast-os.v1'
const MAX_FEEDS=40

export const TRYAMM_NETWORK_CHANNELS:readonly TryammNetworkChannel[]=[
  {
    id:'all-american-network',
    name:'All American Network',
    lane:'general',
    description:'Flagship network for community, creator, business, sports, entertainment and original programming.',
    formats:['showcase','reality','talk','news','business','sports','premiere'],
    routes:['/network','/network/studio'],
    familySafe:true,live:true,vod:true,
  },
  {
    id:'streetverse-local-tv',
    name:'StreetVerse Local TV',
    lane:'local',
    description:'Location-aware Chicago/StreetVerse field feeds, community stories, traffic, weather, businesses, missions and live events.',
    formats:['local-news','field-report','community-live','business-spotlight','street-sports'],
    routes:['/streetverse','/live'],
    familySafe:true,live:true,vod:true,
  },
  {
    id:'isaiah-ai-tv',
    name:ISAIAH_AI_TV.title,
    lane:'talent',
    description:'24-hour AI-assisted original programming, talent shows, talk, comedy, game shows, reality and creator showcases.',
    formats:['talent-show','talk','game-show','reality','creator-showcase','movie-block'],
    routes:['/isaiah-ai-tv','/starverse'],
    familySafe:true,live:true,vod:true,
  },
  {
    id:'starverse-live',
    name:'StarVerse • Anyone Can Be a Star',
    lane:'talent',
    description:'Auditions, challenges, live voting, creator development and breakout talent programming.',
    formats:['audition','competition','showcase','aftershow','creator-doc'],
    routes:['/starverse','/live'],
    familySafe:true,live:true,vod:true,
  },
  {
    id:'servants-of-christ-network',
    name:SERVANTS_OF_CHRIST_BROADCAST_CHANNEL.title,
    lane:'faith',
    description:'Worship, teaching, Bible study, praise, testimony, youth and community-service programming.',
    formats:[...SERVANTS_OF_CHRIST_BROADCAST_CHANNEL.formats],
    routes:['/servants-of-christ','/faithverse','/live'],
    familySafe:true,live:true,vod:true,
  },
  {
    id:'sportsverse-live',
    name:'SportsVerse LIVE',
    lane:'sports',
    description:'Boxing, basketball, world games, interviews, score desks, tournaments and community sports events.',
    formats:['boxing','basketball','world-games','sports-desk','interview','ppv-eligible-event'],
    routes:['/sportverse','/live'],
    familySafe:true,live:true,vod:true,
  },
  {
    id:'tryamm-reality',
    name:'TRYAMM Reality',
    lane:'reality',
    description:'Original reality series, StreetVerse docu-reality, creator houses, competition formats and aftershows.',
    formats:['docu-reality','competition-reality','creator-house','streetverse-reality','aftershow'],
    routes:['/reality-tv','/network/studio'],
    familySafe:false,live:true,vod:true,
  },
  {
    id:'tryamm-talk',
    name:'TRYAMM Talk',
    lane:'talk',
    description:'Talk shows, interviews, podcasts, community conversations and expert panels.',
    formats:['talk-show','interview','panel','podcast-video','town-hall'],
    routes:['/network/studio','/live'],
    familySafe:true,live:true,vod:true,
  },
  {
    id:'musicverse-tv',
    name:'MusicVerse TV',
    lane:'music',
    description:'Music videos, live performances, radio simulcast, artist showcases and licensed music programming.',
    formats:['music-video','live-performance','artist-showcase','radio-simulcast','countdown'],
    routes:['/musicverse','/live'],
    familySafe:true,live:true,vod:true,
  },
  {
    id:'tryamm-news',
    name:'TRYAMM News',
    lane:'news',
    description:'Local/community, business, culture, sports and sourced news programming with provenance controls.',
    formats:['local-news','global-news','weather','traffic','business-news','sports-news'],
    routes:['/network','/streetverse'],
    familySafe:true,live:true,vod:true,
  },
] as const

export const TRYAMM_DISTRIBUTION_MATRIX=[
  {id:'tryamm-app',label:'TRYAMM App / Web',status:'ready' as const,note:'First-party internet distribution.'},
  {id:'holo-live',label:'Holo LIVE',status:'ready' as const,note:'Interactive live distribution inside TRYAMM.'},
  {id:'reels-vod',label:'Reels + Replay/VOD',status:'ready' as const,note:'Clip and on-demand distribution inside TRYAMM.'},
  {id:'fast',label:'FAST / Linear Stream Package',status:'package-ready' as const,note:'EPG, rights and stream package can be prepared; external carriage needs a partner.'},
  {id:'ctv-ott',label:'CTV / OTT',status:'package-ready' as const,note:'App/feed package can be generated; provider credentials/contracts remain required.'},
  {id:'roku-app',label:'Roku Streaming App',status:'provider-gated' as const,note:'Requires Roku app package, developer account, certification and content rights.'},
  {id:'roku-channel',label:'The Roku Channel Distribution',status:'provider-gated' as const,note:'Requires partner/distribution acceptance by Roku.'},
  {id:'cable',label:'Cable / MVPD Carriage',status:'provider-gated' as const,note:'Requires carriage/distribution agreement with a cable/MVPD operator.'},
  {id:'ota-fcc',label:'Over-the-Air Local TV',status:'license-gated' as const,note:'Actual terrestrial broadcast requires the appropriate FCC authorization/license and compliant transmission facilities.'},
] as const

function read():BroadcastOSState{
  try{
    const raw=JSON.parse(localStorage.getItem(KEY)||'null')
    return {
      activeFeeds:Array.isArray(raw?.activeFeeds)?raw.activeFeeds.slice(0,MAX_FEEDS):[],
      scheduled:Number(raw?.scheduled||0),
      lastUpdated:String(raw?.lastUpdated||new Date().toISOString()),
    }
  }catch{return{activeFeeds:[],scheduled:0,lastUpdated:new Date().toISOString()}}
}
function save(state:BroadcastOSState){try{localStorage.setItem(KEY,JSON.stringify(state))}catch{}}
function emit(state:BroadcastOSState,reason:string){
  window.dispatchEvent(new CustomEvent('tryamm:broadcast-os-state',{detail:{
    ...state,
    reason,
    network:TRYAMM_BROADCAST_NETWORK,
    channels:TRYAMM_NETWORK_CHANNELS,
    distribution:TRYAMM_DISTRIBUTION_MATRIX,
  }}))
}
function addFeed(state:BroadcastOSState,feed:BroadcastFeed){
  state.activeFeeds=[feed,...state.activeFeeds.filter(x=>x.id!==feed.id)].slice(0,MAX_FEEDS)
  state.lastUpdated=new Date().toISOString()
  save(state);emit(state,'feed')
}
function nowId(prefix:string){return prefix+'-'+Date.now().toString(36)}

export function installTryammBroadcastOSRuntime(){
  if(typeof window==='undefined')return()=>{}
  let state=read()

  const onRequest=()=>emit(state,'request')
  const onLive=(event:Event)=>{
    const d=(event as CustomEvent<Record<string,unknown>>).detail||{}
    const source=String(d.source||'tryamm-live')
    const title=String(d.title||d.programTitle||'TRYAMM LIVE')
    const street=/streetverse/i.test(source+title)
    const faith=/faith|servants|ministry|worship/i.test(source+title)
    const sports=/sport|boxing|basketball|world games/i.test(source+title)
    const channelId:TryammNetworkChannelId=faith?'servants-of-christ-network':sports?'sportsverse-live':street?'streetverse-local-tv':'all-american-network'
    addFeed(state,{id:String(d.roomId||d.id||nowId('live')),title,source,channelId,kind:faith?'faith':sports?'sports':street?'field-report':'live',startedAt:new Date().toISOString(),live:d.live!==false,route:'/live'})
  }
  const onLiveEnd=(event:Event)=>{
    const d=(event as CustomEvent<Record<string,unknown>>).detail||{}
    const id=String(d.roomId||d.id||'')
    state.activeFeeds=state.activeFeeds.map(x=>id&&x.id===id?{...x,live:false}:x)
    state.lastUpdated=new Date().toISOString();save(state);emit(state,'live-end')
  }
  const onMission=(event:Event)=>{
    const d=(event as CustomEvent<Record<string,unknown>>).detail||{}
    addFeed(state,{id:nowId('field'),title:String(d.title||d.missionTitle||'StreetVerse Field Report'),source:'streetverse-mission',channelId:'streetverse-local-tv',kind:'field-report',startedAt:new Date().toISOString(),live:false,route:'/streetverse',communityArea:String(d.communityAreaNumber||'')||undefined})
  }
  const onReel=(event:Event)=>{
    const d=(event as CustomEvent<Record<string,unknown>>).detail||{}
    addFeed(state,{id:String(d.id||d.reelId||nowId('reel')),title:String(d.title||'Creator Reel'),source:'reels',channelId:'all-american-network',kind:'clip',startedAt:new Date().toISOString(),live:false,route:String(d.route||'/reels')})
  }
  const onSports=(event:Event)=>{
    const d=(event as CustomEvent<Record<string,unknown>>).detail||{}
    addFeed(state,{id:String(d.id||nowId('sports')),title:String(d.title||d.label||'SportsVerse Event'),source:'sportsverse',channelId:'sportsverse-live',kind:'sports',startedAt:new Date().toISOString(),live:Boolean(d.live),route:'/sportverse'})
  }
  const onTalent=(event:Event)=>{
    const d=(event as CustomEvent<Record<string,unknown>>).detail||{}
    addFeed(state,{id:String(d.id||nowId('star')),title:String(d.title||'StarVerse Showcase'),source:'starverse',channelId:'starverse-live',kind:'talent',startedAt:new Date().toISOString(),live:Boolean(d.live),route:'/starverse'})
  }
  const onSchedule=()=>{state.scheduled+=1;state.lastUpdated=new Date().toISOString();save(state);emit(state,'scheduled')}

  addEventListener('tryamm:broadcast-os-request',onRequest)
  addEventListener('tryamm:live-session',onLive)
  addEventListener('tryamm:live-session-end',onLiveEnd)
  addEventListener('tryamm:streetverse-mission-complete',onMission)
  addEventListener('tryamm:reel-published',onReel)
  addEventListener('tryamm:sportverse-world-games-event',onSports)
  addEventListener('tryamm:starverse-showcase',onTalent)
  addEventListener('tryamm:broadcast-program-scheduled',onSchedule)
  emit(state,'startup')

  return()=>{
    removeEventListener('tryamm:broadcast-os-request',onRequest)
    removeEventListener('tryamm:live-session',onLive)
    removeEventListener('tryamm:live-session-end',onLiveEnd)
    removeEventListener('tryamm:streetverse-mission-complete',onMission)
    removeEventListener('tryamm:reel-published',onReel)
    removeEventListener('tryamm:sportverse-world-games-event',onSports)
    removeEventListener('tryamm:starverse-showcase',onTalent)
    removeEventListener('tryamm:broadcast-program-scheduled',onSchedule)
  }
}
