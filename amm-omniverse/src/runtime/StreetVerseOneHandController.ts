import {adaptOneHandInput,type OneHandTouchFrame,type WorldInputFrame} from './OneHandInputAdapter'
import {DEFAULT_ONE_HAND_PROFILE,type OneHandProfile} from './OneHandGameplayAccessibility'

export type StreetVerseControllerPort={
 applyInput(frame:WorldInputFrame):void|Promise<void>
 setCameraAssist?(enabled:boolean):void|Promise<void>
 setGameSpeed?(scale:number):void|Promise<void>
}

export class StreetVerseOneHandController{
 constructor(private port:StreetVerseControllerPort,private profile:OneHandProfile=DEFAULT_ONE_HAND_PROFILE){}
 async update(touch:OneHandTouchFrame){
  const frame=adaptOneHandInput(touch,this.profile)
  await this.port.setCameraAssist?.(this.profile.autoCamera||this.profile.cameraSnap)
  await this.port.setGameSpeed?.(this.profile.gameSpeed)
  await this.port.applyInput(frame)
  return frame
 }
 setProfile(profile:OneHandProfile){this.profile=profile}
}

export type ContextPrompt={
 context:OneHandTouchFrame['context']
 actionLabel:string
 combatLabel?:string
 abilityLabel?:string
}
export function streetVersePrompt(context:OneHandTouchFrame['context']):ContextPrompt{
 if(context==='VEHICLE')return{context,actionLabel:'EXIT',combatLabel:'BRAKE',abilityLabel:'BOOST'}
 if(context==='COMBAT')return{context,actionLabel:'BLOCK / DODGE',combatLabel:'ATTACK',abilityLabel:'SPECIAL'}
 if(context==='DIALOGUE')return{context,actionLabel:'SELECT',abilityLabel:'VOICE'}
 return{context,actionLabel:'ACTION',combatLabel:'COMBAT',abilityLabel:'ABILITY'}
}

export const STREETVERSE_ONE_HAND_INTEGRATION={
 status:'ADAPTER_READY_CONTROLLER_PORT_REQUIRED',
 integrationRule:'Bind StreetVerseControllerPort.applyInput to the real rendered-world movement/controller update loop after that implementation is located and verified.',
 hud:['THUMB_STICK','ACTION','COMBAT','ABILITY','PHONE_MENU'],
 safety:'Do not claim rendered StreetVerse integration until the real controller port is bound and tested in a playable build.',
} as const
