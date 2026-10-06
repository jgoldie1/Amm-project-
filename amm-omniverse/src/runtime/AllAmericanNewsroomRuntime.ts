export type NewsDeskId=
  |'local'
  |'national'
  |'international'
  |'weather-traffic'
  |'sports'
  |'entertainment'
  |'business-funding'
  |'crypto-education'
  |'community'
  |'creator-culture'
  |'fact-source'

export type TrafficPhase='BOOTSTRAP'|'SCOUT'|'AUDITION'|'ROSTER'

export type NetworkAudienceMetrics={
  verified:boolean
  weeklyUniqueViewers:number
  averageConcurrent:number
  weeklyWatchHours:number
  measuredAt:string
  source:string
}

export type HostCandidate={
  userId:string
  displayName:string
  creatorMode:boolean
  live:boolean
  discoveredAt:string
  phase:'candidate'|'invited'|'audition'|'trial-shift'|'roster'
  strengths:string[]
}

export type NewsroomShow={
  id:string
  title:string
  desk:NewsDeskId
  startHour:number
  durationMinutes:number
  hostMode:'ai-assisted'|'real-host'|'hybrid'
  repeatable:boolean
  liveEligible:boolean
}

export type NewsroomState={
  trafficPhase:TrafficPhase
  metrics:NetworkAudienceMetrics|null
  candidates:HostCandidate[]
  schedule:NewsroomShow[]
  updatedAt:string
}

const KEY='tryamm.all-american-newsroom.v1'
const MAX_CANDIDATES=80

export const HOST_SCOUT_THRESHOLDS={
  scoutWeeklyUnique:500,
  auditionWeeklyUnique:2500,
  rosterWeeklyUnique:10000,
} as const

export const ALL_AMERICAN_NEWS_DESKS=[
  {id:'local',label:'Local News',purpose:'Chicago, Illinois, neighborhood and community coverage.',requiresSourcedReporting:true},
  {id:'national',label:'National News',purpose:'U.S. headlines, policy, economy and public-interest explainers.',requiresSourcedReporting:true},
  {id:'international',label:'International News',purpose:'Africa/Nigeria, BRICS, global affairs and international interviews.',requiresSourcedReporting:true},
  {id:'weather-traffic',label:'Weather + Traffic',purpose:'Forecasts, severe weather, transit and mobility using official/provider feeds.',requiresSourcedReporting:true},
  {id:'sports',label:'Sports Desk',purpose:'Local, national and international sports, scores, interviews and SportsVerse handoff.',requiresSourcedReporting:true},
  {id:'entertainment',label:'Entertainment',purpose:'Music, film, TV, creators, culture and event coverage.',requiresSourcedReporting:true},
  {id:'business-funding',label:'Business + Funding',purpose:'Small business, grants, contracts, markets, jobs and creator economy.',requiresSourcedReporting:true},
  {id:'crypto-education',label:'Crypto Education',purpose:'Blockchain basics, wallets, scams, custody, stablecoins, regulation, taxes and security education.',requiresSourcedReporting:true},
  {id:'community',label:'Community Desk',purpose:'Schools, churches, nonprofits, neighborhoods and local events.',requiresSourcedReporting:true},
  {id:'creator-culture',label:'Creator Culture',purpose:'TRYAMM creators, LIVE, Reels, fashion, music and emerging talent.',requiresSourcedReporting:true},
  {id:'fact-source',label:'Fact + Source Desk',purpose:'Source cards, timestamps, corrections, rights checks and provenance before publish.',requiresSourcedReporting:true},
] as const

export const NEWSROOM_TEAM=[
  'Executive Producer',
  'Managing Editor',
  'Assignment Editor',
  'News Director',
  'Local Anchor',
  'National Anchor',
  'International Anchor',
  'Weather / Traffic Host',
  'Sports Host',
  'Entertainment Host',
  'Business / Funding Host',
  'Crypto Education Host',
  'Community Correspondent',
  'Creator Culture Host',
  'Fact / Source Producer',
  'Show Producer',
  'Technical Director',
  'Audio Engineer',
  'Graphics / Lower Thirds',
  'Teleprompter / Rundown Producer',
  'Social / Reel Clip Producer',
  'Audience / Community Producer',
] as const

export const CRYPTO_EDUCATION_RULES={
  educationOnly:true,
  personalizedInvestmentAdvice:false,
  pricePredictions:false,
  guaranteedReturns:false,
  pumpOrManipulation:false,
  sourceAndTimestampRequired:true,
  sponsorshipDisclosureRequired:true,
  scamAndSecurityEducation:true,
  custodyRiskDisclosure:true,
  regulationAndTaxTopicsRequireJurisdictionLabel:true,
} as const

export const DEFAULT_NEWSROOM_SCHEDULE:NewsroomShow[]=[
  {id:'morning',title:'All American Morning',desk:'local',startHour:6,durationMinutes:120,hostMode:'hybrid',repeatable:true,liveEligible:true},
  {id:'community',title:'Chicago + Community Live',desk:'community',startHour:9,durationMinutes:60,hostMode:'hybrid',repeatable:true,liveEligible:true},
  {id:'midday',title:'Midday News Update',desk:'national',startHour:12,durationMinutes:60,hostMode:'hybrid',repeatable:true,liveEligible:true},
  {id:'business-crypto',title:'Business, Funding + Crypto Education',desk:'crypto-education',startHour:14,durationMinutes:60,hostMode:'hybrid',repeatable:true,liveEligible:true},
  {id:'sports',title:'SportsVerse Desk',desk:'sports',startHour:16,durationMinutes:60,hostMode:'hybrid',repeatable:true,liveEligible:true},
  {id:'prime',title:'All American Prime News',desk:'local',startHour:18,durationMinutes:60,hostMode:'hybrid',repeatable:true,liveEligible:true},
  {id:'creator',title:'Creator Culture Live',desk:'creator-culture',startHour:20,durationMinutes:60,hostMode:'hybrid',repeatable:true,liveEligible:true},
  {id:'world',title:'World + International',desk:'international',startHour:22,durationMinutes:60,hostMode:'hybrid',repeatable:true,liveEligible:true},
  {id:'overnight',title:'Overnight News Loop',desk:'fact-source',startHour:23,durationMinutes:420,hostMode:'ai-assisted',repeatable:true,liveEligible:false},
]

function phaseFor(metrics:NetworkAudienceMetrics|null):TrafficPhase{
  if(!metrics?.verified)return'BOOTSTRAP'
  if(metrics.weeklyUniqueViewers>=HOST_SCOUT_THRESHOLDS.rosterWeeklyUnique)return'ROSTER'
  if(metrics.weeklyUniqueViewers>=HOST_SCOUT_THRESHOLDS.auditionWeeklyUnique)return'AUDITION'
  if(metrics.weeklyUniqueViewers>=HOST_SCOUT_THRESHOLDS.scoutWeeklyUnique)return'SCOUT'
  return'BOOTSTRAP'
}

function initial():NewsroomState{
  return{trafficPhase:'BOOTSTRAP',metrics:null,candidates:[],schedule:DEFAULT_NEWSROOM_SCHEDULE,updatedAt:new Date().toISOString()}
}
function read():NewsroomState{
  try{
    const raw=JSON.parse(localStorage.getItem(KEY)||'null')
    const base=initial()
    if(!raw)return base
    return{
      ...base,
      ...raw,
      metrics:raw.metrics?.verified?raw.metrics:null,
      candidates:Array.isArray(raw.candidates)?raw.candidates.slice(0,MAX_CANDIDATES):[],
      schedule:Array.isArray(raw.schedule)&&raw.schedule.length?raw.schedule:DEFAULT_NEWSROOM_SCHEDULE,
      trafficPhase:phaseFor(raw.metrics?.verified?raw.metrics:null),
      updatedAt:new Date().toISOString(),
    }
  }catch{return initial()}
}
function save(state:NewsroomState){try{localStorage.setItem(KEY,JSON.stringify(state))}catch{}}
function emit(state:NewsroomState,reason:string){
  window.dispatchEvent(new CustomEvent('tryamm:all-american-newsroom-state',{detail:{
    ...state,
    reason,
    desks:ALL_AMERICAN_NEWS_DESKS,
    team:NEWSROOM_TEAM,
    hostScoutThresholds:HOST_SCOUT_THRESHOLDS,
    cryptoEducationRules:CRYPTO_EDUCATION_RULES,
    aiAssistanceMustBeLabeled:true,
    humanPublishApprovalRequired:true,
    realHostRecruitmentUsesVerifiedTrafficOnly:true,
  }}))
}

function candidateStrengths(input:{live?:boolean;creatorMode?:boolean;displayName?:string}){
  const out:string[]=[]
  if(input.live)out.push('live-experience')
  if(input.creatorMode)out.push('creator-mode')
  if(String(input.displayName||'').trim())out.push('public-profile')
  return out
}

export function installAllAmericanNewsroomRuntime(){
  if(typeof window==='undefined')return()=>{}
  let state=read()

  const publish=(reason:string)=>{state.trafficPhase=phaseFor(state.metrics);state.updatedAt=new Date().toISOString();save(state);emit(state,reason)}

  const onRequest=()=>publish('request')
  const onMetrics=(event:Event)=>{
    const d=(event as CustomEvent<Partial<NetworkAudienceMetrics>>).detail||{}
    if(d.verified!==true)return
    state.metrics={
      verified:true,
      weeklyUniqueViewers:Math.max(0,Number(d.weeklyUniqueViewers||0)),
      averageConcurrent:Math.max(0,Number(d.averageConcurrent||0)),
      weeklyWatchHours:Math.max(0,Number(d.weeklyWatchHours||0)),
      measuredAt:String(d.measuredAt||new Date().toISOString()),
      source:String(d.source||'verified-network-analytics'),
    }
    publish('verified-metrics')
  }

  const onPresence=(event:Event)=>{
    if(state.trafficPhase==='BOOTSTRAP')return
    const d=(event as CustomEvent<{players?:Array<{userId?:string;displayName?:string;live?:boolean;creatorMode?:boolean}>}>).detail||{}
    for(const player of d.players||[]){
      const userId=String(player.userId||'').trim()
      if(!userId||player.creatorMode!==true)continue
      const existing=state.candidates.find(x=>x.userId===userId)
      if(existing){
        existing.live=Boolean(player.live)
        existing.displayName=String(player.displayName||existing.displayName)
        existing.strengths=Array.from(new Set([...existing.strengths,...candidateStrengths(player)]))
      }else{
        state.candidates.unshift({
          userId,
          displayName:String(player.displayName||'TRYAMM Creator'),
          creatorMode:true,
          live:Boolean(player.live),
          discoveredAt:new Date().toISOString(),
          phase:'candidate',
          strengths:candidateStrengths(player),
        })
      }
    }
    state.candidates=state.candidates.slice(0,MAX_CANDIDATES)
    publish('presence-scout')
  }

  const onStage=(event:Event)=>{
    const d=(event as CustomEvent<{userId?:string;phase?:HostCandidate['phase']}>).detail||{}
    const row=state.candidates.find(x=>x.userId===d.userId)
    if(!row||!d.phase)return
    row.phase=d.phase
    publish('candidate-stage')
  }

  const onInvite=(event:Event)=>{
    const d=(event as CustomEvent<{userId?:string}>).detail||{}
    const row=state.candidates.find(x=>x.userId===d.userId)
    if(!row)return
    if(state.trafficPhase==='BOOTSTRAP')return
    row.phase='invited'
    window.dispatchEvent(new CustomEvent('tryamm:streetverse-player-action-send',{detail:{
      toUserId:row.userId,
      action:'all-american-network-host-audition-invite',
      network:'all-american-network',
      newsroom:true,
      source:'host-scout',
    }}))
    publish('candidate-invited')
  }

  addEventListener('tryamm:all-american-newsroom-request',onRequest)
  addEventListener('tryamm:network-audience-metrics',onMetrics)
  addEventListener('tryamm:streetverse-multiplayer-presence',onPresence)
  addEventListener('tryamm:network-host-stage',onStage)
  addEventListener('tryamm:network-host-invite',onInvite)

  publish('startup')

  return()=>{
    removeEventListener('tryamm:all-american-newsroom-request',onRequest)
    removeEventListener('tryamm:network-audience-metrics',onMetrics)
    removeEventListener('tryamm:streetverse-multiplayer-presence',onPresence)
    removeEventListener('tryamm:network-host-stage',onStage)
    removeEventListener('tryamm:network-host-invite',onInvite)
  }
}
