export type DistrictActivity='residential'|'business'|'park'|'entertainment'|'transit'|'waterfront'|'mixed'
export interface DistrictManifest{
 id:string;cityId:string;activity:DistrictActivity;populationBudget:number;vehicleBudget:number;
 ecologyBudget:number;businessBudget:number;missionBudget:number;adjacent:string[]
}
export interface RuntimeEntity{kind:'npc'|'vehicle'|'animal';archetype:string;behavior:string;synthetic:boolean}

export const POPULATION_ARCHETYPES=['resident','worker','shopper','creator','visitor','merchant','performer','commuter'] as const
export const TRAFFIC_ARCHETYPES=['car','taxi','bus','delivery','bike','service'] as const
export const ECOLOGY_ARCHETYPES=['bird','dog','park-wildlife'] as const

export function populationPlan(d:DistrictManifest):RuntimeEntity[]{
 const roles=POPULATION_ARCHETYPES
 return Array.from({length:d.populationBudget},(_,i)=>({
  kind:'npc' as const,archetype:roles[i%roles.length],behavior:d.activity==='transit'?'commute':'ambient',synthetic:true,
 }))
}
export function trafficPlan(d:DistrictManifest):RuntimeEntity[]{
 return Array.from({length:d.vehicleBudget},(_,i)=>({
  kind:'vehicle' as const,archetype:TRAFFIC_ARCHETYPES[i%TRAFFIC_ARCHETYPES.length],behavior:'route-network',synthetic:true,
 }))
}
export function ecologyPlan(d:DistrictManifest):RuntimeEntity[]{
 return Array.from({length:d.ecologyBudget},(_,i)=>({
  kind:'animal' as const,archetype:ECOLOGY_ARCHETYPES[i%ECOLOGY_ARCHETYPES.length],behavior:d.activity==='park'?'park-roam':'ambient',synthetic:true,
 }))
}

export function scaleDistrictForDevice(d:DistrictManifest,tier:'low-mobile'|'mobile'|'desktop'){
 const factor=tier==='low-mobile'?.45:tier==='mobile'?.7:1
 return{...d,populationBudget:Math.max(4,Math.floor(d.populationBudget*factor)),
  vehicleBudget:Math.max(2,Math.floor(d.vehicleBudget*factor)),ecologyBudget:Math.floor(d.ecologyBudget*factor)}
}

export const LIVING_DISTRICT_RULES={
 syntheticPopulationOnly:true,
 noRealResidentCloning:true,
 noPrivateAddressInference:true,
 cityCultureComesFromReviewedStylePacks:true,
 trafficUsesAuthorizedOrOpenRoadData:true,
 ecologyMustMatchReviewedRegionalProfile:true,
 despawnOutsideStreamingBudget:true,
 preserveMissionAndAccessibilityEntities:true,
 deterministicSimulationSeeds:true,
 serverAuthorityForRewardBearingEvents:true,
} as const
