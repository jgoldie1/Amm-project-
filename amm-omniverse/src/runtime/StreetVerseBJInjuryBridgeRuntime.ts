import type {BJHapticCue} from './StreetVerseBJHapticRuntime'

export type BJInjuryKind='shot'|'stab'|'blunt'|'fall'|'recovery'|'hospital-discharge'
export type BJInjuryState={health:number;injured:boolean;lastInjury:BJInjuryKind|null}
export const initialBJInjuryState=():BJInjuryState=>({health:100,injured:false,lastInjury:null})
export function applyBJInjury(previous:BJInjuryState,kind:BJInjuryKind):{state:BJInjuryState;cue:BJHapticCue;requiresMedicalHelp:boolean}{
  const damage:Record<BJInjuryKind,number>={shot:30,stab:24,blunt:12,fall:8,recovery:-35,'hospital-discharge':-100}
  const health=Math.max(0,Math.min(100,previous.health-damage[kind]))
  const injured=health<100
  const cue:BJHapticCue=(kind==='recovery'||kind==='hospital-discharge')?'recovery':kind==='shot'||kind==='stab'?'major-hit':'minor-hit'
  return {state:{health,injured,lastInjury:kind},cue,requiresMedicalHelp:health<=40}
}
/** Gameplay-only event: no real-world injury or medical diagnosis. */
export function dispatchBJInjury(kind:BJInjuryKind){
  if(typeof window!=='undefined')window.dispatchEvent(new CustomEvent('tryamm:streetverse-bj-injury',{detail:{kind}}))
}

// Fictional RP pain and body-region assessment; never a medical diagnosis.
export type BJBodyRegion='head'|'chest'|'abdomen'|'left-arm'|'right-arm'|'left-leg'|'right-leg'
export type BJPainLevel='none'|'mild'|'moderate'|'severe'
export type BJInjuryAssessment={
  region:BJBodyRegion
  pain:BJPainLevel
  painScore:number
  mobility:'normal'|'limited'|'assisted'
  needsTriage:boolean
  potentialOrganImpact:readonly string[]
}
const REGION_ORGANS:Record<BJBodyRegion,readonly string[]>={
  head:[],chest:['heart','left-lung','right-lung'],
  abdomen:['liver','stomach','left-kidney','right-kidney','small-intestine','large-intestine'],
  'left-arm':[],'right-arm':[],'left-leg':[],'right-leg':[],
}
export function assessBJInjury(state:BJInjuryState,region:BJBodyRegion='chest'):BJInjuryAssessment{
  const painScore=state.injured?Math.min(10,Math.max(1,Math.ceil((100-state.health)/10))):0
  const pain:BJPainLevel=painScore===0?'none':painScore<=3?'mild':painScore<=6?'moderate':'severe'
  return {
    region,pain,painScore,
    mobility:state.health<=40?'assisted':state.health<100?'limited':'normal',
    needsTriage:state.health<=40,
    // Candidate regions for fictional hospital examination, not confirmed damage.
    potentialOrganImpact:state.injured?REGION_ORGANS[region]:[],
  }
}
