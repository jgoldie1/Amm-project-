import {GLOBAL_PROPERTY_LAND_NETWORK,PROPERTY_NETWORK_FLOW,type PropertyLane} from '../data/GlobalPropertyLandNetworkRegistry'
let installed=false
export function getGlobalPropertyLandNetwork(){return {entries:GLOBAL_PROPERTY_LAND_NETWORK,flow:PROPERTY_NETWORK_FLOW}}
export function installGlobalPropertyLandNetworkRuntime(){
 if(installed||typeof window==='undefined')return;installed=true
 const ready={network:'TRYAMM Property & Land Network',entries:GLOBAL_PROPERTY_LAND_NETWORK,flow:PROPERTY_NETWORK_FLOW,capabilities:['global-stays','housing-choice-discovery','farmland','land-bank','propertyverse-market','streetverse-discovery','my-world-ready','marketplace-ready'],officialAgency:false}
 queueMicrotask(()=>window.dispatchEvent(new CustomEvent('tryamm:property-network-ready',{detail:ready})))
 window.addEventListener('tryamm:property-network-request',(event:Event)=>{const d=(event as CustomEvent<{lane?:PropertyLane}>).detail||{};const entries=d.lane?GLOBAL_PROPERTY_LAND_NETWORK.filter(e=>e.lane===d.lane):GLOBAL_PROPERTY_LAND_NETWORK;window.dispatchEvent(new CustomEvent('tryamm:property-network-result',{detail:{entries,flow:PROPERTY_NETWORK_FLOW}}))})
 window.addEventListener('tryamm:streetverse-enter',()=>window.dispatchEvent(new CustomEvent('tryamm:property-network-context',{detail:{surface:'streetverse',message:'PropertyVerse discovery is available for stays, affordable-housing resources, farmland and redevelopment opportunities.'}})))
}
