type VehicleBreakdownDetail={
 vehicleId?:string
 label?:string
 reason?:string
 severity?:'minor'|'major'|'critical'
}

type RepairActionDetail={
 vehicleId?:string
 action?:'inspect'|'open-hood'|'open-door'|'diagnose'|'use-repair-kit'|'repair'|'verify'
 repairKitId?:string
}

type RepairState={
 vehicleId:string
 label:string
 reason:string
 severity:'minor'|'major'|'critical'
 steps:Set<RepairActionDetail['action']>
 repairKitUsed:boolean
 complete:boolean
}

let installed=false
const repairs=new Map<string,RepairState>()
const REQUIRED_ACTIONS:RepairActionDetail['action'][]=['inspect','open-hood','diagnose','use-repair-kit','repair','verify']

function emit(name:string,detail:Record<string,unknown>){window.dispatchEvent(new CustomEvent(name,{detail}))}

function announce(text:string){emit('tryamm:accessibility-announce',{text})}

function lockVehicle(state:RepairState){
 emit('tryamm:streetverse-vehicle-drive-lock',{
  vehicleId:state.vehicleId,locked:true,reason:'repair-required',source:'vehicle-repair-rpg',
 })
 emit('tryamm:streetverse-mission-start',{
  id:`vehicle-repair:${state.vehicleId}`,
  label:`Repair ${state.label}`,
  source:'vehicle-repair-rpg',
  vehicleId:state.vehicleId,
  financialReward:false,
 })
 emit('tryamm:streetverse-mission-marker',{
  id:`vehicle-repair:${state.vehicleId}`,
  kind:'vehicle-repair',
  vehicleId:state.vehicleId,
  label:`Repair ${state.label}`,
 })
 emit('tryamm:streetverse-streamer-moment',{
  phase:'breakdown',
  missionId:`vehicle-repair:${state.vehicleId}`,
  vehicleId:state.vehicleId,
  title:`${state.label} broke down`,
  streamerSafe:true,
 })
 announce(`${state.label} needs repair. Driving is locked until the repair mission is complete.`)
}

function progress(state:RepairState,detail:RepairActionDetail){
 const action=detail.action
 if(!action||state.complete)return
 if(action==='use-repair-kit'&&!detail.repairKitId){
  emit('tryamm:streetverse-repair-blocked',{vehicleId:state.vehicleId,reason:'repair-kit-required'})
  announce('A repair kit is required before repairs can continue.')
  return
 }
 if(action==='use-repair-kit')state.repairKitUsed=true
 state.steps.add(action)
 const completedSteps=REQUIRED_ACTIONS.filter(step=>state.steps.has(step)).length
 emit('tryamm:streetverse-vehicle-repair-progress',{
  vehicleId:state.vehicleId,action,completedSteps,totalSteps:REQUIRED_ACTIONS.length,
  repairKitUsed:state.repairKitUsed,
 })
 emit('tryamm:streetverse-streamer-moment',{
  phase:'repair-progress',vehicleId:state.vehicleId,action,completedSteps,totalSteps:REQUIRED_ACTIONS.length,streamerSafe:true,
 })
 if(REQUIRED_ACTIONS.every(step=>state.steps.has(step))&&state.repairKitUsed)completeRepair(state)
}

function completeRepair(state:RepairState){
 if(state.complete)return
 state.complete=true
 emit('tryamm:streetverse-vehicle-drive-lock',{vehicleId:state.vehicleId,locked:false,reason:'repair-verified',source:'vehicle-repair-rpg'})
 emit('tryamm:streetverse-vehicle-repaired',{vehicleId:state.vehicleId,verified:true,source:'vehicle-repair-rpg'})
 emit('tryamm:streetverse-mission-complete',{
  id:`vehicle-repair:${state.vehicleId}`,
  missionId:`vehicle-repair:${state.vehicleId}`,
  label:`Repair ${state.label}`,
  source:'vehicle-repair-rpg',
  vehicle:true,
  financialReward:false,
  authoritativeRewardRequired:true,
 })
 const reel={
  source:'vehicle-repair-rpg',
  missionId:`vehicle-repair:${state.vehicleId}`,
  missionLabel:`Repair ${state.label}`,
  vehicleId:state.vehicleId,
  verified:true,
  rewardStatus:'pending',
  title:`${state.label} repaired`,
  caption:`${state.label} repaired in StreetVerse • #TRYAMM #StreetVerse #RepairMission`,
 }
 emit('tryamm:streetverse-reel-handoff',reel)
 emit('tryamm:open-reel-creator',reel)
 emit('tryamm:streetverse-streamer-moment',{phase:'repair-complete',...reel,streamerSafe:true})
 emit('tryamm:streetverse-authoritative-reward-request',{
  missionId:`vehicle-repair:${state.vehicleId}`,source:'vehicle-repair-rpg',clientMayNotAward:true,
 })
 announce(`${state.label} repair verified. Driving is unlocked.`)
}

export function installStreetVerseVehicleRepairStreamerRuntime(){
 if(installed||typeof window==='undefined')return
 installed=true
 window.addEventListener('tryamm:streetverse-vehicle-breakdown',(event:Event)=>{
  const detail=(event as CustomEvent<VehicleBreakdownDetail>).detail||{}
  const vehicleId=String(detail.vehicleId||'').trim()
  if(!vehicleId)return
  const state:RepairState={
   vehicleId,
   label:String(detail.label||'Vehicle'),
   reason:String(detail.reason||'mechanical failure'),
   severity:detail.severity||'major',
   steps:new Set(),
   repairKitUsed:false,
   complete:false,
  }
  repairs.set(vehicleId,state)
  lockVehicle(state)
 })
 window.addEventListener('tryamm:streetverse-vehicle-repair-action',(event:Event)=>{
  const detail=(event as CustomEvent<RepairActionDetail>).detail||{}
  const vehicleId=String(detail.vehicleId||'').trim()
  const state=repairs.get(vehicleId)
  if(!state)return
  progress(state,detail)
 })
 window.addEventListener('tryamm:streetverse-repair-kit-acquired',(event:Event)=>{
  const detail=(event as CustomEvent<{vehicleId?:string;repairKitId?:string}>).detail||{}
  const vehicleId=String(detail.vehicleId||'').trim()
  const state=repairs.get(vehicleId)
  if(!state)return
  emit('tryamm:streetverse-vehicle-repair-progress',{vehicleId,repairKitAvailable:Boolean(detail.repairKitId)})
  announce('Repair kit acquired. Return to the broken vehicle to continue repairs.')
 })
}
