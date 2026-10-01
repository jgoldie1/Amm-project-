import {CIRCLE_PARK_COMMUNITY_SAFETY,circleParkPatrolShiftForHour,type CircleParkIncidentKind} from '../data/CircleParkResidentEntrance'

type SafetyState={
  standing:number
  commendations:number
  writeUps:number
  lastIncident?:CircleParkIncidentKind
}

const SAVE_KEY='tryamm.circle-park.community-standing.v1'

function load():SafetyState{
  try{
    const parsed=JSON.parse(localStorage.getItem(SAVE_KEY)||'{}')
    return {
      standing:Number(parsed.standing||0),
      commendations:Number(parsed.commendations||0),
      writeUps:Number(parsed.writeUps||0),
      lastIncident:parsed.lastIncident,
    }
  }catch{return{standing:0,commendations:0,writeUps:0}}
}
function save(state:SafetyState){try{localStorage.setItem(SAVE_KEY,JSON.stringify({...state,updatedAt:new Date().toISOString()}))}catch{}}

let installed=false
export function installCircleParkCommunitySafetyRuntime(){
  if(installed||typeof window==='undefined')return()=>{}
  installed=true
  let state=load()

  const publish=(extra:Record<string,unknown>={})=>{
    save(state)
    window.dispatchEvent(new CustomEvent('tryamm:circle-park-community-standing',{detail:{
      ...state,
      patrolShift:circleParkPatrolShiftForHour(new Date().getHours()),
      doctrine:CIRCLE_PARK_COMMUNITY_SAFETY.doctrine,
      ...extra,
    }}))
  }

  const onIncident=(event:Event)=>{
    const detail=(event as CustomEvent<{kind?:CircleParkIncidentKind;source?:string}>).detail||{}
    const kind=detail.kind
    if(!kind)return
    const policy=CIRCLE_PARK_COMMUNITY_SAFETY.incidents[kind]
    if(!policy)return
    state={...state,lastIncident:kind}
    const writeUp=kind==='fight'||kind==='property-damage'||kind==='trespass'
    const standingDelta=kind==='medical'||kind==='lost-person'||kind==='assist-request'?0:-(policy.severity>=3?2:1)
    state.standing+=standingDelta
    if(writeUp)state.writeUps+=1
    const response={
      kind,
      severity:policy.severity,
      steps:policy.response,
      writeUp,
      standingDelta,
      patrolShift:circleParkPatrolShiftForHour(new Date().getHours()),
      doctrine:'de-escalation-first',
      realWorldAuthority:false,
      source:detail.source||'circle-park',
    }
    window.dispatchEvent(new CustomEvent('tryamm:circle-park-safety-response',{detail:response}))
    window.dispatchEvent(new CustomEvent('tryamm:toast',{detail:{message:writeUp?'SECURITY RESPONSE • '+kind.toUpperCase()+' • GAME WRITE-UP':'SECURITY RESPONSE • '+kind.toUpperCase()}}))
    publish({lastResponse:response})
  }

  const onPositive=(event:Event)=>{
    const detail=(event as CustomEvent<{action?:string;source?:string}>).detail||{}
    const action=String(detail.action||'help-neighbor')
    if(!CIRCLE_PARK_COMMUNITY_SAFETY.standing.positive.includes(action as any))return
    state.standing+=1
    state.commendations+=1
    window.dispatchEvent(new CustomEvent('tryamm:toast',{detail:{message:'COMMUNITY UPVOTE • '+action.replaceAll('-',' ').toUpperCase()}}))
    publish({positiveAction:action,source:detail.source||'circle-park'})
  }

  addEventListener('tryamm:circle-park-safety-incident',onIncident)
  addEventListener('tryamm:circle-park-community-positive',onPositive)
  queueMicrotask(()=>publish({ready:true}))

  return()=>{
    removeEventListener('tryamm:circle-park-safety-incident',onIncident)
    removeEventListener('tryamm:circle-park-community-positive',onPositive)
    installed=false
  }
}
