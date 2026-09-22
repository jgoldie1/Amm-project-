import type {VolcanoDisplayCapability,VolcanoDisplayTarget} from './volcanoExperienceRuntime'
import type {HoloCubeSession} from './holoCubeRuntime'

export type HoloOsWorkload='desktop-work'|'creator-studio'|'video-tv'|'volcano-game'|'streetverse'|'holographic-projection'|'xr'|'hologpt'
export type HoloProjectionMode='tv-screen'|'projector'|'projection-array'|'spatial-display'|'light-field'|'xr-simulated-hologram'|'experimental-free-space'

export type QuantumWorkstation={
 id:string
 name:string
 maxSessionUsers:10
 workloads:HoloOsWorkload[]
 displays:VolcanoDisplayCapability[]
 projectionModes:HoloProjectionMode[]
}

export function createQuantumWorkstation(id:string,name='HoloCube One Quantum Workstation'):QuantumWorkstation{
 return{id,name,maxSessionUsers:10,workloads:['desktop-work','creator-studio','video-tv','volcano-game','streetverse','holographic-projection','xr','hologpt'],displays:[],projectionModes:['tv-screen','projector','projection-array','spatial-display','light-field','xr-simulated-hologram','experimental-free-space']}
}

export function attachWorkstationDisplay(workstation:QuantumWorkstation,display:VolcanoDisplayCapability){
 return{...workstation,displays:[...workstation.displays.filter(d=>d.id!==display.id),display]}
}

export function projectionModeForTarget(target:VolcanoDisplayTarget):HoloProjectionMode{
 if(target==='tv'||target==='laptop'||target==='desktop'||target==='phone'||target==='tablet')return'tv-screen'
 if(target==='ar'||target==='vr'||target==='mixed-reality')return'xr-simulated-hologram'
 if(target==='holo-lab'||target==='full-room')return'projection-array'
 return'tv-screen'
}

export function workstationLoadPolicy(workloads:HoloOsWorkload[],session?:HoloCubeSession){
 const gaming=workloads.includes('volcano-game')||workloads.includes('streetverse')
 const projection=workloads.includes('holographic-projection')||workloads.includes('xr')
 return{
  prioritizeInput:gaming,
  prioritizeForegroundRender:gaming||projection,
  allowBackgroundDesktop:true,
  participantCount:session?.users.length||1,
  maxParticipants:10,
  aiMayOptimize:true,
  aiMayOverrideOperatorStop:false,
 }
}
