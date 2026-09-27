export type ImmersiveDeviceClass='xr-headset'|'ar-glasses'|'phone-ar'|'gamepad'|'wearable-haptics'|'interactive-device'
export interface ImmersiveDeviceAdapter{
 id:string;deviceClass:ImmersiveDeviceClass;capabilities:string[];requiresExplicitPairing:boolean;localStop:boolean;
}
export const AFTER_DARK_IMMERSIVE_DEVICE_FABRIC={
 xr:{
  vr:['immersive nightlife districts','concerts/cinema','social lounges','missions','racing','private rooms','spatial audio'],
  ar:['venue overlays','avatars','navigation','tabletop city/mission view','business offers','shared holographic events'],
 },
 adapters:[
  {id:'lovense',deviceClass:'interactive-device',capabilities:['opt-in haptic/media/game-event synchronization'],requiresExplicitPairing:true,localStop:true},
  {id:'generic-haptics',deviceClass:'wearable-haptics',capabilities:['music beat','impact','proximity','environment cues'],requiresExplicitPairing:true,localStop:true},
 ] as ImmersiveDeviceAdapter[],
}

export interface DeviceConsentSession{
 adultVerified:boolean;devicePaired:boolean;consentActive:boolean;remoteControlAllowed:boolean;
 privateSession:boolean;emergencyStopAvailable:boolean;
}
export function canRunInteractiveDevice(s:DeviceConsentSession){
 return s.adultVerified&&s.devicePaired&&s.consentActive&&s.privateSession&&s.emergencyStopAvailable
}
export const DEVICE_PRIVACY_RULES=[
 'device integration is disabled by default','pairing is explicit and revocable',
 'no device activation from ads, gifts, strangers or public rooms by default',
 'remote control requires separate explicit session consent','one-tap local stop overrides every remote command',
 'do not store raw intimate-device telemetry unless strictly required; prefer ephemeral session state',
 'never expose device identifiers publicly','no minor accounts or mixed-age sessions',
] as const

export const IMMERSIVE_EVENT_BUS=[
 'music.beat','cinematic.cue','vehicle.motion','mission.success','environment.weather',
 'avatar.proximity','creator.private-session-cue',
] as const

export const PROVIDER_BOUNDARY={
 lovense:'Use an approved Lovense developer integration; credentials and tokens remain server-side where applicable.',
 others:'Implement additional providers behind the same consent-first adapter rather than coupling world code to a vendor.',
}
