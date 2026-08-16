import { advancePortalLens, buildConeLensProfile, chooseFocusTarget, computeAdaptiveFocalDistance, renderPath, type AccessibilityLensPrefs, type ConeLensMode, type DeviceTier, type FocusTarget, type PortalLensState } from './QuantumConeLensRuntime'

export type GameplayFocusContext='living-earth-portal'|'basketball'|'boxing'|'mma'|'football'|'volcano-racers'|'broadcast'

export interface GameplayFocusState {
  context:GameplayFocusContext
  mode:ConeLensMode
  tier:DeviceTier
  prefs:AccessibilityLensPrefs
  focalDistanceM:number
  activeTargetId?:string
  portal?:PortalLensState
}

export function lensModeForContext(context:GameplayFocusContext):ConeLensMode{
  if(context==='living-earth-portal') return 'portal'
  if(context==='broadcast') return 'broadcast'
  if(['basketball','boxing','mma','football','volcano-racers'].includes(context)) return 'sports-focus'
  return 'cinematic'
}

export function createGameplayFocusState(context:GameplayFocusContext,tier:DeviceTier,prefs:AccessibilityLensPrefs,destinationId?:string):GameplayFocusState{
  const mode=lensModeForContext(context)
  const profile=buildConeLensProfile(mode,tier,prefs)
  return {
    context,mode,tier,prefs,focalDistanceM:profile.focalDistanceM,
    portal:context==='living-earth-portal'?{phase:'idle',progress:0,destinationId}:undefined
  }
}

export function updateGameplayFocus(state:GameplayFocusState,targets:FocusTarget[],dtSeconds:number,streamReady=false){
  const selected=chooseFocusTarget(targets)
  const targetDistance=selected?Math.sqrt(selected.x**2+selected.y**2+selected.z**2):state.focalDistanceM
  const nextDistance=computeAdaptiveFocalDistance(state.focalDistanceM,targetDistance,dtSeconds)
  const portal=state.portal?advancePortalLens(state.portal,streamReady,dtSeconds):undefined
  return {...state,focalDistanceM:nextDistance,activeTargetId:selected?.id,portal}
}

export function basketballFocusTargets(ball:{x:number;y:number;z:number},players:{id:string;x:number;y:number;z:number;hasBall?:boolean;highlight?:boolean}[]):FocusTarget[]{
  return [
    {id:'ball',x:ball.x,y:ball.y,z:ball.z,priority:100,visible:true},
    ...players.map(p=>({id:p.id,x:p.x,y:p.y,z:p.z,priority:p.hasBall?95:p.highlight?85:55,visible:true}))
  ]
}

export function fightFocusTargets(fighters:{id:string;x:number;y:number;z:number;stunned?:boolean;attacking?:boolean}[]):FocusTarget[]{
  return fighters.map(f=>({id:f.id,x:f.x,y:f.y,z:f.z,priority:f.stunned?95:f.attacking?90:70,visible:true}))
}

export function footballFocusTargets(ball:{x:number;y:number;z:number},players:{id:string;x:number;y:number;z:number;carrier?:boolean;receiver?:boolean;defender?:boolean}[]):FocusTarget[]{
  return [
    {id:'football',x:ball.x,y:ball.y,z:ball.z,priority:100,visible:true},
    ...players.map(p=>({id:p.id,x:p.x,y:p.y,z:p.z,priority:p.carrier?98:p.receiver?88:p.defender?82:50,visible:true}))
  ]
}

export function racingFocusTargets(vehicles:{id:string;x:number;y:number;z:number;player?:boolean;leader?:boolean;boosting?:boolean}[]):FocusTarget[]{
  return vehicles.map(v=>({id:v.id,x:v.x,y:v.y,z:v.z,priority:v.player?100:v.leader?92:v.boosting?86:55,visible:true}))
}

export function portalFocusTarget(position:{x:number;y:number;z:number},destinationId:string):FocusTarget[]{
  return [{id:`portal:${destinationId}`,x:position.x,y:position.y,z:position.z,priority:100,visible:true}]
}

export function gameplayLensSnapshot(state:GameplayFocusState){
  const profile=buildConeLensProfile(state.mode,state.tier,state.prefs)
  return {
    context:state.context,
    mode:state.mode,
    renderPath:renderPath(state.tier),
    focalDistanceM:state.focalDistanceM,
    activeTargetId:state.activeTargetId??null,
    portalPhase:state.portal?.phase??null,
    portalProgress:state.portal?.progress??null,
    profile
  }
}

export const CONE_LENS_GAMEPLAY_INTEGRATION={
  systems:['living-earth-portals','basketball','boxing','mma','football','volcano-racers','broadcast-replays'],
  optionalHardware:true,
  gracefulFallback:true,
  rule:'Gameplay remains authoritative; the lens may emphasize or present action but never changes scores, physics, combat outcomes, or travel authorization.'
} as const
