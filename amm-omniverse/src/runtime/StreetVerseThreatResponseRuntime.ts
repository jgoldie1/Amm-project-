import {
 BJ_STUBBS_THREAT_PROFILE,
 DEFAULT_CIVILIAN_THREAT_PROFILE,
 type StreetVerseThreatAction,
 type StreetVerseThreatEvent,
 type StreetVerseThreatProfile,
} from '../data/streetVerseThreatResponse'

export type StreetVerseThreatResponseState=Readonly<{
 characterId:string
 threatId:string|null
 action:StreetVerseThreatAction|'idle'
 threatLevel:number
 stress:number
 protectMode:boolean
 needsMedicalAid:boolean
 updatedAt:string
}>

const clamp01=(n:number)=>Math.max(0,Math.min(1,n))

function chooseAction(
 threat:StreetVerseThreatEvent,
 profile:StreetVerseThreatProfile,
 context:{injured:boolean;fatigued:boolean;protectingDependent:boolean;distance:number}
):StreetVerseThreatAction{
 const severity=clamp01(threat.severity)
 if(!threat.active)return 'recover'
 if(context.injured&&severity>.55)return 'seek-safety'
 if(context.protectingDependent)return 'protect-dependent'
 if(profile.role==='medical'){
  if(severity>.48)return 'seek-safety'
  return 'render-first-aid'
 }
 if(profile.role==='fire-rescue'){
  if(threat.kind==='fire'||threat.kind==='explosion')return 'direct-civilians'
  return 'request-backup'
 }
 if(profile.role==='police'||profile.role==='security'){
  if(severity>.72)return 'direct-civilians'
  if(threat.kind==='disturbance'&&profile.deescalation>.55)return 'deescalate'
  if(threat.kind==='medical-emergency'&&profile.medicalTraining>.3)return 'render-first-aid'
  return 'secure-scene'
 }
 if(severity>.78)return profile.courage<.5?'freeze':'flee'
 if(severity>.42)return 'seek-safety'
 return 'observe-report'
}

export function installStreetVerseThreatResponseRuntime(
 characterId='bj-stubbs',
 profile:StreetVerseThreatProfile=BJ_STUBBS_THREAT_PROFILE
){
 let body={pain:0,injury:0,fatigue:0,stress:0}
 let state:StreetVerseThreatResponseState={
  characterId,
  threatId:null,
  action:'idle',
  threatLevel:0,
  stress:0,
  protectMode:false,
  needsMedicalAid:false,
  updatedAt:new Date().toISOString(),
 }

 const publish=()=>window.dispatchEvent(new CustomEvent('tryamm:character-threat-response-state',{detail:state}))

 const onBodyState=(event:Event)=>{
  const d=(event as CustomEvent<{characterId?:string;pain?:number;injury?:number;fatigue?:number;stress?:number}>).detail||{}
  if(d.characterId&&d.characterId!==characterId)return
  body={
   pain:clamp01(Number(d.pain||0)),
   injury:clamp01(Number(d.injury||0)),
   fatigue:clamp01(Number(d.fatigue||0)),
   stress:clamp01(Number(d.stress||0)),
  }
 }

 const onThreat=(event:Event)=>{
  const threat=(event as CustomEvent<StreetVerseThreatEvent>).detail
  if(!threat?.id)return
  const distance=Number((event as CustomEvent<any>).detail?.distance??18)
  const protectingDependent=Boolean((event as CustomEvent<any>).detail?.protectingDependent)
  const action=chooseAction(threat,profile,{
   injured:body.pain>.55||body.injury>.35,
   fatigued:body.fatigue>.75,
   protectingDependent,
   distance,
  })
  const threatLevel=clamp01(threat.severity)
  const stress=clamp01(Math.max(body.stress,threatLevel*.88))
  state={
   characterId,
   threatId:threat.active?threat.id:null,
   action,
   threatLevel,
   stress,
   protectMode:['protect-dependent','direct-civilians','secure-scene'].includes(action),
   needsMedicalAid:body.pain>.62||body.injury>.48,
   updatedAt:new Date().toISOString(),
  }

  window.dispatchEvent(new CustomEvent('tryamm:character-affect-set',{detail:{
   characterId,
   affect:threat.active?(threatLevel>.68?'afraid':'serious'):'calm',
   source:'threat-response',
  }}))
  window.dispatchEvent(new CustomEvent('tryamm:character-body-state-change-request',{detail:{
   characterId,
   changes:{
    stress:+threatLevel*.28,
    stamina:-threatLevel*.08,
   },
   source:'threat-response',
   serverValidate:true,
  }}))
  window.dispatchEvent(new CustomEvent('tryamm:streetverse-threat-action',{detail:{
   characterId,
   threatId:threat.id,
   kind:threat.kind,
   action,
   role:profile.role,
   requestEmergencyHelp:['call-emergency','request-backup','secure-scene','direct-civilians'].includes(action),
   preserveEvidence:!threat.active&&profile.evidenceAwareness>.35,
   defensiveOnly:true,
   source:'threat-response-runtime',
  }}))
  publish()
 }

 const onThreatEnd=(event:Event)=>{
  const d=(event as CustomEvent<{id?:string}>).detail||{}
  if(d.id&&state.threatId&&d.id!==state.threatId)return
  state={...state,threatId:null,action:'recover',threatLevel:0,protectMode:false,updatedAt:new Date().toISOString()}
  window.dispatchEvent(new CustomEvent('tryamm:character-affect-set',{detail:{characterId,affect:'calm',source:'threat-ended'}}))
  publish()
 }

 window.addEventListener('tryamm:streetverse-threat-event',onThreat)
 window.addEventListener('tryamm:streetverse-threat-ended',onThreatEnd)
 window.addEventListener('tryamm:character-body-state',onBodyState)
 queueMicrotask(publish)

 return{
  getState:()=>state,
  dispose:()=>{
   window.removeEventListener('tryamm:streetverse-threat-event',onThreat)
   window.removeEventListener('tryamm:streetverse-threat-ended',onThreatEnd)
   window.removeEventListener('tryamm:character-body-state',onBodyState)
  }
 }
}

export const STREETVERSE_GENERIC_CIVILIAN_THREAT_PROFILE=DEFAULT_CIVILIAN_THREAT_PROFILE
