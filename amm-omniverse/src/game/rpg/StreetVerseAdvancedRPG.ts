export type RPRole='civilian'|'mechanic'|'driver'|'business-owner'|'creator'|'medic'|'officer'|'student';
export type RPGSkill='driving'|'mechanics'|'commerce'|'performance'|'community'|'emergency'|'education';
export type PlayerState={id:string;city:string;role:RPRole;level:number;xp:number;skills:Record<RPGSkill,number>;reputation:number;credits:number;completedEventIds:string[];relationships:Record<string,number>};
export type RPGEvent={id:string;kind:'mission'|'job'|'scene'|'business'|'training';city:string;xp:number;credits:number;skill?:RPGSkill;skillGain?:number;reputation?:number;relationshipId?:string;relationshipGain?:number};
const skills:RPGSkill[]=['driving','mechanics','commerce','performance','community','emergency','education'];
const clamp=(n:number,min:number,max:number)=>Math.max(min,Math.min(max,Math.round(Number.isFinite(n)?n:0)));
export const levelForXp=(xp:number)=>Math.floor(Math.sqrt(Math.max(0,xp)/100))+1;
export function createPlayer(id:string,city='Chicago',role:RPRole='civilian'):PlayerState{
 return {id,city,role,level:1,xp:0,skills:Object.fromEntries(skills.map(s=>[s,0])) as Record<RPGSkill,number>,reputation:0,credits:0,completedEventIds:[],relationships:{}};
}
export function applyRPGEvent(player:PlayerState,event:RPGEvent):PlayerState{
 if(!event.id||event.city!==player.city||player.completedEventIds.includes(event.id))return player;
 const xp=player.xp+clamp(event.xp,0,1000);
 const next:PlayerState={...player,xp,level:levelForXp(xp),credits:player.credits+clamp(event.credits,0,1000),reputation:clamp(player.reputation+(event.reputation||0),-100,100),skills:{...player.skills},relationships:{...player.relationships},completedEventIds:[...player.completedEventIds,event.id]};
 if(event.skill)next.skills[event.skill]=clamp(next.skills[event.skill]+(event.skillGain||0),0,100);
 if(event.relationshipId)next.relationships[event.relationshipId]=clamp((next.relationships[event.relationshipId]||0)+(event.relationshipGain||0),-100,100);
 return next;
}
// This module models *simulated* rewards only. Never exchange credits for money.
export function eligibleForBusinessLicense(p:PlayerState){return p.level>=3&&p.skills.commerce>=10&&p.reputation>=0;}
