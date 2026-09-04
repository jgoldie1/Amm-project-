export type StreetVerseJourneyStepId='spawn'|'walk'|'talk'|'enter-car'|'drive'|'reach-mission'|'complete-mission'|'verify-reward'|'open-reel'|'record'|'preview'|'save-share'|'exit'

type StepState={id:StreetVerseJourneyStepId;label:string;completed:boolean;completedAt?:string;evidenceEvent?:string}
type JourneyState={sessionId:string;completed:number;total:number;nextStep:StreetVerseJourneyStepId|null;complete:boolean;steps:StepState[];outOfOrder:{step:StreetVerseJourneyStepId;event:string;at:string}[];updatedAt:string}

export const STREETVERSE_JOURNEY_STEPS:{id:StreetVerseJourneyStepId;label:string}[]=[
 {id:'spawn',label:'SPAWN'},
 {id:'walk',label:'WALK'},
 {id:'talk',label:'TALK TO NPC'},
 {id:'enter-car',label:'ENTER CAR'},
 {id:'drive',label:'DRIVE'},
 {id:'reach-mission',label:'REACH MISSION'},
 {id:'complete-mission',label:'COMPLETE MISSION'},
 {id:'verify-reward',label:'VERIFY REWARD'},
 {id:'open-reel',label:'OPEN REEL'},
 {id:'record',label:'RECORD'},
 {id:'preview',label:'PREVIEW'},
 {id:'save-share',label:'SAVE/SHARE'},
 {id:'exit',label:'EXIT'},
]

const STORAGE_KEY='tryamm.streetverse.journey-qa.v1'
let installed=false

function now(){return new Date().toISOString()}
function sessionId(){return `streetverse-qa-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`}

export function installStreetVerseJourneyQARuntime(){
 if(installed||typeof window==='undefined'||!window.location.pathname.startsWith('/streetverse'))return()=>{}
 installed=true
 const steps:StepState[]=STREETVERSE_JOURNEY_STEPS.map(step=>({...step,completed:false}))
 const outOfOrder:JourneyState['outOfOrder']=[]
 const id=sessionId()
 let nextIndex=0
 let completedPublished=false
 const listeners:{name:string;fn:EventListener}[]=[]

 const snapshot=():JourneyState=>({sessionId:id,completed:nextIndex,total:steps.length,nextStep:steps[nextIndex]?.id||null,complete:nextIndex===steps.length,steps:steps.map(step=>({...step})),outOfOrder:outOfOrder.slice(-20),updatedAt:now()})
 const publish=()=>{
  const state=snapshot()
  try{sessionStorage.setItem(STORAGE_KEY,JSON.stringify(state))}catch{}
  window.dispatchEvent(new CustomEvent('tryamm:streetverse-journey-qa',{detail:state}))
  if(state.complete&&!completedPublished){completedPublished=true;window.dispatchEvent(new CustomEvent('tryamm:streetverse-journey-qa-complete',{detail:state}))}
 }
 const observe=(step:StreetVerseJourneyStepId,eventName:string)=>{
  const index=steps.findIndex(item=>item.id===step)
  if(index<nextIndex)return
  if(index!==nextIndex){
   const duplicate=outOfOrder[outOfOrder.length-1]
   if(!duplicate||duplicate.step!==step||duplicate.event!==eventName)outOfOrder.push({step,event:eventName,at:now()})
   publish();return
  }
  steps[index]={...steps[index],completed:true,completedAt:now(),evidenceEvent:eventName}
  nextIndex++
  publish()
 }
 const on=(name:string,handler:(detail:Record<string,unknown>)=>void)=>{
  const fn=((event:Event)=>handler((event as CustomEvent<Record<string,unknown>>).detail||{})) as EventListener
  window.addEventListener(name,fn);listeners.push({name,fn})
 }

 on('tryamm:streetverse-world-ready',()=>observe('spawn','tryamm:streetverse-world-ready'))
 on('tryamm:streetverse-player-position',detail=>{
  const speed=Number(detail.speed||0),vehicle=detail.vehicle===true
  if(speed>0&&!vehicle)observe('walk','tryamm:streetverse-player-position')
  if(speed>0&&vehicle)observe('drive','tryamm:streetverse-player-position')
 })
 on('tryamm:streetverse-npc-conversation-open',()=>observe('talk','tryamm:streetverse-npc-conversation-open'))
 on('tryamm:streetverse-vehicle-controlled',detail=>{if(detail.entered===true)observe('enter-car','tryamm:streetverse-vehicle-controlled')})
 on('tryamm:streetverse-drive-telemetry',detail=>{if(Number(detail.speed||0)>0)observe('drive','tryamm:streetverse-drive-telemetry')})
 on('tryamm:streetverse-checkpoint',()=>observe('reach-mission','tryamm:streetverse-checkpoint'))
 on('tryamm:streetverse-mobile-mission-zone',()=>observe('reach-mission','tryamm:streetverse-mobile-mission-zone'))
 on('tryamm:streetverse-mission-complete',()=>observe('complete-mission','tryamm:streetverse-mission-complete'))
 on('tryamm:mission-completed',()=>observe('complete-mission','tryamm:mission-completed'))
 on('tryamm:streetverse-mobile-reward-recorded',()=>observe('verify-reward','tryamm:streetverse-mobile-reward-recorded'))
 on('tryamm:streetverse-reel-opened',()=>observe('open-reel','tryamm:streetverse-reel-opened'))
 on('tryamm:streetverse-reel-recorded',()=>observe('record','tryamm:streetverse-reel-recorded'))
 on('tryamm:streetverse-reel-preview-ready',()=>observe('preview','tryamm:streetverse-reel-preview-ready'))
 on('tryamm:streetverse-reel-save-share-complete',()=>observe('save-share','tryamm:streetverse-reel-save-share-complete'))
 on('tryamm:streetverse-exit',()=>observe('exit','tryamm:streetverse-exit'))

 publish()
 return()=>{listeners.forEach(({name,fn})=>window.removeEventListener(name,fn));installed=false}
}
