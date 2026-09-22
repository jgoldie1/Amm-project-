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
