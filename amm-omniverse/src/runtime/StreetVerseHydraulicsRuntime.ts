export type HydraulicMode='ride'|'front-up'|'rear-up'|'left-up'|'right-up'|'three-wheel-left'|'three-wheel-right'|'show-hop'

export type HydraulicState={
  front:number
  rear:number
  left:number
  right:number
  pressure:number
  heat:number
  mode:HydraulicMode
  showZone:boolean
}

export const DEFAULT_HYDRAULIC_STATE:HydraulicState={
  front:.22,rear:.22,left:.22,right:.22,pressure:1,heat:0,mode:'ride',showZone:false,
}

const clamp=(n:number,min=0,max=1)=>Math.max(min,Math.min(max,n))

export function applyHydraulicMode(state:HydraulicState,mode:HydraulicMode):HydraulicState{
  // Game simulation only: normalized suspension values, not real hydraulic-system instructions.
  const base={...state,mode}
  if(!state.showZone&&mode==='show-hop')return{...base,mode:'ride'}
  const next={
    ride:{front:.22,rear:.22,left:.22,right:.22},
    'front-up':{front:.92,rear:.24,left:.58,right:.58},
    'rear-up':{front:.24,rear:.92,left:.58,right:.58},
    'left-up':{front:.56,rear:.56,left:.94,right:.18},
    'right-up':{front:.56,rear:.56,left:.18,right:.94},
    'three-wheel-left':{front:.72,rear:.52,left:.96,right:.14},
    'three-wheel-right':{front:.72,rear:.52,left:.14,right:.96},
    'show-hop':{front:1,rear:.42,left:.72,right:.72},
  }[mode]
  const effort=mode==='ride'?0:.055
  return{
    ...base,
    ...next,
    pressure:clamp(state.pressure-effort),
    heat:clamp(state.heat+(mode==='show-hop'?.09:.035)),
  }
}

export function recoverHydraulics(state:HydraulicState,dtSeconds:number){
  return{
    ...state,
    pressure:clamp(state.pressure+dtSeconds*.08),
    heat:clamp(state.heat-dtSeconds*.06),
  }
}

export function hydraulicPerformanceAllowed(state:HydraulicState){
  return state.showZone&&state.pressure>=.18&&state.heat<=.88
}

export const STREETVERSE_HYDRAULIC_RULES={
  simulatedOnly:true,
  noRealWorldInstallationInstructions:true,
  showHopOnlyInDesignatedShowZones:true,
  ordinaryRoadMode:'ride',
  missionUses:['car shows','lowrider meets','style judging','photo/reel challenges','restoration shop training'],
  accessibility:['large one-hand buttons','voice commands','hold-to-preview','reduced-motion mode'],
} as const
