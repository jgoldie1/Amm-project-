import type{TryammVerse,VersePassport,VersePartyMember}from'./ConnectedVersePassportRuntime'
export interface PersonalWorld{id:string;ownerId:string;verse:TryammVerse;kind:'apartment'|'house'|'garage'|'studio'|'land';displayItemIds:string[];guestIds:string[]}
export interface CreatorWorld{id:string;creatorId:string;title:string;verse:TryammVerse;spawnId:string;published:boolean;ageLane:'all'|'teen'|'adult';moderationRequired:boolean}
export interface CrossVerseQuestStep{id:string;verse:TryammVerse;objective:string;rewardId?:string}
export interface CrossVerseQuest{id:string;title:string;steps:CrossVerseQuestStep[];currentStep:number;partyShared:boolean}
export interface SpatialSocialRoom{id:string;verse:TryammVerse;memberIds:string[];private:boolean;positionalVoice:boolean;captions:boolean;moderation:boolean}
export interface ReplayShot{camera:'third-person'|'first-person'|'driver'|'dashboard'|'front-passenger'|'rear-left'|'rear-center'|'rear-right'|'cinematic';durationMs:number;reason:string}
export interface ReplayDirectorPlan{id:string;shots:ReplayShot[];reelReady:boolean}
export interface PresenceCapability{mode:'phone'|'desktop'|'controller'|'vr'|'ar';headTracking:boolean;handTracking:boolean;haptics:boolean;spatialAudio:boolean}
export const buildCrossVerseQuest=(id:string,title:string,steps:CrossVerseQuestStep[],partyShared=true):CrossVerseQuest=>({id,title,steps,currentStep:0,partyShared})
export const advanceCrossVerseQuest=(quest:CrossVerseQuest,verse:TryammVerse)=>{const step=quest.steps[quest.currentStep];if(step?.verse!==verse)throw new Error('quest-step-verse-mismatch');quest.currentStep=Math.min(quest.steps.length,quest.currentStep+1);return quest}
export const buildReplayDirectorPlan=(id:string):ReplayDirectorPlan=>({id,reelReady:true,shots:[
 {camera:'third-person',durationMs:3500,reason:'establish player and world'},
 {camera:'driver',durationMs:2800,reason:'driver presence'},
 {camera:'front-passenger',durationMs:2400,reason:'conversation reaction'},
 {camera:'rear-left',durationMs:2200,reason:'party perspective'},
 {camera:'dashboard',durationMs:3000,reason:'road and destination'},
 {camera:'cinematic',durationMs:4200,reason:'hero exterior finish'}
]})
export const createSpatialSocialRoom=(id:string,verse:TryammVerse,members:VersePartyMember[],isPrivate=false):SpatialSocialRoom=>({id,verse,memberIds:members.map(x=>x.id),private:isPrivate,positionalVoice:true,captions:true,moderation:!isPrivate})
export const presenceCapabilities=(mode:PresenceCapability['mode']):PresenceCapability=>({
 mode,headTracking:mode==='vr'||mode==='ar',handTracking:mode==='vr'||mode==='ar',haptics:mode==='controller'||mode==='vr'||mode==='ar',spatialAudio:true
})
export const portablePartySnapshot=(passport:VersePassport)=>({avatarId:passport.avatarId,partyIds:passport.party.map(x=>x.id),portableItemIds:passport.inventory.filter(x=>x.portable).map(x=>x.id),accessibility:{...passport.accessibility}})
