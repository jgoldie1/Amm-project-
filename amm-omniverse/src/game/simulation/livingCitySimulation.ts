/**
 * Living City Simulation (LCS)
 *
 * Deterministic domain model shared by StreetVerse Chicago and StreetVerse Global.
 * This is intentionally headless: rendering/gameplay consumes snapshots while the
 * server can later become authoritative for economy, rewards and persistence.
 */

export type LcsScope = 'chicago' | 'global'

export interface LcsNeighborhood {
  id: string
  name: string
  population: number
  households: number
  jobs: number
  housingUnits: number
  businesses: number
  landValue: number
  safety: number
  education: number
  health: number
  culture: number
  tourism: number
  traffic: number
  transit: number
  environment: number
}

export interface LcsCity {
  id: string
  name: string
  country: string
  currency: string
  population: number
  treasury: number
  taxRate: number
  unemploymentRate: number
  neighborhoods: LcsNeighborhood[]
}

export interface LcsWorld {
  version: 1
  scope: LcsScope
  tick: number
  cities: LcsCity[]
  history: LcsSnapshot[]
}

export interface LcsSnapshot {
  tick: number
  population: number
  jobs: number
  businesses: number
  averageLandValue: number
}

export type LcsAction =
  | { type: 'ADD_JOBS'; cityId: string; neighborhoodId: string; amount: number }
  | { type: 'ADD_HOUSING'; cityId: string; neighborhoodId: string; amount: number }
  | { type: 'OPEN_BUSINESS'; cityId: string; neighborhoodId: string; jobs?: number }
  | { type: 'INVEST_TRANSIT'; cityId: string; neighborhoodId: string; amount: number }
  | { type: 'INVEST_EDUCATION'; cityId: string; neighborhoodId: string; amount: number }
  | { type: 'INVEST_PUBLIC_SAFETY'; cityId: string; neighborhoodId: string; amount: number }
  | { type: 'HOST_CULTURAL_EVENT'; cityId: string; neighborhoodId: string; impact?: number }

const clamp=(n:number,min=0,max=100)=>Math.max(min,Math.min(max,n))

function neighborhood(id:string,name:string):LcsNeighborhood {
  return {id,name,population:1000,households:400,jobs:700,housingUnits:500,businesses:45,landValue:50,safety:60,education:60,health:60,culture:65,tourism:35,traffic:40,transit:55,environment:60}
}

export function createChicagoLcs():LcsWorld {
  return {
    version:1,scope:'chicago',tick:0,history:[],
    cities:[{id:'chicago',name:'Chicago',country:'US',currency:'USD',population:3000,treasury:1_000_000,taxRate:8,unemploymentRate:7,
      neighborhoods:[neighborhood('south-side','South Side'),neighborhood('downtown','Downtown'),neighborhood('west-side','West Side')]}]
  }
}

export function createGlobalLcs():LcsWorld {
  const world=createChicagoLcs()
  world.scope='global'
  world.cities.push(
    {id:'lagos',name:'Lagos',country:'NG',currency:'NGN',population:1000,treasury:1_000_000,taxRate:8,unemploymentRate:7,neighborhoods:[neighborhood('lagos-core','Lagos Core')]},
    {id:'abuja',name:'Abuja',country:'NG',currency:'NGN',population:1000,treasury:1_000_000,taxRate:8,unemploymentRate:7,neighborhoods:[neighborhood('abuja-core','Abuja Core')]}
  )
  return world
}

export function applyLcsAction(world:LcsWorld,action:LcsAction):LcsWorld {
  const next: LcsWorld=structuredClone(world)
  const city=next.cities.find(c=>c.id===action.cityId)
  const area=city?.neighborhoods.find(n=>n.id===action.neighborhoodId)
  if(!city||!area) return next

  switch(action.type){
    case 'ADD_JOBS': area.jobs+=Math.max(0,action.amount); break
    case 'ADD_HOUSING': area.housingUnits+=Math.max(0,action.amount); break
    case 'OPEN_BUSINESS': area.businesses+=1; area.jobs+=Math.max(1,action.jobs??3); area.culture=clamp(area.culture+1); break
    case 'INVEST_TRANSIT': area.transit=clamp(area.transit+action.amount); area.traffic=clamp(area.traffic-action.amount*.35); break
    case 'INVEST_EDUCATION': area.education=clamp(area.education+action.amount); break
    case 'INVEST_PUBLIC_SAFETY': area.safety=clamp(area.safety+action.amount); break
    case 'HOST_CULTURAL_EVENT': area.culture=clamp(area.culture+(action.impact??5)); area.tourism=clamp(area.tourism+(action.impact??5)); break
  }
  return tickLcs(next)
}

export function tickLcs(world:LcsWorld):LcsWorld {
  const next:LcsWorld=structuredClone(world)
  next.tick+=1
  for(const city of next.cities){
    let pop=0
    for(const n of city.neighborhoods){
      const capacity=n.housingUnits*2.4
      const employment=n.population ? n.jobs/n.population : 1
      const quality=(n.safety+n.education+n.health+n.environment+n.transit)/5
      const growth=(quality-50)*0.0005+(employment-.7)*0.01
      n.population=Math.max(0,Math.round(Math.min(capacity,n.population*(1+growth))))
      n.households=Math.round(n.population/2.5)
      n.landValue=clamp(n.landValue+(quality-50)*0.01+(n.culture-50)*0.005)
      n.traffic=clamp(n.traffic+(n.population/Math.max(1,n.jobs+n.housingUnits))*0.05-n.transit*0.001)
      pop+=n.population
    }
    city.population=pop
    const jobs=city.neighborhoods.reduce((s,n)=>s+n.jobs,0)
    city.unemploymentRate=clamp((1-Math.min(1,jobs/Math.max(1,pop*.55)))*100,0,100)
  }
  const all=next.cities.flatMap(c=>c.neighborhoods)
  next.history=[...next.history.slice(-119),{
    tick:next.tick,
    population:next.cities.reduce((s,c)=>s+c.population,0),
    jobs:all.reduce((s,n)=>s+n.jobs,0),
    businesses:all.reduce((s,n)=>s+n.businesses,0),
    averageLandValue:all.length?all.reduce((s,n)=>s+n.landValue,0)/all.length:0
  }]
  return next
}

/** Time Machine hook: inspect a prior simulation snapshot without mutating now. */
export function lcsSnapshotAt(world:LcsWorld,tick:number){
  return world.history.find(s=>s.tick===tick) ?? null
}
