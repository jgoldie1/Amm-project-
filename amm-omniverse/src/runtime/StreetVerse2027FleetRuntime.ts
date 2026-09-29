import {STREETVERSE_2027_FLEET,STREETVERSE_2027_SPAWN_MIX,deterministicFleetPick,deterministicSpawnDomain,type StreetVerse2027VehicleDomain} from '../data/StreetVerse2027FleetCatalog'
import {STREETVERSE_WHEEL_CULTURE_TRAFFIC,STREETVERSE_WHEEL_PACKAGES} from '../data/StreetVerseWheelCulture'

export type StreetVerseFleetSpawn={
  id:string
  vehicleId:string
  domain:StreetVerse2027VehicleDomain
  x:number
  z:number
  altitude:number
  heading:number
  speed:number
  wheelPackageId:string
  customWheelTraffic:boolean
}

export function buildChicago2027Fleet(seed=2027,count=120):StreetVerseFleetSpawn[]{
  const result:StreetVerseFleetSpawn[]=[]
  for(let i=0;i<count;i++){
    const domain=deterministicSpawnDomain(seed+i*17.17)
    const vehicle=deterministicFleetPick(seed+i*31.7,domain)
    const airborne=domain==='air'||domain==='experimental-air'
    const customEligible=domain==='road'||domain==='commercial'
    const customRoll=Math.abs(Math.floor((seed+i*43.17)*997))%100
    const customWheelTraffic=customEligible&&customRoll<22
    const trafficVariant=customWheelTraffic?STREETVERSE_WHEEL_CULTURE_TRAFFIC[Math.abs(Math.floor(seed+i*19.3))%STREETVERSE_WHEEL_CULTURE_TRAFFIC.length]:null
    const wheelPackageId=trafficVariant?.wheelPackageId||STREETVERSE_WHEEL_PACKAGES[0].id
    result.push({
      id:`chicago-2027-${i}`,
      vehicleId:vehicle.id,
      domain,
      x:((seed*13+i*29)%180)-90,
      z:((seed*7+i*41)%220)-110,
      altitude:airborne?(domain==='experimental-air'?42+(i%5)*8:70+(i%6)*18):0,
      heading:(seed+i*37)%360,
      speed:domain==='motorcycle'?12+(i%8):domain==='air'?28+(i%12):domain==='experimental-air'?18+(i%9):6+(i%10),
      wheelPackageId,
      customWheelTraffic,
    })
  }
  return result
}

export const CHICAGO_2027_DEFAULT_FLEET=buildChicago2027Fleet(2027,600)

export function fleetComposition(spawns=CHICAGO_2027_DEFAULT_FLEET){
  const counts=Object.fromEntries(Object.keys(STREETVERSE_2027_SPAWN_MIX).map(key=>[key,0])) as Record<string,number>
  for(const spawn of spawns)counts[spawn.domain]=(counts[spawn.domain]||0)+1
  const customWheelTraffic=spawns.filter(x=>x.customWheelTraffic).length
  return{total:spawns.length,counts,sourceVehicles:STREETVERSE_2027_FLEET.length,customWheelTraffic,factoryWheelTraffic:spawns.length-customWheelTraffic}
}

export function streamChicagoFleetWindow(input:{
  playerX:number
  playerZ:number
  maxGround?:number
  maxAir?:number
  spawns?:StreetVerseFleetSpawn[]
}){
  const source=input.spawns||CHICAGO_2027_DEFAULT_FLEET
  const ground=source
    .filter(x=>x.domain!=='air'&&x.domain!=='experimental-air')
    .map(x=>({...x,distance:Math.hypot(x.x-input.playerX,x.z-input.playerZ)}))
    .sort((a,b)=>a.distance-b.distance)
    .slice(0,input.maxGround??18)
  const air=source
    .filter(x=>x.domain==='air'||x.domain==='experimental-air')
    .map(x=>({...x,distance:Math.hypot(x.x-input.playerX,x.z-input.playerZ)}))
    .sort((a,b)=>a.distance-b.distance)
    .slice(0,input.maxAir??2)
  return{ground,air,totalLogical:source.length,rendered:ground.length+air.length}
}

export const STREETVERSE_2027_STREAMING_POLICY={
  logicalCityFleet:600,
  mobileGroundRenderBudget:18,
  mobileAirRenderBudget:2,
  desktopGroundRenderBudget:48,
  desktopAirRenderBudget:5,
  distantVehiclesUseImpostorsOrTelemetryOnly:true,
  aircraftUseSeparatedAltitudeCorridors:true,
  experimentalAirNeverGroundTraffic:true,
  customWheelTrafficTargetPercent:22,
  factoryWheelTrafficRemainsMajority:true,
} as const