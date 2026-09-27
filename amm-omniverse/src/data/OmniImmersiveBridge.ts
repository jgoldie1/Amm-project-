import {ConsentSessionController,type ImmersiveEvent} from './ImmersiveConsentEventRuntime'

export type WorldEvent=
 |{kind:'music';beat:number;strength:number}
 |{kind:'cinematic';cue:string;strength:number}
 |{kind:'vehicle';motion:number}
 |{kind:'mission';status:'success'|'progress'}
 |{kind:'weather';strength:number}
 |{kind:'proximity';strength:number}
 |{kind:'creator-private-cue';strength:number}

export function toImmersiveEvent(e:WorldEvent):ImmersiveEvent|null{
 switch(e.kind){
  case'music':return{type:'music.beat',strength:e.strength,durationMs:180,sourceId:`beat:${e.beat}`}
  case'cinematic':return{type:'cinematic.cue',strength:e.strength,durationMs:700,sourceId:e.cue}
  case'vehicle':return{type:'vehicle.motion',strength:Math.min(1,Math.abs(e.motion)),durationMs:220,sourceId:'vehicle'}
  case'mission':return e.status==='success'?{type:'mission.success',strength:.65,durationMs:600,sourceId:'mission'}:null
  case'weather':return{type:'environment.weather',strength:e.strength,durationMs:350,sourceId:'weather'}
  case'proximity':return{type:'avatar.proximity',strength:e.strength,durationMs:180,sourceId:'proximity'}
  case'creator-private-cue':return{type:'creator.private-session-cue',strength:e.strength,durationMs:500,sourceId:'creator'}
 }
}

export class OmniImmersiveBridge{
 constructor(private controller:ConsentSessionController){}
 dispatch(e:WorldEvent){
  const immersive=toImmersiveEvent(e)
  return immersive?this.controller.command(immersive):null
 }
 emergencyStop(){this.controller.stop()}
}

export const OMNI_IMMERSIVE_CONNECTIONS={
 sources:['OmniWorld runtime','After Dark missions','Holo LIVE','MusicVerse/StreetVerse Radio','cinematics','vehicles','weather'],
 sink:'consent-first normalized device command',
 authority:'Device owner consent session remains authoritative; providers cannot bypass the bridge.',
}
