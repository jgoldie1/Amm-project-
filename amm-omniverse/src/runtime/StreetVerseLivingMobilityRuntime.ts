export type StreetVerseAmbientJob={
  id:string
  kind:'rideshare'|'delivery'|'car-share'|'recovery'
  pickup:[number,number,number]
  dropoff:[number,number,number]
  label:string
  rewardXP:number
  rewardCredits:number
}

const POINTS=[
  {name:'Circle Park',p:[0,0,-28] as [number,number,number]},
  {name:'Roosevelt Road',p:[0,0,-14] as [number,number,number]},
  {name:'Taylor Street',p:[0,0,7] as [number,number,number]},
  {name:'Pilsen Gateway',p:[0,0,26] as [number,number,number]},
  {name:'Local Business',p:[18,0,-2] as [number,number,number]},
  {name:'Starter Homes',p:[-20,0,12] as [number,number,number]},
]

export function buildAmbientMobilityJobs(seed=2027,count=12):StreetVerseAmbientJob[]{
  const kinds:StreetVerseAmbientJob['kind'][]=['rideshare','rideshare','delivery','delivery','car-share','recovery']
  return Array.from({length:count},(_,i)=>{
    const a=POINTS[(seed+i*3)%POINTS.length],b=POINTS[(seed+i*5+1)%POINTS.length]
    const kind=kinds[(seed+i)%kinds.length]
    const label=kind==='rideshare'?'Pick up rider at '+a.name:kind==='delivery'?'Deliver from '+a.name+' to '+b.name:kind==='car-share'?'Car-share handoff at '+a.name:'Recover vehicle near '+a.name
    return{id:'mobility-job-'+seed+'-'+i,kind,pickup:a.p,dropoff:b.p,label,rewardXP:kind==='recovery'?240:120,rewardCredits:kind==='recovery'?450:220}
  })
}

export const CHICAGO_AMBIENT_MOBILITY_JOBS=buildAmbientMobilityJobs()
export const STREETVERSE_LIVING_MOBILITY_POLICY={activeAmbientJobs:12,regenerateAfterCompletion:true,npcRideDemand:true,npcDeliveryDemand:true,peerCarShareHandoffs:true,recoveryMissions:true,jobsReuseChicagoRoutePoints:true} as const