export type HudScale='micro'|'earth'|'space'
export type ObjectiveState='hidden'|'available'|'active'|'complete'|'failed'

export interface HudObjective {
  id:string
  title:string
  state:ObjectiveState
  progress:number
  target?:number
  optional?:boolean
  hidden?:boolean
  hint?:string
}

export interface HudResearchThread {
  id:string
  title:string
  progress01:number
  readyToComplete:boolean
  discoveries:number
  requiredDiscoveries:number
}

export interface HudDiscovery {
  id:string
  title:string
  kind:string
  confidence:number
  verified:boolean
  scale:HudScale
}

export interface DiscoveryHUDState {
  scale:HudScale
  locationLabel:string
  missionTitle?:string
  objectives:HudObjective[]
  activeResearch?:HudResearchThread
  recentDiscoveries:HudDiscovery[]
  xp:number
  holoHint?:string
  translationLocale:string
  captions:boolean
  audioDescription:boolean
  reducedMotion:boolean
  oneHandMode:boolean
}

const clamp01=(n:number)=>Math.max(0,Math.min(1,n))

export function normalizeHUD(state:DiscoveryHUDState):DiscoveryHUDState{
  return {
    ...state,
    objectives:state.objectives.map(o=>({...o,progress:clamp01(o.progress)})),
    activeResearch:state.activeResearch?{...state.activeResearch,progress01:clamp01(state.activeResearch.progress01)}:undefined,
    recentDiscoveries:state.recentDiscoveries.slice(-6).map(d=>({...d,confidence:clamp01(d.confidence)}))
  }
}

export type HudEvent=
  | {type:'objective-progress';objectiveId:string;progress:number}
  | {type:'objective-complete';objectiveId:string}
  | {type:'discovery';discovery:HudDiscovery}
  | {type:'research-progress';progress01:number;discoveries:number}
  | {type:'holo-hint';text:string}
  | {type:'location';scale:HudScale;label:string}

export function reduceHUD(state:DiscoveryHUDState,event:HudEvent):DiscoveryHUDState{
  if(event.type==='objective-progress') return normalizeHUD({...state,objectives:state.objectives.map(o=>o.id===event.objectiveId?{...o,state:'active',progress:event.progress}:o)})
  if(event.type==='objective-complete') return normalizeHUD({...state,objectives:state.objectives.map(o=>o.id===event.objectiveId?{...o,state:'complete',progress:1}:o)})
  if(event.type==='discovery') return normalizeHUD({...state,recentDiscoveries:[...state.recentDiscoveries,event.discovery]})
  if(event.type==='research-progress'&&state.activeResearch) return normalizeHUD({...state,activeResearch:{...state.activeResearch,progress01:event.progress01,discoveries:event.discoveries,readyToComplete:event.progress01>=1}})
  if(event.type==='holo-hint') return {...state,holoHint:event.text}
  if(event.type==='location') return {...state,scale:event.scale,locationLabel:event.label}
  return state
}

export interface DiscoveryHUDAdapterContract {
  engine:'unreal'|'unity'|'godot'|'webxr'
  bindState(state:DiscoveryHUDState):void
  announce(text:string):void
  focusObjective(objectiveId:string):void
  openResearch(threadId:string):void
  openAccessibility():void
}

export const DISCOVERY_HUD_LAYOUT={
  topLeft:['location','scale','mission-title'],
  leftRail:['objectives','research-thread'],
  rightRail:['recent-discoveries','hologpt-hint'],
  bottom:['context-action','travel-handoff','accessibility-shortcut'],
  xr:['wrist-panel','world-space-objectives','voice-hint'],
  accessibility:['captions','audio-description','reduced-motion','one-hand-mode','high-contrast','translation']
} as const

export const DISCOVERY_HUD_RULES={
  gameplayAuthority:'server/game-state',
  aiRole:'explain-translate-hint-only',
  maxVisibleRecentDiscoveries:6,
  hiddenObjectivesRemainHiddenUntilUnlocked:true,
  hardwareIndependent:true,
  engines:['unreal','unity','godot','webxr']
} as const
