import type {BJHapticCue} from './StreetVerseBJHapticRuntime'

export type BJInjuryKind='shot'|'stab'|'blunt'|'fall'|'recovery'
export type BJInjuryState={health:number;injured:boolean;lastInjury:BJInjuryKind|null}
export const initialBJInjuryState=():BJInjuryState=>({health:100,injured:false,lastInjury:null})
export function applyBJInjury(previous:BJInjuryState,kind:BJInjuryKind):{state:BJInjuryState;cue:BJHapticCue;requiresMedicalHelp:boolean}{
  const damage:Record<BJInjuryKind,number>={shot:30,stab:24,blunt:12,fall:8,recovery:-35}
  const health=Math.max(0,Math.min(100,previous.health-damage[kind]))
  const injured=health<100
  const cue:BJHapticCue=kind==='recovery'?'recovery':kind==='shot'||kind==='stab'?'major-hit':'minor-hit'
  return {state:{health,injured,lastInjury:kind},cue,requiresMedicalHelp:health<=40}
}
/** Gameplay-only event: no real-world injury or medical diagnosis. */
export function dispatchBJInjury(kind:BJInjuryKind){
  if(typeof window!=='undefined')window.dispatchEvent(new CustomEvent('tryamm:streetverse-bj-injury',{detail:{kind}}))
}
