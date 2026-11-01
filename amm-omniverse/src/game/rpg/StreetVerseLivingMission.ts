import {chooseDialogue,getEasterEgg} from './CircleParkComedyEpisode';
import {createPlayer,applyRPGEvent,type PlayerState} from './StreetVerseAdvancedRPG';
import {createBuildingState,applyBuildingEvent,type BuildingState} from './StreetVerseBuildingLife';
import {reactionFromEmoji,applyReactionFace,type AvatarReaction,type MorphTargetMesh} from './StreetVerseAvatarReactions';
import {createTrafficStopStory,type StoryEpisode,prepareStoryMedia} from '../story/StreetVerseStoryEngine';

export type MissionStep='outside'|'lobby'|'upstairs'|'resident'|'reacted'|'repair-accepted'|'repaired'|'episode-ready';
export type LivingMission={step:MissionStep;player:PlayerState;building:BuildingState;story:StoryEpisode|null;notes:string[]};
export interface CharacterAdapter{faceMeshes:MorphTargetMesh[];playBodyClip?:(clip:string,durationMs:number)=>boolean;teleportToFloor?:(floor:number)=>void}
export interface MissionSavePort{load:(playerId:string)=>Promise<LivingMission|null>;save:(playerId:string,state:LivingMission)=>Promise<void>}
export function startLivingMission(playerId:string):LivingMission{return {step:'outside',player:createPlayer(playerId),building:createBuildingState('circle-park-residence',4),story:null,notes:[]}}
export function enterBuilding(s:LivingMission):LivingMission{return s.step==='outside'?{...s,step:'lobby',notes:[...s.notes,'Entered apartment lobby']}:s}
export function rideElevator(s:LivingMission,adapter?:CharacterAdapter):LivingMission{
 if(s.step!=='lobby')return s;
 const building=applyBuildingEvent(s.building,{id:'mission-elevator-2',buildingId:s.building.id,kind:'elevator',floorFrom:0,floorTo:2,authorized:true});
 if(building===s.building)return s;
 adapter?.teleportToFloor?.(building.floor);
 return {...s,building,step:'upstairs',notes:[...s.notes,'Elevator reached floor 2']};
}
export function meetResident(s:LivingMission):LivingMission{
 if(s.step!=='upstairs')return s;
 return {...s,step:'resident',player:applyRPGEvent(s.player,{id:'resident-meeting',kind:'scene',city:'Chicago',xp:20,credits:0,relationshipId:'resident-01',relationshipGain:10}),notes:[...s.notes,'Met resident; plumbing request pending']};
}
export function reactToResident(s:LivingMission,emoji:string,adapter?:CharacterAdapter):{state:LivingMission;reaction:AvatarReaction|null;appliedMorphs:number;bodyPlayed:boolean}{
 const reaction=reactionFromEmoji(emoji);
 if(s.step!=='resident'||!reaction)return {state:s,reaction:null,appliedMorphs:0,bodyPlayed:false};
 const appliedMorphs=adapter?applyReactionFace(adapter.faceMeshes,reaction):0;
 const bodyPlayed=!!adapter?.playBodyClip?.(reaction.bodyClip,reaction.durationMs);
 return {state:{...s,step:'reacted',notes:[...s.notes,'Avatar reacted: '+reaction.caption]},reaction,appliedMorphs,bodyPlayed};
}
export function acceptPlumbingJob(s:LivingMission):LivingMission{return s.step==='reacted'?{...s,step:'repair-accepted',notes:[...s.notes,'Accepted resident plumbing repair']}:s}
export function completePlumbingJob(s:LivingMission):LivingMission{
 if(s.step!=='repair-accepted')return s;
 const building=applyBuildingEvent(s.building,{id:'plumbing-repair-01',buildingId:s.building.id,kind:'utility',floorFrom:2,floorTo:2,utility:'plumbing',action:'repair',authorized:true});
 if(building===s.building)return s;
 const player=applyRPGEvent(s.player,{id:'plumbing-repair-01',kind:'job',city:'Chicago',xp:120,credits:40,skill:'mechanics',skillGain:10,reputation:5});
 return {...s,building,player,step:'repaired',notes:[...s.notes,'Completed plumbing repair']};
}
export function createMissionStory(s:LivingMission):LivingMission{
 if(s.step!=='repaired')return s;
 const story=createTrafficStopStory('Chicago',[s.player.id],['circle-park-residence']);
 return {...s,step:'episode-ready',story:{...story,title:'Circle Park: The Resident Repair',status:'draft',consentToRecord:false},notes:[...s.notes,'Story Time draft created; recording disabled']};
}
export function proposedStoryOutputs(s:LivingMission){return s.story?prepareStoryMedia(s.story,{}):[]}
export async function runAndSave(playerId:string,port:MissionSavePort,action:(s:LivingMission)=>LivingMission):Promise<LivingMission>{
 const current=await port.load(playerId)??startLivingMission(playerId);
 const next=action(current);
 if(next!==current)await port.save(playerId,next);
 return next;
}
// MissionSavePort must be implemented by an authenticated, server-authoritative save service.
// Client-side rewards are provisional until validated server-side.

export function playMissionDialogue(s:LivingMission,sceneId:string,choiceId:string):LivingMission{
 const selected=chooseDialogue(sceneId,choiceId);
 if(!selected)return s;
 const key='dialogue:'+sceneId+':'+choiceId;
 if(s.notes.includes(key))return s;
 const {choice}=selected;
 const player=choice.relationshipDelta?applyRPGEvent(s.player,{id:key,kind:'scene',city:'Chicago',xp:0,credits:0,relationshipId:'resident-01',relationshipGain:choice.relationshipDelta}):s.player;
 return {...s,player,notes:[...s.notes,key,choice.reply,...(choice.clue?['clue:'+choice.clue]:[])]};
}
export function discoverMissionEasterEgg(s:LivingMission,eggId:string):LivingMission{
 const egg=getEasterEgg(eggId);
 if(!egg)return s;
 const eventId='easter-egg:'+egg.id;
 if(s.player.completedEventIds.includes(eventId))return s;
 return {...s,player:applyRPGEvent(s.player,{id:eventId,kind:'scene',city:'Chicago',xp:egg.rewardXp,credits:0}),notes:[...s.notes,egg.reveal]};
}
