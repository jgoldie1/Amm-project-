import type {HoloCADSubject} from './livingSystemsPresets'

/**
 * Typed, bounded, local-only event bridge between HoloCAD's teaching labs
 * and the host StreetVerse UI.
 *
 * NOT a backend ledger, multiplayer sync, real quantum hardware, credentials,
 * live diagnostics, an asset upload or a reward/payment service.
 */
export const HOLOCAD_RESEARCH_EVENT='tryamm:holocad-research-result' as const
export const HOLOCAD_RESEARCH_HISTORY_LIMIT=20
export type HoloCADResearchKind='quantum-circuit'|'classical-physics'|'glb-metadata'
export type HoloCADResearchSource='holocad-quantum'|'holocad-physics'|'holocad-glb'
export type HoloCADResearchAuthority='simulation-only'|'metadata-only'
export type HoloCADResearchResult={
 schemaVersion:1
 kind:HoloCADResearchKind
 source:HoloCADResearchSource
 subject:HoloCADSubject
 experiment:string
 summary:string
 authority:HoloCADResearchAuthority
 hardwareConnected:false
 physicalQuantumHardware:false
 rewardEligible:false
 recordedAtMs:number
}

const SUBJECTS:readonly HoloCADSubject[]=[
 'human','canine','automobile','building','aircraft','spacecraft','satellite','drone',
 'humanoid-robot','robot-dog','rover','exoskeleton','robotic-arm'
]
const allowedKindSource:Record<HoloCADResearchKind,HoloCADResearchSource>={
 'quantum-circuit':'holocad-quantum',
 'classical-physics':'holocad-physics',
 'glb-metadata':'holocad-glb'
}
const allowedAuthority:Record<HoloCADResearchKind,HoloCADResearchAuthority>={
 'quantum-circuit':'simulation-only',
 'classical-physics':'simulation-only',
 'glb-metadata':'metadata-only'
}

export function parseHoloCADResearchEvent(input:unknown):HoloCADResearchResult|null{
 if(input===null||typeof input!=='object'||Array.isArray(input))return null
 const data=input as Record<string,unknown>
 if(data.schemaVersion!==1)return null
 if(!['quantum-circuit','classical-physics','glb-metadata'].includes(String(data.kind)))return null
 const kind=data.kind as HoloCADResearchKind
 if(data.source!==allowedKindSource[kind]||data.authority!==allowedAuthority[kind])return null
 if(!SUBJECTS.includes(data.subject as HoloCADSubject))return null
 if(typeof data.experiment!=='string'||!/^[a-z][a-z0-9-]{0,63}$/.test(data.experiment))return null
 if(typeof data.summary!=='string'||data.summary.length<1||data.summary.length>180)return null
 if(!Number.isSafeInteger(data.recordedAtMs)||Number(data.recordedAtMs)<0)return null
 if(data.hardwareConnected!==false||data.physicalQuantumHardware!==false||data.rewardEligible!==false)return null
 return {
  schemaVersion:1,kind,source:allowedKindSource[kind],
  subject:data.subject as HoloCADSubject,
  experiment:data.experiment,summary:data.summary,
  authority:allowedAuthority[kind],
  hardwareConnected:false,physicalQuantumHardware:false,rewardEligible:false,
  recordedAtMs:Number(data.recordedAtMs)
 }
}

export function createHoloCADResearchResult(input:{
 kind:HoloCADResearchKind
 subject:HoloCADSubject
 experiment:string
 summary:string
 now?:number
}):HoloCADResearchResult{
 const authority=allowedAuthority[input.kind]
 const value={
  schemaVersion:1 as const,kind:input.kind,source:allowedKindSource[input.kind],
  subject:input.subject,experiment:input.experiment,
  summary:input.summary,authority,
  hardwareConnected:false as const,physicalQuantumHardware:false as const,
  rewardEligible:false as const,recordedAtMs:input.now??Date.now()
 }
 const validated=parseHoloCADResearchEvent(value)
 if(!validated)throw Error('invalid_holocad_research_event')
 return validated
}

export function appendHoloCADResearchHistory(
 history:readonly HoloCADResearchResult[],next:unknown
):HoloCADResearchResult[]{
 const valid=parseHoloCADResearchEvent(next)
 if(!valid)return [...history].slice(0,HOLOCAD_RESEARCH_HISTORY_LIMIT)
 return [valid,...history].slice(0,HOLOCAD_RESEARCH_HISTORY_LIMIT)
}

/** Runs synchronously after a user-requested lab action, never automatically. */
export function publishHoloCADResearchResult(result:HoloCADResearchResult){
 const validated=parseHoloCADResearchEvent(result)
 if(!validated)throw Error('invalid_holocad_research_event')
 if(typeof window!=='undefined'){
  window.dispatchEvent(new CustomEvent(HOLOCAD_RESEARCH_EVENT,{detail:validated}))
 }
 return validated
}
