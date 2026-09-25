export type StreetVerseFameRank='Unknown'|'Local Buzz'|'Rising Talent'|'City Star'|'National Star'|'Global Star'|'Icon'|'Legend'

export interface StreetVerseFameState{
  version:1
  fame:number
  talent:number
  fanbase:number
  viralScore:number
  momentum:number
  reputation:number
  relationships:number
  wealth:number
  legacy:number
  rank:StreetVerseFameRank
  updatedAt:string
}

export interface StreetVerseFameDelta{
  fame?:number
  talent?:number
  fanbase?:number
  viralScore?:number
  momentum?:number
  reputation?:number
  relationships?:number
  wealth?:number
  legacy?:number
}

const STORAGE_KEY='tryamm.streetverse.fame.v1'
const RANKS:{min:number;rank:StreetVerseFameRank}[]=[
  {min:0,rank:'Unknown'},
  {min:100,rank:'Local Buzz'},
  {min:300,rank:'Rising Talent'},
  {min:700,rank:'City Star'},
  {min:1500,rank:'National Star'},
  {min:3000,rank:'Global Star'},
  {min:5000,rank:'Icon'},
  {min:8000,rank:'Legend'},
]
const DEFAULT_STATE:StreetVerseFameState={version:1,fame:0,talent:0,fanbase:0,viralScore:0,momentum:0,reputation:0,relationships:0,wealth:0,legacy:0,rank:'Unknown',updatedAt:new Date(0).toISOString()}
let fameState:StreetVerseFameState={...DEFAULT_STATE}
let loaded=false

const emit=(name:string,detail:unknown)=>window.dispatchEvent(new CustomEvent(name,{detail}))
const clamp=(value:number,min=0,max=1_000_000)=>Math.max(min,Math.min(max,Math.round(Number.isFinite(value)?value:0)))
const rankFor=(fame:number)=>[...RANKS].reverse().find(x=>fame>=x.min)?.rank||'Unknown'
const rankIndex=(rank:StreetVerseFameRank)=>RANKS.findIndex(x=>x.rank===rank)

function readState(){
  if(loaded)return fameState
  loaded=true
  try{
    const raw=localStorage.getItem(STORAGE_KEY)
    const parsed=raw?JSON.parse(raw):null
    if(parsed&&parsed.version===1){
      const fame=clamp(Number(parsed.fame||0))
      fameState={
        version:1,
        fame,
        talent:clamp(Number(parsed.talent||0)),
        fanbase:clamp(Number(parsed.fanbase||0)),
        viralScore:clamp(Number(parsed.viralScore||0),0,100),
        momentum:clamp(Number(parsed.momentum||0),0,100),
        reputation:clamp(Number(parsed.reputation||0)),
        relationships:clamp(Number(parsed.relationships||0)),
        wealth:clamp(Number(parsed.wealth||0)),
        legacy:clamp(Number(parsed.legacy||0)),
        rank:rankFor(fame),
        updatedAt:String(parsed.updatedAt||new Date().toISOString()),
      }
    }
  }catch{}
  return fameState
}

function persistState(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(fameState))}catch{}}

function worldEffects(rank:StreetVerseFameRank){
  const level=rankIndex(rank)
  return {
    npcRecognition:level>=1,
    photoRequests:level>=1,
    crowdAttention:level>=2,
    creatorCollaborations:level>=2,
    localMedia:level>=2,
    vipAccess:level>=3,
    largerVenues:level>=3,
    sponsorshipInterest:level>=4,
    securityNeeds:level>=4,
    paparazzi:level>=5,
    rivals:level>=5,
    globalMedia:level>=5,
    awardsLane:level>=6,
    legacyMissions:level>=7,
  }
}

function publishState(reason:string,source:string,previousRank?:StreetVerseFameRank){
  persistState()
  const detail={...fameState,reason,source,effects:worldEffects(fameState.rank)}
  emit('tryamm:streetverse-fame-state',detail)
  emit('tryamm:streetverse-fame-world-reaction',detail)
  emit('tryamm:world-memory:record',{type:'streetverse-fame-state',...detail})
  if(previousRank&&previousRank!==fameState.rank){
    emit('tryamm:toast',{message:`FAME RANK UP • ${fameState.rank}`})
    emit('tryamm:streetverse-fame-rank-up',{from:previousRank,to:fameState.rank,...detail})
  }
  return detail
}

export function getStreetVerseFameState(){return {...readState(),effects:worldEffects(readState().rank)}}

export function applyStreetVerseFameDelta(delta:StreetVerseFameDelta,reason='fame-update',source='streetverse-fame-runtime'){
  readState()
  const previousRank=fameState.rank
  const fame=clamp(fameState.fame+Number(delta.fame||0))
  fameState={
    ...fameState,
    fame,
    talent:clamp(fameState.talent+Number(delta.talent||0)),
    fanbase:clamp(fameState.fanbase+Number(delta.fanbase||0)),
    viralScore:clamp(fameState.viralScore+Number(delta.viralScore||0),0,100),
    momentum:clamp(fameState.momentum+Number(delta.momentum||0),0,100),
    reputation:clamp(fameState.reputation+Number(delta.reputation||0)),
    relationships:clamp(fameState.relationships+Number(delta.relationships||0)),
    wealth:clamp(fameState.wealth+Number(delta.wealth||0)),
    legacy:clamp(fameState.legacy+Number(delta.legacy||0)),
    rank:rankFor(fame),
    updatedAt:new Date().toISOString(),
  }
  return publishState(reason,source,previousRank)
}

function unlockContextualD(kind:'fame'|'relationship',label:string,description:string,source:string){
  emit('tryamm:streetverse-special-route-unlock',{missionId:'session-active',kind,label,description,source,oneTime:true,unlockedAt:new Date().toISOString()})
}

function onMissionCompleted(event:Event){
  const d=(event as CustomEvent<Record<string,any>>).detail||{}
  const title=String(d.title||d.label||d.mission||'').toLowerCase()
  const lane=String(d.lane||d.outcome?.lane||d.metadata?.lane||'').toLowerCase()
  const category=String(d.category||'').toLowerCase()
  const starMission=/rapper|celebrity|star|music|creator|headliner/.test(`${title} ${lane} ${category}`)
  const delta:StreetVerseFameDelta=starMission
    ? {fame:35,talent:8,fanbase:120,viralScore:8,momentum:12,reputation:7,relationships:5,legacy:2}
    : {fame:8,talent:3,momentum:4,reputation:3,relationships:category==='relationship'?6:0,wealth:category==='business'?5:0,legacy:category==='story'?1:0}
  const next=applyStreetVerseFameDelta(delta,starMission?'star-mission-complete':'mission-complete','streetverse-mission')
  if(starMission&&next.relationships>=5)unlockContextualD('relationship','CALL YOUR PRODUCER CONNECTION','Use the relationship you earned to unlock a collaboration, song, video, or viral opportunity.','star-mission-relationship')
}

function onReelPublished(){
  const next=applyStreetVerseFameDelta({fame:25,fanbase:150,viralScore:15,momentum:10,talent:2,legacy:1},'reel-published','streetverse-reel')
  if(rankIndex(next.rank)>=1)unlockContextualD('fame','USE YOUR BUZZ','Leverage your growing fame, fanbase, or creator connection for a special route.','reel-fame-momentum')
}

function onMissionRoute(event:Event){
  const d=(event as CustomEvent<Record<string,unknown>>).detail||{}
  if(d.choice==='D')applyStreetVerseFameDelta({momentum:3,relationships:2},'earned-special-route-used','streetverse-mission-route')
}

export function installStreetVerseFameRuntime(){
  const runtime=window as unknown as Record<string,unknown>
  if(runtime.__streetVerseFameRuntimeInstalled)return
  runtime.__streetVerseFameRuntimeInstalled=true
  readState()
  runtime.__getStreetVerseFameState=getStreetVerseFameState
  runtime.__applyStreetVerseFameDelta=applyStreetVerseFameDelta
  window.addEventListener('tryamm:mission:completed',onMissionCompleted)
  window.addEventListener('tryamm:streetverse-reel-published',onReelPublished)
  window.addEventListener('tryamm:streetverse-mission-route-selected',onMissionRoute)
  publishState('runtime-ready','streetverse-fame-runtime')
}
