import {CIRCLE_PARK_DISPOSAL_POINT,CIRCLE_PARK_WASTE_PICKUPS} from './CircleParkWasteDisposal'

export type ChicagoCheckpoint={
  id:'roosevelt'|'taylor'|'pilsen'
  label:string
  position:[number,number,number]
  rewardXP:number
}

export const CIRCLE_PARK_REPAIR_KIT={
  id:'circle-park-repair-kit',
  label:'Vehicle Repair Kit',
  position:[4,1,-6] as [number,number,number],
  interactionRadius:3.4,
} as const

export const CIRCLE_PARK_REPAIR_CAR={
  id:'circle-park-repair-car',
  label:'Blue Starter Car',
  position:[3,.65,-1] as [number,number,number],
  interactionRadius:4,
} as const

export const STREETVERSE_CHICAGO_ROUTE:ChicagoCheckpoint[]=[
  {id:'roosevelt',label:'Roosevelt Road',position:[0,1.2,-14],rewardXP:75},
  {id:'taylor',label:'Taylor Street',position:[0,1.2,7],rewardXP:75},
  {id:'pilsen',label:'Pilsen Gateway',position:[0,1.2,26],rewardXP:150},
]

export const CIRCLE_PARK_CHICAGO_COMPLETION={
  id:'circle-park-roosevelt-taylor-pilsen',
  title:'Circle Park → Roosevelt → Taylor → Pilsen',
  cleanupCount:CIRCLE_PARK_WASTE_PICKUPS.length,
  routeCount:STREETVERSE_CHICAGO_ROUTE.length,
  repairSteps:['OPEN HOOD','FIX ENGINE','CLOSE HOOD'] as const,
  cleanupRewardXP:75,
  repairRewardXP:125,
  routeRewardXP:300,
  completionRewardXP:250,
  totalMissionXP:750,
  oneHandAccessible:true,
} as const

export const distanceXZ=(a:[number,number,number],b:[number,number,number])=>Math.hypot(a[0]-b[0],a[2]-b[2])

export function nearestWaste(player:[number,number,number],disposed:Iterable<string>,carrying:string|null){
  if(carrying)return null
  const done=new Set(disposed)
  return CIRCLE_PARK_WASTE_PICKUPS
    .filter(item=>!done.has(item.id))
    .map(item=>({item,distance:distanceXZ(player,item.position)}))
    .filter(x=>x.distance<=3.4)
    .sort((a,b)=>a.distance-b.distance)[0]??null
}

export function nearDisposal(player:[number,number,number]){
  return distanceXZ(player,CIRCLE_PARK_DISPOSAL_POINT.position)<=CIRCLE_PARK_DISPOSAL_POINT.interactionRadius
}

export function nearRepairKit(player:[number,number,number]){
  return distanceXZ(player,CIRCLE_PARK_REPAIR_KIT.position)<=CIRCLE_PARK_REPAIR_KIT.interactionRadius
}

export function nearRepairCar(player:[number,number,number],carPosition:[number,number,number]=CIRCLE_PARK_REPAIR_CAR.position){
  return distanceXZ(player,carPosition)<=CIRCLE_PARK_REPAIR_CAR.interactionRadius
}

export function routeObjective(index:number){
  return STREETVERSE_CHICAGO_ROUTE[Math.max(0,Math.min(STREETVERSE_CHICAGO_ROUTE.length-1,index))]
}

export function chicagoNextObjective(input:{
  disposedCount:number
  carrying:boolean
  repairKit:boolean
  repairStep:number
  driving:boolean
  routeIndex:number
  routeComplete:boolean
}){
  if(input.disposedCount<CIRCLE_PARK_WASTE_PICKUPS.length)return input.carrying?'TAKE TRASH TO DUMPSTER':'PICK UP TRASH'
  if(!input.repairKit)return'GET REPAIR KIT'
  if(input.repairStep<3)return CIRCLE_PARK_CHICAGO_COMPLETION.repairSteps[input.repairStep]??'REPAIR CAR'
  if(!input.driving&&!input.routeComplete)return'ENTER REPAIRED CAR'
  if(!input.routeComplete)return`DRIVE TO ${routeObjective(input.routeIndex).label.toUpperCase()}`
  return'CHICAGO DISTRICT SLICE COMPLETE'
}
