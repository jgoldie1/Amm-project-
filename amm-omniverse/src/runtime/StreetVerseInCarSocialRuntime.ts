import type {TransportManifest} from './StreetVersePassengerTransportRuntime';
import type {MusicSyncCue,MusicSyncLicense} from './CrossVerseMusicSyncRuntime';

export type RiderMood='neutral'|'happy'|'excited'|'focused'|'concerned'|'tired';
export interface RiderSocialState{actorId:string;seatId:string;talking:boolean;listening:boolean;mood:RiderMood;lookAtActorId?:string;voiceLevel:number}
export interface VehicleRadioState{stationId:string;stationName:string;playing:boolean;volume:number;trackId?:string;title?:string;artist?:string;cue?:MusicSyncCue;license?:MusicSyncLicense}
export interface InCarConversation{conversationId:string;vehicleId:string;speakerId:string;listenerIds:string[];text?:string;startedAtIso:string}

export class StreetVerseInCarSocialRuntime{
  readonly riders=new Map<string,RiderSocialState>();
  radio:VehicleRadioState={stationId:'streetverse-radio',stationName:'StreetVerse Radio',playing:false,volume:.65};
  constructor(readonly manifest:TransportManifest){this.syncManifest()}
  syncManifest(){
    const live=new Set<string>();
    for(const [seatId,actorId] of Object.entries(this.manifest.occupants)){if(!actorId)continue;live.add(actorId);const prev=this.riders.get(actorId);this.riders.set(actorId,prev??{actorId,seatId,talking:false,listening:true,mood:'neutral',voiceLevel:0})}
    for(const actorId of this.manifest.standingOccupants??[]){live.add(actorId);if(!this.riders.has(actorId))this.riders.set(actorId,{actorId,seatId:'standing',talking:false,listening:true,mood:'neutral',voiceLevel:0})}
    for(const actorId of this.riders.keys())if(!live.has(actorId))this.riders.delete(actorId)
  }
  startConversation(speakerId:string,text?:string):InCarConversation|null{
    this.syncManifest();const speaker=this.riders.get(speakerId);if(!speaker)return null;
    const listeners=[...this.riders.keys()].filter(id=>id!==speakerId);
    for(const rider of this.riders.values()){rider.talking=rider.actorId===speakerId;rider.listening=rider.actorId!==speakerId;rider.lookAtActorId=rider.actorId===speakerId?listeners[0]:speakerId}
    speaker.voiceLevel=.72;
    return{conversationId:`${this.manifest.transportId}:${Date.now()}`,vehicleId:this.manifest.transportId,speakerId,listenerIds:listeners,text,startedAtIso:new Date().toISOString()}
  }
  stopConversation(){for(const rider of this.riders.values()){rider.talking=false;rider.listening=true;rider.voiceLevel=0;rider.lookAtActorId=undefined}}
  setMood(actorId:string,mood:RiderMood){const rider=this.riders.get(actorId);if(rider)rider.mood=mood}
  tuneRadio(next:Partial<VehicleRadioState>){this.radio={...this.radio,...next,volume:Math.max(0,Math.min(1,next.volume??this.radio.volume))};return this.radio}
  radioDuckForConversation(){return this.radio.playing?Math.max(.12,this.radio.volume*.35):0}
  snapshot(){return{vehicleId:this.manifest.transportId,riders:[...this.riders.values()],radio:{...this.radio}}}
}
