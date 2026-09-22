export type VolcanoDisplayTarget='phone'|'tablet'|'laptop'|'desktop'|'tv'|'ar'|'vr'|'mixed-reality'|'holo-lab'|'full-room'
export type VolcanoSessionRole='primary'|'companion'|'spectator'|'controller'|'room-anchor'
export type VolcanoTransport='local-display'|'webrtc'|'cast-adapter'|'xr-session'

export type VolcanoDisplayCapability={
 id:string
 target:VolcanoDisplayTarget
 role:VolcanoSessionRole
 transport:VolcanoTransport
 maxFps:30|60|90|120
 spatial:boolean
 controllerInput:boolean
 audio:boolean
}

export type VolcanoExperienceSession={
 id:string
 primary:VolcanoDisplayCapability
 companions:VolcanoDisplayCapability[]
 synchronized:boolean
}

export function recommendedVolcanoFps(target:VolcanoDisplayTarget){
 if(target==='vr'||target==='mixed-reality'||target==='ar'||target==='holo-lab'||target==='full-room')return 90 as const
 if(target==='tv'||target==='laptop'||target==='desktop')return 60 as const
 return 60 as const
}

export function createVolcanoDisplayCapability(id:string,target:VolcanoDisplayTarget,role:VolcanoSessionRole='companion'):VolcanoDisplayCapability{
 const spatial=['ar','vr','mixed-reality','holo-lab','full-room'].includes(target)
 return {id,target,role,transport:spatial?'xr-session':target==='phone'||target==='tablet'?'local-display':'cast-adapter',maxFps:recommendedVolcanoFps(target),spatial,controllerInput:true,audio:true}
}

export function createVolcanoExperienceSession(primary:VolcanoDisplayCapability,companions:VolcanoDisplayCapability[]=[]):VolcanoExperienceSession{
 return {id:`volcano-${Date.now()}`,primary,companions,synchronized:false}
}

export function volcanoRoomLoad(targets:VolcanoDisplayCapability[]){
 const spatial=targets.filter(t=>t.spatial).length
 const screens=targets.length-spatial
 return {spatialEndpoints:spatial,screenEndpoints:screens,requiresRoomCalibration:spatial>0,requiresAdaptiveStreaming:targets.length>1}
}


export type HoloLabHardwareClass='standard-screen'|'stereoscopic-xr'|'spatial-display'|'projection-array'|'light-field'|'experimental-free-space'
export type HoloLabTracking='none'|'three-dof'|'six-dof'|'room-scale'
export type HoloLabHardwareCapability={
 id:string
 hardwareClass:HoloLabHardwareClass
 tracking:HoloLabTracking
 calibrated:boolean
 depthCapable:boolean
 multiView:boolean
 spatialAudio:boolean
 maxParticipants:number
}

export type HoloLabReadiness={
 ready:boolean
 mode:'2d-fallback'|'xr'|'spatial-display'|'room-simulation'|'experimental'
 blockers:string[]
}

export function assessHoloLabReadiness(hardware:HoloLabHardwareCapability):HoloLabReadiness{
 const blockers:string[]=[]
 if(!hardware.calibrated&&hardware.hardwareClass!=='standard-screen')blockers.push('room-or-display-calibration-required')
 if(hardware.hardwareClass==='standard-screen')return{ready:true,mode:'2d-fallback',blockers:[]}
 if(hardware.hardwareClass==='stereoscopic-xr'){
  if(hardware.tracking==='none')blockers.push('head-tracking-required')
  return{ready:blockers.length===0,mode:'xr',blockers}
 }
 if(hardware.hardwareClass==='spatial-display'||hardware.hardwareClass==='light-field'){
  if(!hardware.depthCapable)blockers.push('depth-capable-display-required')
  return{ready:blockers.length===0,mode:'spatial-display',blockers}
 }
 if(hardware.hardwareClass==='projection-array'){
  if(hardware.tracking!=='room-scale')blockers.push('room-scale-tracking-required')
  return{ready:blockers.length===0,mode:'room-simulation',blockers}
 }
 blockers.push('experimental-hardware-validation-required')
 return{ready:false,mode:'experimental',blockers}
}
