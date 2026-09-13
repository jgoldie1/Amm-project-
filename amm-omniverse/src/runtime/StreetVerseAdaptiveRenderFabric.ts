export type RenderTier='safe'|'balanced'|'high'|'ultra'|'cloud'
export type ReconstructionMode='none'|'spatial'|'temporal'
export type RenderPolicy={tier:RenderTier;renderScale:number;targetFps:number;reconstruction:ReconstructionMode;frameGeneration:false;rayEffects:'off'|'selective'|'high';shadowQuality:'low'|'medium'|'high';reflectionQuality:'off'|'screen-space'|'hybrid';npcBudget:number;vehicleBudget:number;foliageBudget:number;particleBudget:number;streaming:'local'|'edge'|'cloud';reasons:string[]}

type PerfDetail={quality?:string;metrics?:{fps?:number;rtt?:number};fps?:number;rttMs?:number;longTaskMs?:number}
type NavigatorGPU=Navigator&{deviceMemory?:number;gpu?:unknown}

const KEY='tryamm_adaptive_render_policy_v1'
let installed=false

function hardwareProfile(){
 const nav=navigator as NavigatorGPU
 const ua=navigator.userAgent||''
 const mobile=/iPhone|iPad|iPod|Android/i.test(ua)
 const olderIOS=/OS (1[0-6])[_\d]* like Mac OS X/i.test(ua)
 const memory=Number(nav.deviceMemory||0)
 const cores=Number(navigator.hardwareConcurrency||0)
 const webgpu=!!nav.gpu
 let webgl=false
 try{const c=document.createElement('canvas');webgl=!!(c.getContext('webgl2')||c.getContext('webgl'))}catch{}
 return {mobile,olderIOS,memory,cores,webgpu,webgl}
}

function policyFrom(detail:PerfDetail):RenderPolicy{
 const hw=hardwareProfile()
 const fps=Number(detail.metrics?.fps??detail.fps??60)
 const rtt=Number(detail.metrics?.rtt??detail.rttMs??0)
 const longTask=Number(detail.longTaskMs??0)
 const reasons:string[]=[]
 if(!hw.webgl||hw.olderIOS){reasons.push('constrained graphics path');return {tier:'safe',renderScale:0.7,targetFps:30,reconstruction:'spatial',frameGeneration:false,rayEffects:'off',shadowQuality:'low',reflectionQuality:'off',npcBudget:18,vehicleBudget:12,foliageBudget:220,particleBudget:80,streaming:rtt>180?'edge':'local',reasons}}
 if(fps<38||longTask>500){reasons.push('protect frame time before visual fidelity');return {tier:'balanced',renderScale:0.72,targetFps:45,reconstruction:'temporal',frameGeneration:false,rayEffects:'off',shadowQuality:'medium',reflectionQuality:'screen-space',npcBudget:36,vehicleBudget:24,foliageBudget:520,particleBudget:180,streaming:rtt>160?'edge':'local',reasons}}
 if(hw.webgpu&&fps>=57&&(!hw.memory||hw.memory>=8)&&(!hw.cores||hw.cores>=8)){reasons.push('high-capability WebGPU device');return {tier:'ultra',renderScale:0.9,targetFps:60,reconstruction:'temporal',frameGeneration:false,rayEffects:'selective',shadowQuality:'high',reflectionQuality:'hybrid',npcBudget:96,vehicleBudget:64,foliageBudget:1800,particleBudget:700,streaming:rtt<70?'local':'edge',reasons}}
 if(fps>=52){reasons.push('healthy real-time budget');return {tier:'high',renderScale:0.82,targetFps:60,reconstruction:'temporal',frameGeneration:false,rayEffects:'selective',shadowQuality:'high',reflectionQuality:'screen-space',npcBudget:64,vehicleBudget:42,foliageBudget:1100,particleBudget:420,streaming:rtt>140?'edge':'local',reasons}}
 reasons.push('balanced compatibility profile')
 return {tier:'balanced',renderScale:0.76,targetFps:50,reconstruction:'temporal',frameGeneration:false,rayEffects:'off',shadowQuality:'medium',reflectionQuality:'screen-space',npcBudget:44,vehicleBudget:30,foliageBudget:700,particleBudget:260,streaming:rtt>150?'edge':'local',reasons}
}

function publish(policy:RenderPolicy){
 try{localStorage.setItem(KEY,JSON.stringify({...policy,updatedAt:Date.now()}))}catch{}
 window.dispatchEvent(new CustomEvent('tryamm:adaptive-render-policy',{detail:policy}))
 window.dispatchEvent(new CustomEvent('tryamm:scene-budget',{detail:{npc:policy.npcBudget,vehicles:policy.vehicleBudget,foliage:policy.foliageBudget,particles:policy.particleBudget,tier:policy.tier}}))
 window.dispatchEvent(new CustomEvent('tryamm:dynamic-resolution',{detail:{scale:policy.renderScale,targetFps:policy.targetFps,reconstruction:policy.reconstruction}}))
}

export function installStreetVerseAdaptiveRenderFabric(){
 if(installed||typeof window==='undefined')return
 installed=true
 let last:PerfDetail={metrics:{fps:60,rtt:0},longTaskMs:0}
 const apply=(detail:PerfDetail)=>{last={...last,...detail,metrics:{...last.metrics,...detail.metrics}};publish(policyFrom(last))}
 window.addEventListener('tryamm:quantum-lag-buster',(event:Event)=>apply((event as CustomEvent<PerfDetail>).detail||{}))
 window.addEventListener('tryamm:live-health',(event:Event)=>apply((event as CustomEvent<PerfDetail>).detail||{}))
 publish(policyFrom(last))
}

export function getStreetVerseAdaptiveRenderPolicy():RenderPolicy|undefined{
 try{return JSON.parse(localStorage.getItem(KEY)||'null')||undefined}catch{return undefined}
}
