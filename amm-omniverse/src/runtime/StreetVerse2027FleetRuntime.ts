import {STREETVERSE_2027_FLEET,STREETVERSE_2027_SPAWN_MIX,deterministicFleetPick,deterministicSpawnDomain,type StreetVerse2027VehicleDomain} from '../data/StreetVerse2027FleetCatalog'

export type StreetVerseFleetSpawn={
  id:string
  vehicleId:string
  domain:StreetVerse2027VehicleDomain
  x:number
  z:number
  altitude:number
  heading:number
  speed:number
}

export function buildChicago2027Fleet(seed=2027,count=120):StreetVerseFleetSpawn[]{
  const result:StreetVerseFleetSpawn[]=[]
  for(let i=0;i<count;i++){
    const domain=deterministicSpawnDomain(seed+i*17.17)
    const vehicle=deterministicFleetPick(seed+i*31.7,domain)
    const airborne=domain==='air'||domain==='experimental-air'
    result.push({
      id:`chicago-2027-${i}`,
      vehicleId:vehicle.id,
      domain,
      x:((seed*13+i*29)%180)-90,
      z:((seed*7+i*41)%220)-110,
      altitude:airborne?(domain==='experimental-air'?42+(i%5)*8:70+(i%6)*18):0,
      heading:(seed+i*37)%360,
      speed:domain==='motorcycle'?12+(i%8):domain==='air'?28+(i%12):domain==='experimental-air'?18+(i%9):6+(i%10),
    })
  }
  return result
}

export const CHICAGO_2027_DEFAULT_FLEET=buildChicago2027Fleet(2027,120)

export function fleetComposition(spawns=CHICAGO_2027_DEFAULT_FLEET){
  const counts=Object.fromEntries(Object.keys(STREETVERSE_2027_SPAWN_MIX).map(key=>[key,0])) as Record<string,number>
  for(const spawn of spawns)counts[spawn.domain]=(counts[spawn.domain]||0)+1
  return{total:spawns.length,counts,sourceVehicles:STREETVERSE_2027_FLEET.length}
}
