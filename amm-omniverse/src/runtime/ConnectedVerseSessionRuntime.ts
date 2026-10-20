import{addPartyMember,createVersePassport,setAccessibilityProfile,travelVerse,type TryammVerse,type VerseAccessibilityProfile,type VersePartyMember,type VersePassport,type VersePortal}from'./ConnectedVersePassportRuntime'
import{buildCrossVerseQuest,buildReplayDirectorPlan,createSpatialSocialRoom,type CrossVerseQuest,type ReplayDirectorPlan,type SpatialSocialRoom}from'./ConnectedVerseExperienceRuntime'
const KEY='tryamm.connected-verse.passport.v1'
export interface ConnectedVerseSession{passport:VersePassport;quest:CrossVerseQuest;socialRoom:SpatialSocialRoom;replay:ReplayDirectorPlan}
export const defaultPortalChain:VersePortal[]=[
 {id:'street-to-faith',from:'streetverse',to:'faithverse',spawnId:'faithverse-gateway',preserveParty:true,preservePortableInventory:true},
 {id:'faith-to-music',from:'faithverse',to:'musicverse',spawnId:'musicverse-studio',preserveParty:true,preservePortableInventory:true},
 {id:'music-to-star',from:'musicverse',to:'starverse',spawnId:'starverse-stage',preserveParty:true,preservePortableInventory:true},
 {id:'star-to-sport',from:'starverse',to:'sportverse',spawnId:'sportverse-arena',preserveParty:true,preservePortableInventory:true},
 {id:'sport-to-holo',from:'sportverse',to:'holoverse',spawnId:'holoverse-nexus',preserveParty:true,preservePortableInventory:true},
 {id:'holo-to-street',from:'holoverse',to:'streetverse',spawnId:'circle-park',preserveParty:true,preservePortableInventory:true},
]
export const createConnectedVerseSession=(ownerId:string,avatarId:string,party:VersePartyMember[]=[]):ConnectedVerseSession=>{
 const passport=createVersePassport(ownerId,avatarId);party.forEach(x=>addPartyMember(passport,x))
 const quest=buildCrossVerseQuest('connected-verse-first-journey','Connected Verse First Journey',[
  {id:'circle-park-ride',verse:'streetverse',objective:'Complete First Ride from Circle Park to Roosevelt.',rewardId:'xp:500'},
  {id:'faith-gateway',verse:'faithverse',objective:'Enter FaithVerse with the same party.'},
  {id:'music-studio',verse:'musicverse',objective:'Visit the shared studio and create a performance cue.'},
  {id:'star-stage',verse:'starverse',objective:'Take the party to a creator stage.'},
  {id:'sport-arena',verse:'sportverse',objective:'Complete a party activity.'},
  {id:'holo-nexus',verse:'holoverse',objective:'Reach the Holo Nexus and return to StreetVerse.'},
 ])
 return{passport,quest,socialRoom:createSpatialSocialRoom('party-room',passport.currentVerse,passport.party,true),replay:buildReplayDirectorPlan('connected-verse-first-journey')}
}
export const saveConnectedVerseSession=(session:ConnectedVerseSession)=>{if(typeof localStorage!=='undefined')localStorage.setItem(KEY,JSON.stringify(session));return session}
export const loadConnectedVerseSession=():ConnectedVerseSession|null=>{if(typeof localStorage==='undefined')return null;try{return JSON.parse(localStorage.getItem(KEY)||'null')}catch{return null}}
export const applyDeviceAccessibility=(session:ConnectedVerseSession,profile:Partial<VerseAccessibilityProfile>)=>{setAccessibilityProfile(session.passport,profile);return saveConnectedVerseSession(session)}
export const travelConnectedVerse=(session:ConnectedVerseSession,portalId:string)=>{const portal=defaultPortalChain.find(x=>x.id===portalId);if(!portal)throw new Error('unknown-portal');const result=travelVerse(session.passport,portal);session.socialRoom.verse=result.to;return saveConnectedVerseSession(session)}
export const connectedVerseSpawn=(session:ConnectedVerseSession)=>({verse:session.passport.currentVerse,avatarId:session.passport.avatarId,partyIds:session.passport.party.map(x=>x.id),accessibility:{...session.passport.accessibility},portableItemIds:session.passport.inventory.filter(x=>x.portable).map(x=>x.id)})
export const nextPortalFor=(verse:TryammVerse)=>defaultPortalChain.find(x=>x.from===verse)||null
