import {STREETVERSE_RESCUE_INCIDENTS,type StreetVerseRescueIncidentKind,type StreetVerseResponderService} from '../data/StreetVerseRescueIncidentCatalog'

export type StreetVerseRescueIncidentState={
  id:string
  kind:StreetVerseRescueIncidentKind
  label:string
  x:number
  z:number
  severity:number
  services:readonly StreetVerseResponderService[]
  objectives:readonly string[]
  completed:readonly string[]
  victimCount:number
  animalCount:number
  fire:boolean
  burnProgress:number
  rescuedPeople:number
  rescuedAnimals:number
  resolved:boolean
  startedAt:number
}

let installed=false
let active:StreetVerseRescueIncidentState|null=null
let fireTimer:number|undefined

const emitState=()=>{
  if(!active)return
  window.dispatchEvent(new CustomEvent('tryamm:streetverse-rescue-incident-state',{detail:active}))
}

const dispatchServices=(state:StreetVerseRescueIncidentState)=>{
  for(const service of state.services){
    if(service==='security')continue
    window.dispatchEvent(new CustomEvent('tryamm:streetverse-emergency-response',{detail:{
      kind:service,
      x:state.x,
      z:state.z,
      severity:state.severity,
      reason:state.label,
      incidentId:state.id,
      source:'streetverse-rescue-incident-runtime',
      gameplayOnly:true,
    }}))
  }
}

const startFireTick=()=>{
  if(fireTimer)clearInterval(fireTimer)
  fireTimer=window.setInterval(()=>{
    if(!active?.fire||active.resolved)return
    active={...active,burnProgress:Math.min(100,active.burnProgress+2)}
    window.dispatchEvent(new CustomEvent('tryamm:streetverse-structure-fire-state',{detail:{
      incidentId:active.id,
      x:active.x,
      z:active.z,
      burning:true,
      burnProgress:active.burnProgress,
      severity:active.severity,
      source:'streetverse-rescue-incident-runtime',
    }}))
    emitState()
  },1500)
}

export function installStreetVerseRescueIncidentRuntime(){
  if(installed||typeof window==='undefined')return()=>{}
  installed=true

  const onStart=(event:Event)=>{
    const d=(event as CustomEvent<{kind?:StreetVerseRescueIncidentKind;x?:number;z?:number}>).detail||{}
    const kind=d.kind
    if(!kind||!STREETVERSE_RESCUE_INCIDENTS[kind])return
    const def=STREETVERSE_RESCUE_INCIDENTS[kind]
    active={
      id:`${kind}-${Date.now()}`,
      kind,
      label:def.label,
      x:Number(d.x||0),
      z:Number(d.z||0),
      severity:def.severity,
      services:def.services,
      objectives:def.objectives,
      completed:[],
      victimCount:def.victimCount,
      animalCount:def.animalCount,
      fire:def.fire,
      burnProgress:def.fire?8:0,
      rescuedPeople:0,
      rescuedAnimals:0,
      resolved:false,
      startedAt:Date.now(),
    }
    window.dispatchEvent(new CustomEvent('tryamm:streetverse-dialogue',{detail:{
      speaker:'Dispatch',
      text:`${def.label}. Units assigned. Follow the rescue objectives and keep access routes clear.`,
      objective:def.objectives[0],
      missionId:active.id,
    }}))
    window.dispatchEvent(new CustomEvent('tryamm:streetverse-rescue-role-assignment',{detail:{
      incidentId:active.id,
      services:def.services,
      objectives:def.objectives,
      source:'streetverse-rescue-incident-runtime',
    }}))
    dispatchServices(active)
    if(active.fire){
      window.dispatchEvent(new CustomEvent('tryamm:streetverse-structure-fire-state',{detail:{
        incidentId:active.id,x:active.x,z:active.z,burning:true,burnProgress:active.burnProgress,severity:active.severity,
      }}))
      startFireTick()
    }
    emitState()
  }

  const onAction=(event:Event)=>{
    const d=(event as CustomEvent<{incidentId?:string;action?:string}>).detail||{}
    if(!active||active.resolved||(d.incidentId&&d.incidentId!==active.id))return
    const action=String(d.action||'').toUpperCase()
    if(!action)return
    const completed=new Set(active.completed)
    completed.add(action)
    let rescuedPeople=active.rescuedPeople,rescuedAnimals=active.rescuedAnimals,burnProgress=active.burnProgress
    if(action.includes('EVACUATE')||action.includes('EXTRICATE')||action.includes('TREAT VICTIM')||action.includes('HAND OFF'))rescuedPeople=Math.min(active.victimCount,rescuedPeople+1)
    if(action.includes('ANIMAL')||action.includes('RETURN ANIMAL'))rescuedAnimals=Math.min(active.animalCount,rescuedAnimals+1)
    if(action.includes('SUPPRESS FIRE'))burnProgress=Math.max(0,burnProgress-45)
    active={...active,completed:[...completed],rescuedPeople,rescuedAnimals,burnProgress}
    const enoughPeople=active.victimCount===0||rescuedPeople>=active.victimCount
    const enoughAnimals=active.animalCount===0||rescuedAnimals>=active.animalCount
    const fireSafe=!active.fire||burnProgress<=5
    const objectiveProgress=active.objectives.filter(obj=>[...completed].some(done=>obj.includes(done)||done.includes(obj))).length
    if(enoughPeople&&enoughAnimals&&fireSafe&&objectiveProgress>=Math.min(3,active.objectives.length)){
      active={...active,resolved:true,burnProgress:active.fire?0:burnProgress}
      if(fireTimer){clearInterval(fireTimer);fireTimer=undefined}
      if(active.fire)window.dispatchEvent(new CustomEvent('tryamm:streetverse-structure-fire-state',{detail:{incidentId:active.id,x:active.x,z:active.z,burning:false,burnProgress:0}}))
      window.dispatchEvent(new CustomEvent('tryamm:streetverse-rescue-incident-resolved',{detail:{...active,xp:250+active.severity*50}}))
      window.dispatchEvent(new CustomEvent('tryamm:toast',{detail:{message:`RESCUE COMPLETE • ${active.label}`}}))
    }
    emitState()
  }

  addEventListener('tryamm:streetverse-rescue-incident-start',onStart)
  addEventListener('tryamm:streetverse-rescue-action',onAction)

  return()=>{
    if(fireTimer)clearInterval(fireTimer)
    removeEventListener('tryamm:streetverse-rescue-incident-start',onStart)
    removeEventListener('tryamm:streetverse-rescue-action',onAction)
    installed=false
    active=null
  }
}
