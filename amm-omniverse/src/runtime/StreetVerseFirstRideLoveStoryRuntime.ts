type FirstRidePhase='idle'|'meet'|'walk-to-car'|'diagnose'|'get-kit'|'repair'|'enter'|'drive'|'arrive'|'complete'
type State={phase:FirstRidePhase;vehicleId:string;npcId:string;relationshipXp:number}
const KEY='tryamm.streetverse.first-ride.v1'
const MISSION='first-ride-love-story'
let installed=false

function read():State{try{return {...{phase:'idle',vehicleId:'first-ride-car',npcId:'love-story-npc',relationshipXp:0},...JSON.parse(localStorage.getItem(KEY)||'{}')}}catch{return {phase:'idle',vehicleId:'first-ride-car',npcId:'love-story-npc',relationshipXp:0}}}
function save(state:State){try{localStorage.setItem(KEY,JSON.stringify(state))}catch{};emit(state)}
function emit(state:State){
 window.dispatchEvent(new CustomEvent('tryamm:streetverse-first-ride-state',{detail:{...state,missionId:MISSION}}))
 window.dispatchEvent(new CustomEvent('tryamm:streetverse-mission-marker',{detail:{missionId:MISSION,phase:state.phase,label:label(state.phase),holographic:true}}))
}
function label(phase:FirstRidePhase){
 const labels:Record<FirstRidePhase,string>={idle:'First Ride',meet:'Meet your friend', 'walk-to-car':'Walk to the disabled car',diagnose:'Inspect the broken car','get-kit':'Get a repair kit',repair:'Repair the car',enter:'Get in through the working door',drive:'Drive to the destination',arrive:'Exit and meet at the destination',complete:'First Ride complete'}
 return labels[phase]
}
function setPhase(state:State,phase:FirstRidePhase,xp=0){const next={...state,phase,relationshipXp:state.relationshipXp+xp};save(next);window.dispatchEvent(new CustomEvent('tryamm:accessibility-announce',{detail:{text:label(phase)}}));return next}

export function installStreetVerseFirstRideLoveStoryRuntime(){
 if(installed||typeof window==='undefined')return
 installed=true
 let state=read();emit(state)
 window.addEventListener('tryamm:streetverse-first-ride-start',()=>{
  state=setPhase(state,'meet')
  window.dispatchEvent(new CustomEvent('tryamm:streetverse-mission-start',{detail:{id:MISSION,label:'First Ride',story:'love-story',holographic:true,financialReward:false}}))
 })
 window.addEventListener('tryamm:streetverse-first-ride-npc-met',()=>{if(state.phase==='meet')state=setPhase(state,'walk-to-car',5)})
 window.addEventListener('tryamm:streetverse-first-ride-car-reached',()=>{
  if(state.phase!=='walk-to-car')return
  state=setPhase(state,'diagnose')
  window.dispatchEvent(new CustomEvent('tryamm:streetverse-vehicle-breakdown',{detail:{vehicleId:state.vehicleId,label:'First Ride Car',reason:'engine will not start',severity:'major'}}))
  window.dispatchEvent(new CustomEvent('tryamm:streetverse-interaction-context',{detail:{kind:'vehicle',vehicleId:state.vehicleId,label:'First Ride Car',broken:true,drivable:false,missionId:MISSION}}))
 })
 window.addEventListener('tryamm:streetverse-vehicle-repair-progress',(event:Event)=>{
  const d=(event as CustomEvent<any>).detail||{};if(d.vehicleId!==state.vehicleId)return
  if(d.action==='inspect'&&state.phase==='diagnose')state=setPhase(state,'get-kit')
  if(d.action==='use-repair-kit'&&['get-kit','repair'].includes(state.phase))state=setPhase(state,'repair')
 })
 window.addEventListener('tryamm:streetverse-repair-kit-acquired',(event:Event)=>{
  const d=(event as CustomEvent<any>).detail||{};if(d.vehicleId!==state.vehicleId)return
  if(state.phase==='get-kit')state=setPhase(state,'repair')
  window.dispatchEvent(new CustomEvent('tryamm:streetverse-interaction-context',{detail:{kind:'vehicle',vehicleId:state.vehicleId,label:'First Ride Car',broken:true,repairKit:true,drivable:false,missionId:MISSION}}))
 })
 window.addEventListener('tryamm:streetverse-vehicle-repaired',(event:Event)=>{
  const d=(event as CustomEvent<any>).detail||{};if(d.vehicleId!==state.vehicleId)return
  state=setPhase(state,'enter',10)
  window.dispatchEvent(new CustomEvent('tryamm:streetverse-interaction-context',{detail:{kind:'vehicle',vehicleId:state.vehicleId,label:'First Ride Car',broken:false,drivable:true,missionId:MISSION}}))
 })
 window.addEventListener('tryamm:streetverse-vehicle-controlled',(event:Event)=>{
  const d=(event as CustomEvent<any>).detail||{};if(state.phase==='enter'&&d.entered)state=setPhase(state,'drive')
 })
 window.addEventListener('tryamm:streetverse-first-ride-destination-reached',()=>{if(state.phase==='drive')state=setPhase(state,'arrive')})
 window.addEventListener('tryamm:streetverse-first-ride-finish',()=>{
  if(state.phase!=='arrive')return
  state=setPhase(state,'complete',20)
  const detail={id:MISSION,missionId:MISSION,label:'First Ride',source:'love-story',vehicle:true,relationshipXp:state.relationshipXp,financialReward:false,authoritativeRewardRequired:true}
  window.dispatchEvent(new CustomEvent('tryamm:streetverse-mission-complete',{detail}))
  window.dispatchEvent(new CustomEvent('tryamm:open-reel-creator',{detail:{source:'first-ride-love-story',missionId:MISSION,missionLabel:'First Ride',verified:true,rewardStatus:'pending',caption:'First Ride complete • repaired it, drove it, made the memory • #TRYAMM #StreetVerse'}}))
  window.dispatchEvent(new CustomEvent('tryamm:streetverse-authoritative-reward-request',{detail:{missionId:MISSION,source:'love-story',clientMayNotAward:true}}))
 })
}
