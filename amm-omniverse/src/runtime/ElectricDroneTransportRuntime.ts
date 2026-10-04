import type {DroneMission,DroneSwarmPlan} from '../logistics/droneSwarmNetwork'
import type {ElectricFleetAsset,ChargingStop} from '../logistics/electricFleetNetwork'

declare global{interface Window{__TRYAMM_EV_DRONE_NETWORK__?:{
 version:string;
 publishElectricAsset:(asset:ElectricFleetAsset)=>void;
 publishChargingStop:(stop:ChargingStop)=>void;
 publishDroneMission:(mission:DroneMission)=>void;
 publishSwarmPlan:(plan:DroneSwarmPlan)=>void;
}}}

export function installElectricDroneTransportRuntime(){
 if(typeof window==='undefined')return()=>{}
 if(window.__TRYAMM_EV_DRONE_NETWORK__)return()=>{}
 const publishElectricAsset=(asset:ElectricFleetAsset)=>window.dispatchEvent(new CustomEvent('tryamm:electric-fleet-asset',{detail:asset}))
 const publishChargingStop=(stop:ChargingStop)=>window.dispatchEvent(new CustomEvent('tryamm:fleet-charging-stop',{detail:stop}))
 const publishDroneMission=(mission:DroneMission)=>{
  window.dispatchEvent(new CustomEvent('tryamm:drone-mission-created',{detail:mission}))
  window.dispatchEvent(new CustomEvent('tryamm:logistics-freight-intent',{detail:{id:mission.id,domain:'logistics',action:'drone-mission',priority:'routine',payload:mission,requiresHumanApproval:true}}))
 }
 const publishSwarmPlan=(plan:DroneSwarmPlan)=>window.dispatchEvent(new CustomEvent('tryamm:drone-swarm-plan',{detail:plan}))
 window.__TRYAMM_EV_DRONE_NETWORK__={version:'1.0.0',publishElectricAsset,publishChargingStop,publishDroneMission,publishSwarmPlan}
 window.dispatchEvent(new CustomEvent('tryamm:ev-drone-network-ready',{detail:{
  version:'1.0.0',electricTrucks:true,depotCharging:true,routeEnergyPlanning:true,
  deliveryDrones:true,droneSwarms:true,warehouseScanSwarms:true,mappingSwarms:true,
  providerAndAirspaceGated:true,realFlightFailClosed:true
 }}))
 return()=>{delete window.__TRYAMM_EV_DRONE_NETWORK__}
}