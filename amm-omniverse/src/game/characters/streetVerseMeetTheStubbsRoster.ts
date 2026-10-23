import {MEET_THE_STUBBS_FAMILY_FRIENDS,getStubbsPassport} from './meetTheStubbsFamilyFriends'
import {STUBBS_FAMILY_MISSIONS} from './meetTheStubbsMissionBridge'

/** Single-source-of-truth cast/mission adapter for StreetVerse.
 * Existing character passports remain authoritative; no new likenesses are generated.
 */
export function getStreetVerseMeetTheStubbsRoster(){
 return MEET_THE_STUBBS_FAMILY_FRIENDS.map(character=>({
   id:character.id,
   name:character.displayName,
   relationship:character.relationship,
   roles:[...character.roles],
   worlds:[...character.worlds],
   missionIds:STUBBS_FAMILY_MISSIONS.filter(m=>m.characterId===character.id).map(m=>m.id),
   hasMission:STUBBS_FAMILY_MISSIONS.some(m=>m.characterId===character.id),
   modelVerified:false, // game runtime must resolve and verify each 3D asset independently
   mediaVerified:false,
 }))
}
export function getStreetVerseMeetTheStubbsEncounter(characterId:string){
 const character=getStubbsPassport(characterId)
 if(!character)return null
 const missions=STUBBS_FAMILY_MISSIONS.filter(m=>m.characterId===character.id)
 return {characterId:character.id,displayName:character.displayName,roles:character.roles,missions:missions.map(m=>({id:m.id,title:m.title,objective:m.objective,action:m.action})),requiresAssetVerification:true,requiresPlayerInteraction:true}
}
