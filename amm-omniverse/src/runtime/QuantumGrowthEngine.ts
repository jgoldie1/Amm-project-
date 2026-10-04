import {buildQuantumSeoPlan} from '../services/quantumSeo'
import {BACK_CHANNEL_FLOW} from '../services/backChannel'

declare global{interface Window{__TRYAMM_GROWTH_ENGINE__?:{
 quantumSeo:(input:Parameters<typeof buildQuantumSeoPlan>[0])=>ReturnType<typeof buildQuantumSeoPlan>;
 backChannelFlow:typeof BACK_CHANNEL_FLOW
}}}

export function installQuantumGrowthEngine(){
 if(typeof window==='undefined')return()=>{}
 window.__TRYAMM_GROWTH_ENGINE__={quantumSeo:buildQuantumSeoPlan,backChannelFlow:BACK_CHANNEL_FLOW}
 window.dispatchEvent(new CustomEvent('tryamm:quantum-growth-ready',{detail:{quantumSeo:true,backChannel:true,permissionBased:true,whiteHatSeo:true}}))
 return()=>{delete window.__TRYAMM_GROWTH_ENGINE__}
}