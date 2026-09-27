import {canAcceptRemoteDeviceCommand,revokeDeviceControl,type ConsentControlGrant,type DeviceConsentSession} from './AfterDarkImmersiveDeviceFabric'

export type ImmersiveEventType='music.beat'|'cinematic.cue'|'vehicle.motion'|'mission.success'|'environment.weather'|'avatar.proximity'|'creator.private-session-cue'
export interface ImmersiveEvent{type:ImmersiveEventType;strength:number;durationMs:number;sourceId:string}
export interface DeviceCommand{event:ImmersiveEventType;intensityPercent:number;durationMs:number}

export function translateImmersiveEvent(event:ImmersiveEvent,session:DeviceConsentSession,grant:ConsentControlGrant):DeviceCommand|null{
 if(!canAcceptRemoteDeviceCommand(session,grant))return null
 if(!grant.allowedEvents.includes(event.type))return null
 const intensity=Math.max(0,Math.min(grant.maxIntensityPercent,Math.round(event.strength*100)))
 if(intensity<=0)return null
 return{event:event.type,intensityPercent:intensity,durationMs:Math.max(50,Math.min(event.durationMs,5000))}
}

export class ConsentSessionController{
 private stopped=false
 constructor(public session:DeviceConsentSession,public grant:ConsentControlGrant){}
 command(event:ImmersiveEvent){
  if(this.stopped)return null
  return translateImmersiveEvent(event,this.session,this.grant)
 }
 pause(){this.session={...this.session,consentActive:false}}
 resume(){if(!this.stopped)this.session={...this.session,consentActive:true}}
 stop(){
  this.stopped=true
  this.session={...this.session,consentActive:false,remoteControlAllowed:false}
  this.grant=revokeDeviceControl(this.grant)
 }
}

export const IMMERSIVE_DEVICE_RUNTIME_POLICY={
 dispatch:'OmniWorld/Holo LIVE/music/mission systems emit normalized events; provider adapters translate only after consent validation.',
 safety:['validate every command, not only pairing','clamp intensity and duration','reject unapproved event types','expire grants automatically','local stop invalidates the grant'],
 privacy:['ephemeral session IDs','no public device identity','do not put raw device telemetry into creator analytics'],
 providerIsolation:'Lovense and future providers receive normalized commands through adapters; game/world code never depends directly on vendor APIs.',
}
