import {chooseLod,STREAM_BUDGETS,type DeviceTier} from './AssetLodStreamingEngine'
import {createStandardCitySlots,TryammAssetRegistry} from './TryammAssetRegistry'
import {populationPlan,trafficPlan,ecologyPlan,scaleDistrictForDevice,type DistrictManifest} from './LivingDistrictSimulation'

export interface CityRuntimeState{
 cityId:string;activeDistrictId:string;loadedDistrictIds:string[];deviceTier:DeviceTier;
 weatherKey?:string;timeOfDay:number;paused:boolean;
}

export interface CityRuntimeFrame{
 cityId:string;districtId:string;assetPlacements:number;population:number;vehicles:number;ecology:number;
 lod:number;prefetch:string[];budget:typeof STREAM_BUDGETS[DeviceTier]
}

export class LivingCityRuntimeController{
 constructor(private registry:TryammAssetRegistry,private districts:DistrictManifest[]){}
 frame(state:CityRuntimeState,playerDistance=0):CityRuntimeFrame{
  const district=this.districts.find(d=>d.id===state.activeDistrictId&&d.cityId===state.cityId)
  if(!district)throw new Error('Active district is not registered for this city')
  const densityTier=state.deviceTier==='low-mobile'?'low-mobile':state.deviceTier==='mobile'?'mobile':'desktop'
  const scaled=scaleDistrictForDevice(district,densityTier)
  const slots=createStandardCitySlots(state.cityId)
  const assetPlacements=slots.reduce((n,slot)=>n+this.registry.planPlacement(slot).length,0)
  const lod=chooseLod(playerDistance)
  return{cityId:state.cityId,districtId:district.id,assetPlacements,
   population:state.paused?0:populationPlan(scaled).length,vehicles:state.paused?0:trafficPlan(scaled).length,
   ecology:state.paused?0:ecologyPlan(scaled).length,lod:lod.level,prefetch:district.adjacent,
   budget:STREAM_BUDGETS[state.deviceTier]}
 }
}

export const LIVING_CITY_RUNTIME_ORDER=[
 'resolve-city-and-district','resolve-device-budget','load-certified-assets','apply-lod',
 'spawn-synthetic-population','start-traffic','start-ecology','apply-weather-and-time',
 'activate-businesses-and-missions','prefetch-adjacent-districts','emit-runtime-telemetry',
] as const

export const LIVING_CITY_RUNTIME_GATES={
 certifiedAssetsOnly:true,gracefulMissingAssets:true,offlineDegradation:true,
 accessibilityEntitiesProtected:true,rewardEventsServerAuthoritative:true,
 preciseUserLocationNotRequired:true,weatherUsesCityLevelAdapter:true,
 telemetryDataMinimized:true,
} as const
