export type LivingCitySystem='population'|'housing'|'business'|'jobs'|'power'|'water'|'waste'|'transit'|'traffic'|'public-services'|'economy'|'events'
export type SimulationLOD='paused'|'district'|'near-player'|'interior'

export interface LivingBuildingState {
 buildingPassportId:string
 units:{total?:number;occupied?:number;available?:number}
 commercial:{spaces:number;open:number;jobs:number}
 demand:{power:number;water:number;waste:number}
 mobility:{pedestrians:number;vehicles:number;transitRiders:number}
 economy:{localSpend:number;payroll:number}
 events:string[]
 updatedAt:number
}

export interface LivingCityRule {
 id:string; inputs:LivingCitySystem[]; output:LivingCitySystem; description:string
}

export const LIVING_CITY_RULES:LivingCityRule[]=[
 {id:'housing-population',inputs:['housing'],output:'population',description:'Occupied housing creates simulated resident demand without exposing real resident identities.'},
 {id:'population-demand',inputs:['population'],output:'water',description:'Population drives aggregate water demand.'},
 {id:'population-power',inputs:['population','business'],output:'power',description:'Residents and businesses drive aggregate energy demand.'},
 {id:'business-jobs',inputs:['business'],output:'jobs',description:'Active commercial spaces create simulated jobs.'},
 {id:'jobs-mobility',inputs:['jobs','population'],output:'transit',description:'Work and activity demand creates trips across the city.'},
 {id:'mobility-traffic',inputs:['transit','population'],output:'traffic',description:'Mode choice and trips affect simulated traffic.'},
 {id:'city-events',inputs:['business','jobs','transit','public-services'],output:'events',description:'Meaningful simulation changes can generate StreetVerse missions and world events.'},
]

export const CIRCLE_PARK_LIVING_CITY:LivingBuildingState={
 buildingPassportId:'chi-circle-park-1111-laflin',
 units:{total:418},
 commercial:{spaces:0,open:0,jobs:0},
 demand:{power:0,water:0,waste:0},
 mobility:{pedestrians:0,vehicles:0,transitRiders:0},
 economy:{localSpend:0,payroll:0},
 events:[],
 updatedAt:0
}

export function simulationLOD(distanceMeters:number,inside:boolean):SimulationLOD{
 if(inside)return'interior'
 if(distanceMeters<=250)return'near-player'
 if(distanceMeters<=5000)return'district'
 return'paused'
}

export function livingCityPrivacy(){
 return{
  residents:'synthetic-or-consenting-only',
  occupancy:'aggregate-simulation-not-current-household-data',
  infrastructure:'non-sensitive-simulation',
  securitySystems:'excluded'
 } as const
}
