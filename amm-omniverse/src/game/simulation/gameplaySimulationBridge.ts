import type { CompiledNeighborhood } from './neighborhoodCompiler'

export interface GameplaySpawnPlan {
  neighborhoodId:string
  residents:number
  workers:number
  vehicles:number
  businesses:number
  missions:number
  transitActors:number
  accessibilityGuides:number
}

export interface GameplayConsequence {
  jobs:number
  businesses:number
  population:number
  traffic:number
  culture:number
  reputation:number
  cashReward:number
  xpReward:number
}

export type GameplayAction =
  | 'complete-delivery'
  | 'open-business'
  | 'complete-transit-mission'
  | 'host-creator-event'
  | 'public-safety-mission'

export function createGameplaySpawnPlan(n:CompiledNeighborhood):GameplaySpawnPlan {
  return {
    neighborhoodId:n.id,
    residents:Math.min(n.npcCapacity,Math.max(24,n.homes*2)),
    workers:Math.min(n.npcCapacity,Math.max(12,n.businesses*3)),
    vehicles:Math.min(n.trafficCapacity,Math.max(8,Math.round(n.roads*.75))),
    businesses:n.businesses,
    missions:n.missionSlots,
    transitActors:Math.max(2,n.transitStops*2),
    accessibilityGuides:Math.max(1,Math.round(n.accessibleRoutes/2)),
  }
}

/**
 * Shared consequence contract: mission/player actions can update both player
 * progression and the Living City Simulation instead of producing isolated rewards.
 */
export function consequenceFor(action:GameplayAction):GameplayConsequence {
  switch(action){
    case 'complete-delivery':
      return {jobs:0,businesses:0,population:0,traffic:1,culture:0,reputation:2,cashReward:125,xpReward:80}
    case 'open-business':
      return {jobs:4,businesses:1,population:2,traffic:1,culture:1,reputation:4,cashReward:0,xpReward:150}
    case 'complete-transit-mission':
      return {jobs:1,businesses:0,population:1,traffic:-2,culture:0,reputation:3,cashReward:200,xpReward:120}
    case 'host-creator-event':
      return {jobs:2,businesses:0,population:1,traffic:2,culture:5,reputation:5,cashReward:250,xpReward:180}
    case 'public-safety-mission':
      return {jobs:0,businesses:0,population:0,traffic:0,culture:0,reputation:4,cashReward:175,xpReward:130}
  }
}

export function validateSpawnPlan(plan:GameplaySpawnPlan):string[] {
  const errors:string[]=[]
  if(plan.residents<1) errors.push('residents')
  if(plan.workers<1) errors.push('workers')
  if(plan.vehicles<1) errors.push('vehicles')
  if(plan.businesses<1) errors.push('businesses')
  if(plan.missions<1) errors.push('missions')
  return errors
}
