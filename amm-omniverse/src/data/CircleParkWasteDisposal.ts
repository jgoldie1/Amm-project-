export type CircleParkWasteKind='garbage'|'litter'|'recycling'

export interface CircleParkWastePickup{
  id:string
  kind:CircleParkWasteKind
  label:string
  position:[number,number,number]
  rewardXP:number
}

export const CIRCLE_PARK_WASTE_PICKUPS:CircleParkWastePickup[]=[
  {id:'garbage-pickup-a',kind:'garbage',label:'Garbage bag near the park path',position:[3,1.2,12],rewardXP:20},
  {id:'garbage-pickup-b',kind:'garbage',label:'Garbage bag near the south block',position:[-4,1.2,-20],rewardXP:20},
  {id:'garbage-pickup-c',kind:'litter',label:'Loose litter near the north path',position:[1,1.2,23],rewardXP:20},
]

export const CIRCLE_PARK_DISPOSAL_POINT={
  id:'circle-park-dumpster',
  label:'Circle Park disposal dumpster',
  position:[5,1.2,27] as [number,number,number],
  interactionRadius:4.5,
} as const

export const CIRCLE_PARK_RECYCLING_POINT={
  id:'circle-park-recycling-bin',
  label:'Circle Park recycling bin',
  position:[6,1.2,10] as [number,number,number],
  interactionRadius:3.5,
} as const

export const CIRCLE_PARK_CLEANUP_MISSION={
  id:'circle-park-cleanup',
  title:'Clean Up Circle Park',
  description:'Pick up visible trash and dispose of it at the marked dumpster. Keep the neighborhood playable and clean.',
  pickupRadius:3.2,
  carryLimit:1,
  completionRewardXP:75,
  pickupCount:CIRCLE_PARK_WASTE_PICKUPS.length,
  oneHandAccessible:true,
  voiceActionLabels:['pick up trash','dispose garbage','drop trash'],
} as const

const distance2D=(a:[number,number,number],b:[number,number,number])=>Math.hypot(a[0]-b[0],a[2]-b[2])

export function nearestAvailableWaste(
  player:[number,number,number],
  disposedIds:Iterable<string>,
){
  const disposed=new Set(disposedIds)
  return CIRCLE_PARK_WASTE_PICKUPS
    .filter(item=>!disposed.has(item.id))
    .map(item=>({item,distance:distance2D(player,item.position)}))
    .sort((a,b)=>a.distance-b.distance)[0]??null
}

export function canPickUpWaste(input:{
  player:[number,number,number]
  pickup:CircleParkWastePickup
  carryingId:string|null
  disposedIds:Iterable<string>
}){
  if(input.carryingId)return{allowed:false,reason:'carry-limit'}
  if(new Set(input.disposedIds).has(input.pickup.id))return{allowed:false,reason:'already-disposed'}
  const distance=distance2D(input.player,input.pickup.position)
  return{allowed:distance<=CIRCLE_PARK_CLEANUP_MISSION.pickupRadius,reason:distance<=CIRCLE_PARK_CLEANUP_MISSION.pickupRadius?'near-pickup':'too-far',distance}
}

export function canDisposeWaste(player:[number,number,number],carryingId:string|null){
  if(!carryingId)return{allowed:false,reason:'nothing-carried'}
  const distance=distance2D(player,CIRCLE_PARK_DISPOSAL_POINT.position)
  return{allowed:distance<=CIRCLE_PARK_DISPOSAL_POINT.interactionRadius,reason:distance<=CIRCLE_PARK_DISPOSAL_POINT.interactionRadius?'near-dumpster':'too-far',distance}
}

export function cleanupMissionProgress(disposedIds:Iterable<string>){
  const disposed=new Set(disposedIds)
  const disposedCount=CIRCLE_PARK_WASTE_PICKUPS.filter(item=>disposed.has(item.id)).length
  return{
    disposedCount,
    total:CIRCLE_PARK_WASTE_PICKUPS.length,
    complete:disposedCount===CIRCLE_PARK_WASTE_PICKUPS.length,
    completionRewardXP:CIRCLE_PARK_CLEANUP_MISSION.completionRewardXP,
  }
}