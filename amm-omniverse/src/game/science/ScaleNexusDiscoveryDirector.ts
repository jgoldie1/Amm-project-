export type ScaleBand='micro'|'human'|'planetary'|'orbital'|'solar'
export type DiscoveryKind='material'|'biology-sim'|'technology'|'environment'|'astronomy'|'signal'|'artifact-fiction'

export interface DiscoveryRecord {
  id:string
  kind:DiscoveryKind
  scale:ScaleBand
  sourceId:string
  title:string
  evidenceIds:string[]
  verified:boolean
  confidence:number
  tags:string[]
}

export interface ResearchThread {
  id:string
  title:string
  requiredScales:ScaleBand[]
  requiredTags:string[]
  discoveries:string[]
  status:'locked'|'active'|'ready'|'completed'
  rewardXp:number
  unlockIds:string[]
  teenSafe:boolean
}

export interface ResearchState {
  discoveries:DiscoveryRecord[]
  threads:ResearchThread[]
  xp:number
  unlocks:string[]
}

const unique=<T>(xs:T[])=>[...new Set(xs)]

export function addDiscovery(state:ResearchState,d:DiscoveryRecord):ResearchState{
  if(state.discoveries.some(x=>x.id===d.id)) return state
  const discoveries=[...state.discoveries,{...d,confidence:Math.max(0,Math.min(1,d.confidence))}]
  const threads=state.threads.map(t=>{
    if(t.status==='completed') return t
    const matches=discoveries.filter(x=>t.requiredScales.includes(x.scale)&&t.requiredTags.some(tag=>x.tags.includes(tag)))
    const scales=new Set(matches.map(x=>x.scale))
    const tags=new Set(matches.flatMap(x=>x.tags))
    const ready=t.requiredScales.every(s=>scales.has(s))&&t.requiredTags.every(tag=>tags.has(tag))
    return {...t,discoveries:unique([...t.discoveries,...matches.map(x=>x.id)]),status:ready?'ready':'active'}
  })
  return {...state,discoveries,threads}
}

export function completeResearchThread(state:ResearchState,threadId:string):ResearchState{
  const thread=state.threads.find(t=>t.id===threadId)
  if(!thread||thread.status!=='ready') return state
  return {
    ...state,
    xp:state.xp+thread.rewardXp,
    unlocks:unique([...state.unlocks,...thread.unlockIds]),
    threads:state.threads.map(t=>t.id===threadId?{...t,status:'completed'}:t)
  }
}

export const SCALE_RESEARCH_THREADS:ResearchThread[]=[
  {id:'thread-dust-to-stars',title:'Dust to Stars',requiredScales:['micro','planetary','orbital'],requiredTags:['mineral','atmosphere','spectral'],discoveries:[],status:'locked',rewardXp:1200,unlockIds:['holo-lab-dust-to-stars','orbital-spectrometer-mission'],teenSafe:true},
  {id:'thread-signal-across-scale',title:'Signal Across Scale',requiredScales:['micro','human','orbital'],requiredTags:['circuit','network','relay'],discoveries:[],status:'locked',rewardXp:1000,unlockIds:['signal-hunter-badge','deep-relay-quest'],teenSafe:true},
  {id:'thread-worlds-within-worlds',title:'Worlds Within Worlds',requiredScales:['micro','human','planetary','solar'],requiredTags:['pattern','structure'],discoveries:[],status:'locked',rewardXp:2000,unlockIds:['scale-nexus-master','hidden-scale-portal'],teenSafe:true}
]

export interface EngineSceneHandoff {
  destinationScale:ScaleBand
  destinationId:string
  unrealLevel:string
  unityScene:string
  godotScene:string
  webRoute:string
  preserve:['player','inventory','missions','discoveries','accessibility','language','party']
}

export function createScaleHandoff(destinationScale:ScaleBand,destinationId:string):EngineSceneHandoff{
  const safe=destinationId.replace(/[^a-zA-Z0-9_-]/g,'-')
  return {
    destinationScale,
    destinationId,
    unrealLevel:`/Game/LivingWorlds/${destinationScale}/${safe}`,
    unityScene:`LivingWorlds/${destinationScale}/${safe}`,
    godotScene:`res://living_worlds/${destinationScale}/${safe}.tscn`,
    webRoute:`/living/${destinationScale}/${safe}`,
    preserve:['player','inventory','missions','discoveries','accessibility','language','party']
  }
}

export const SCALE_NEXUS_DISCOVERY_RULES={
  aiRole:'guide-label-translate-suggest',
  authoritativeProgression:'game-server',
  realScienceRule:'Clearly separate simulations and fictional discoveries from imported real scientific data.',
  medicalRule:'Microscope observations never provide medical diagnosis.',
  telescopeRule:'Observation modes do not claim detail beyond the source data.',
  teenRule:'Teen Takeover receives only age-appropriate research threads and social features.'
} as const
