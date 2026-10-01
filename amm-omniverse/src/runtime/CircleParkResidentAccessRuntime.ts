import {CIRCLE_PARK_RESIDENT_ENTRANCE,circleParkPatrolShiftForHour} from '../data/CircleParkResidentEntrance'

export type CircleParkAccessResult={
  method:'guard-sign-in'|'resident-key'|'gate-vault'
  allowed:boolean
  signedIn:boolean
  residentKey:boolean
  target:[number,number,number]
  impact?:{intensity:number;bodyZones:readonly string[];purpose:'game-feedback'}
}

const SAVE_KEY='tryamm.circle-park.resident-access.v1'

function loadState(){
  try{
    const saved=JSON.parse(localStorage.getItem(SAVE_KEY)||'{}')
    return {
      signedIn:Boolean(saved.signedIn),
      residentKey:saved.residentKey!==false,
    }
  }catch{return{signedIn:false,residentKey:true}}
}

function saveState(state:{signedIn:boolean;residentKey:boolean}){
  try{localStorage.setItem(SAVE_KEY,JSON.stringify({...state,updatedAt:new Date().toISOString()}))}catch{}
}

let installed=false
export function installCircleParkResidentAccessRuntime(){
  if(installed||typeof window==='undefined')return()=>{}
  installed=true
  let state=loadState()

  const publish=(result:CircleParkAccessResult)=>{
    saveState(state)
    window.dispatchEvent(new CustomEvent('tryamm:circle-park-access-result',{detail:result}))
    window.dispatchEvent(new CustomEvent('tryamm:circle-park-resident-access-state',{detail:{
      ...state,
      patrolShift:circleParkPatrolShiftForHour(new Date().getHours()),
      privacy:CIRCLE_PARK_RESIDENT_ENTRANCE.privacy,
    }}))
  }

  const onEntry=(event:Event)=>{
    const detail=(event as CustomEvent<{method?:CircleParkAccessResult['method']}>).detail||{}
    const method=detail.method
    if(!method)return
    const target=[-31,0,56] as [number,number,number]

    if(method==='guard-sign-in'){
      state={...state,signedIn:true}
      publish({method,allowed:true,signedIn:true,residentKey:state.residentKey,target})
      window.dispatchEvent(new CustomEvent('tryamm:toast',{detail:{message:'SIGNED IN • SECURITY WAVES YOU THROUGH'}}))
      return
    }

    if(method==='resident-key'){
      const allowed=state.residentKey
      publish({method,allowed,signedIn:state.signedIn,residentKey:state.residentKey,target})
      window.dispatchEvent(new CustomEvent('tryamm:toast',{detail:{message:allowed?'RESIDENT KEY • SIDE GATE OPEN':'RESIDENT KEY NOT AVAILABLE'}}))
      return
    }

    if(method==='gate-vault'){
      const impact={intensity:.55,bodyZones:['left-leg','right-leg'] as const,purpose:'game-feedback' as const}
      publish({method,allowed:true,signedIn:state.signedIn,residentKey:state.residentKey,target,impact})
      window.dispatchEvent(new CustomEvent('tryamm:streetverse-body-impact',{detail:{
        source:'circle-park-gameplay-gate-vault',
        intensity:impact.intensity,
        bodyZones:impact.bodyZones,
        safeHapticOnly:true,
        realWorldInstruction:false,
      }}))
      window.dispatchEvent(new CustomEvent('tryamm:omniwear-haptic-request',{detail:{
        pattern:'landing-impact',
        intensity:impact.intensity,
        bodyZones:impact.bodyZones,
        purpose:impact.purpose,
        requiresUserEnabledHaptics:true,
      }}))
      window.dispatchEvent(new CustomEvent('tryamm:circle-park-safety-incident',{detail:{
        kind:'trespass',
        source:'gameplay-gate-vault',
        response:'de-escalate-and-check-access',
        realWorldAuthority:false,
      }}))
      return
    }
  }

  const onSignOut=()=>{
    state={...state,signedIn:false}
    saveState(state)
    window.dispatchEvent(new CustomEvent('tryamm:circle-park-resident-access-state',{detail:{...state,signedOut:true}}))
  }

  addEventListener('tryamm:circle-park-entry',onEntry)
  addEventListener('tryamm:circle-park-sign-out',onSignOut)
  queueMicrotask(()=>window.dispatchEvent(new CustomEvent('tryamm:circle-park-resident-access-state',{detail:{
    ...state,
    patrolShift:circleParkPatrolShiftForHour(new Date().getHours()),
    privacy:CIRCLE_PARK_RESIDENT_ENTRANCE.privacy,
  }})))

  return()=>{
    removeEventListener('tryamm:circle-park-entry',onEntry)
    removeEventListener('tryamm:circle-park-sign-out',onSignOut)
    installed=false
  }
}
