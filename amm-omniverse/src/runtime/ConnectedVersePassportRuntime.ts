export type TryammVerse='streetverse'|'faithverse'|'musicverse'|'starverse'|'sportverse'|'holoverse'
export type PresenceMode='phone'|'desktop'|'controller'|'vr'|'ar'|'accessibility'
export interface VersePartyMember{id:string;displayName:string;kind:'player'|'npc'|'ai-companion';avatarId?:string}
export interface VerseInventoryItem{id:string;kind:'wearable'|'vehicle'|'home-item'|'creator-item'|'mission-item';quantity:number;portable:boolean}
export interface VerseAccessibilityProfile{oneHandMode:boolean;camera:'first-person'|'third-person';captions:boolean;reducedMotion:boolean;voiceNavigation:boolean;haptics:boolean}
export interface VersePassport{
 id:string;ownerId:string;avatarId:string;currentVerse:TryammVerse;homeVerse:TryammVerse
 party:VersePartyMember[];inventory:VerseInventoryItem[];achievements:string[];reputation:Record<string,number>
 accessibility:VerseAccessibilityProfile;presence:PresenceMode;updatedAtIso:string
}
export interface VersePortal{id:string;from:TryammVerse;to:TryammVerse;spawnId:string;preserveParty:boolean;preservePortableInventory:boolean}
export interface VerseTravelResult{passport:VersePassport;portalId:string;from:TryammVerse;to:TryammVerse;partyIds:string[];portableItemIds:string[]}
const clampRep=(n:number)=>Math.max(-100,Math.min(100,Math.round(n)))
export const createVersePassport=(ownerId:string,avatarId:string):VersePassport=>({
 id:`passport:${ownerId}`,ownerId,avatarId,currentVerse:'streetverse',homeVerse:'streetverse',party:[],inventory:[],achievements:[],
 reputation:{},accessibility:{oneHandMode:false,camera:'third-person',captions:true,reducedMotion:false,voiceNavigation:false,haptics:true},
 presence:'phone',updatedAtIso:new Date().toISOString()
})
export const addPartyMember=(passport:VersePassport,member:VersePartyMember)=>{if(!passport.party.some(x=>x.id===member.id))passport.party.push(member);passport.updatedAtIso=new Date().toISOString();return passport}
export const removePartyMember=(passport:VersePassport,id:string)=>{passport.party=passport.party.filter(x=>x.id!==id);passport.updatedAtIso=new Date().toISOString();return passport}
export const addInventoryItem=(passport:VersePassport,item:VerseInventoryItem)=>{const old=passport.inventory.find(x=>x.id===item.id);if(old)old.quantity+=item.quantity;else passport.inventory.push({...item});passport.updatedAtIso=new Date().toISOString();return passport}
export const awardAchievement=(passport:VersePassport,id:string)=>{if(!passport.achievements.includes(id))passport.achievements.push(id);passport.updatedAtIso=new Date().toISOString();return passport}
export const changeReputation=(passport:VersePassport,network:string,delta:number)=>{passport.reputation[network]=clampRep((passport.reputation[network]||0)+delta);passport.updatedAtIso=new Date().toISOString();return passport}
export const travelVerse=(passport:VersePassport,portal:VersePortal):VerseTravelResult=>{
 if(passport.currentVerse!==portal.from)throw new Error('portal-origin-mismatch')
 const from=passport.currentVerse;passport.currentVerse=portal.to;passport.updatedAtIso=new Date().toISOString()
 return{passport,portalId:portal.id,from,to:portal.to,partyIds:portal.preserveParty?passport.party.map(x=>x.id):[],portableItemIds:portal.preservePortableInventory?passport.inventory.filter(x=>x.portable).map(x=>x.id):[]}
}
export const setAccessibilityProfile=(passport:VersePassport,patch:Partial<VerseAccessibilityProfile>)=>{passport.accessibility={...passport.accessibility,...patch};passport.updatedAtIso=new Date().toISOString();return passport}
export const CONNECTED_VERSE_PRINCIPLES={
 seamlessPortalTravel:true,persistentAvatar:true,partyTravel:true,portableInventory:true,crossVerseReputation:true,
 creatorWorldReady:true,personalWorldReady:true,crossVerseQuestReady:true,spatialSocialReady:true,replayDirectorReady:true,
 vrArReady:true,hapticsReady:true,neuralFullDiveClaimed:false
} as const
