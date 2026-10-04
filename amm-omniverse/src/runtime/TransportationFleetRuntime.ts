import type {FleetAssignment} from '../logistics/fleetManagement'
import type {LoadOffer,OwnerOperatorProfile} from '../logistics/ownerOperatorNetwork'

declare global{interface Window{__TRYAMM_TRANSPORT_NETWORK__?:{
 version:string;
 publishOwnerOperator:(profile:OwnerOperatorProfile)=>void;
 publishLoadOffer:(offer:LoadOffer)=>void;
 publishAssignment:(assignment:FleetAssignment)=>void;
}}}

export function installTransportationFleetRuntime(){
 if(typeof window==='undefined')return()=>{}
 if(window.__TRYAMM_TRANSPORT_NETWORK__)return()=>{}
 const publishOwnerOperator=(profile:OwnerOperatorProfile)=>window.dispatchEvent(new CustomEvent('tryamm:owner-operator-profile',{detail:{...profile,source:'transport-network'}}))
 const publishLoadOffer=(offer:LoadOffer)=>{
  window.dispatchEvent(new CustomEvent('tryamm:owner-operator-load-offer',{detail:offer}))
  window.dispatchEvent(new CustomEvent('tryamm:job-match-request',{detail:{job:{id:offer.id,skills:['commercial-driving','freight','bol-pod'],languages:['any'],remote:false,minLevel:1,city:offer.origin}}}))
 }
 const publishAssignment=(assignment:FleetAssignment)=>window.dispatchEvent(new CustomEvent('tryamm:fleet-assignment',{detail:assignment}))
 window.__TRYAMM_TRANSPORT_NETWORK__={version:'1.0.0',publishOwnerOperator,publishLoadOffer,publishAssignment}
 window.dispatchEvent(new CustomEvent('tryamm:transport-network-ready',{detail:{
  version:'1.0.0',fleetManagement:true,ownerOperators:true,independentTruckers:true,
  bolPod:true,maintenance:true,fuelCharging:true,middleverseWorkMatching:true,
  externalBookingFailClosed:true
 }}))
 return()=>{delete window.__TRYAMM_TRANSPORT_NETWORK__}
}