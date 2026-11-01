import {startLivingMission,enterBuilding,rideElevator,meetResident,reactToResident,acceptPlumbingJob,completePlumbingJob,createMissionStory,type LivingMission,type CharacterAdapter} from './StreetVerseLivingMission';
import {createResidentMemory,getResidentReply,rememberResidentEvent,type ResidentMemory} from './StreetVerseTalkingResidents';
import {reactionFromEmoji,type AvatarReaction} from './StreetVerseAvatarReactions';
export type DirectorAction='enter'|'elevator'|'meet'|'react'|'accept-repair'|'finish-repair'|'story';
export type DirectorState={mission:LivingMission;resident:ResidentMemory;lastDialogue:string;lastReaction:AvatarReaction|null;events:string[]};
export function createDirectorState(playerId:string):DirectorState{return {mission:startLivingMission(playerId),resident:createResidentMemory('ms-pearl',playerId),lastDialogue:'',lastReaction:null,events:[]}}
export function directScene(state:DirectorState,action:DirectorAction,adapter?:CharacterAdapter):DirectorState{
 const m=state.mission;let mission=m;let resident=state.resident;let lastDialogue=state.lastDialogue;let lastReaction=state.lastReaction;
 switch(action){
 case 'enter':mission=enterBuilding(m);break;
 case 'elevator':mission=rideElevator(m,adapter);break;
 case 'meet':mission=meetResident(m);if(mission!==m)lastDialogue=getResidentReply(resident,{scene:'kitchen',plumbingFixed:false,playerName:'BJ'},'greet').text;break;
 case 'react':{const r=reactToResident(m,'😂',adapter);mission=r.state;lastReaction=r.reaction;break;}
 case 'accept-repair':mission=acceptPlumbingJob(m);break;
 case 'finish-repair':mission=completePlumbingJob(m);if(mission!==m){resident=rememberResidentEvent(resident,'plumbing-fixed',new Date().toISOString());lastDialogue=getResidentReply(resident,{scene:'kitchen',plumbingFixed:true,playerName:'BJ'},'ask-plumbing').text;}break;
 case 'story':mission=createMissionStory(m);break;
 }
 if(mission===m)return state;
 return {...state,mission,resident,lastDialogue,lastReaction,events:[...state.events,action]};
}
export type NPCSchedule={id:string;home:string;work:string;workStartHour:number;workEndHour:number};
export function npcActivity(npc:NPCSchedule,hour:number):'home'|'work'|'travel'{
 const h=Math.max(0,Math.min(23,Math.floor(hour)));
 if(h===npc.workStartHour-1||h===npc.workEndHour)return 'travel';
 return h>=npc.workStartHour&&h<npc.workEndHour?'work':'home';
}
export type VirtualBusiness={id:string;name:string;jobKinds:string[];approvedExternalUrl?:string};
export function businessJobAvailable(b:VirtualBusiness,jobKind:string):boolean{return b.jobKinds.includes(jobKind)}
export function safeBusinessLink(b:VirtualBusiness):string|null{if(!b.approvedExternalUrl)return null;try{const url=new URL(b.approvedExternalUrl);return url.protocol==='https:'?url.toString():null}catch{return null}}
export function performanceCue(emoji:string,hasFaceRig:boolean,hasBodyClip:boolean):{reaction:AvatarReaction|null;mode:'face-and-body'|'face'|'body'|'caption'}{
 const reaction=reactionFromEmoji(emoji);return {reaction,mode:hasFaceRig&&hasBodyClip?'face-and-body':hasFaceRig?'face':hasBodyClip?'body':'caption'};
}
// This director is deterministic and offline-capable. It does not run unrestricted LLM
// conversations, move meshes itself, process payments, or authorize publishing.
// Persist through an authenticated server and validate rewards on that server.
