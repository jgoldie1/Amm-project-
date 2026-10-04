import type{TryammVerse,VersePartyMember}from'./ConnectedVersePassportRuntime'
export type CompanionMood='calm'|'happy'|'focused'|'excited'|'concerned'
export interface CompanionState{member:VersePartyMember;verse:TryammVerse;mood:CompanionMood;relationship:number;memoryKeys:string[];job?:string;destination?:string;speaking:boolean;lookAt?:string}
export interface CompanionTickContext{hour:number;missionActive:boolean;vehicleId?:string;speakerId?:string;destination?:string}
export const createCompanionState=(member:VersePartyMember,verse:TryammVerse):CompanionState=>({member,verse,mood:'calm',relationship:0,memoryKeys:[],speaking:false})
export const rememberCompanionEvent=(state:CompanionState,key:string)=>{if(!state.memoryKeys.includes(key))state.memoryKeys.push(key);return state}
export const tickCompanion=(state:CompanionState,ctx:CompanionTickContext)=>{
 state.speaking=ctx.speakerId===state.member.id;state.lookAt=ctx.speakerId&&ctx.speakerId!==state.member.id?ctx.speakerId:ctx.destination
 state.destination=ctx.destination;state.mood=ctx.missionActive?'focused':state.speaking?'excited':ctx.hour>=20||ctx.hour<6?'calm':'happy';return state
}
export const transferCompanionVerse=(state:CompanionState,verse:TryammVerse)=>{state.verse=verse;state.destination=undefined;return state}
export const companionSchedule=(hour:number)=>hour<7?'home':hour<9?'travel':hour<17?'job':hour<20?'social':'home'
