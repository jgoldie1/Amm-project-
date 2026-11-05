// StreetVerse fictional gameplay damage model. NOT a clinical anatomy, triage, or medical simulator.
// No gore textures or limb severing. It is safe for younger-player content settings.
export type BodyZone='head'|'torso'|'left-arm'|'right-arm'|'left-leg'|'right-leg';
export type InjuryType='impact'|'cut'|'burn'|'strain';
export type InjuryIntensity='minor'|'moderate'|'major';
export type InjuryRecord={id:string;zone:BodyZone;type:InjuryType;intensity:InjuryIntensity;bleeding:boolean;at:number};
export type CharacterVitals={characterId:string;health:number;stamina:number;mobility:number;conscious:boolean;injuries:InjuryRecord[];lastUpdated:number};
export const CHARACTER_DAMAGE_PRESET={nonGraphic:true,maxHealth:100,maxInjuries:12,minimumStamina:0,allowRealisticGore:false} as const;
const zoneNames=new Set<BodyZone>(['head','torso','left-arm','right-arm','left-leg','right-leg']);
const injuryKinds=new Set<InjuryType>(['impact','cut','burn','strain']);
const intensityLoss:Record<InjuryIntensity,number>={minor:5,moderate:15,major:30};
export function newVitals(characterId:string,at=Date.now()):CharacterVitals{
 if(!/^[a-z0-9][a-z0-9-]{1,79}$/.test(characterId))throw Error('invalid-character-id');
 return {characterId,health:100,stamina:100,mobility:100,conscious:true,injuries:[],lastUpdated:at};
}
export function applyFictionalInjury(state:CharacterVitals,input:{zone:BodyZone;type:InjuryType;intensity:InjuryIntensity;bleeding?:boolean;id?:string},at=Date.now()):CharacterVitals{
 if(!state||!zoneNames.has(input.zone)||!injuryKinds.has(input.type)||!(input.intensity in intensityLoss))throw Error('invalid-injury-event');
 if(state.health<=0)return state;
 // An injury marked as bleeding is a UI status effect only; never calculate actual blood loss.
 const bleeding=Boolean(input.bleeding)&&input.type==='cut';
 const loss=intensityLoss[input.intensity];
 const injuries=[...state.injuries,{id:input.id||`injury-${at}-${state.injuries.length}`,zone:input.zone,type:input.type,intensity:input.intensity,bleeding,at}].slice(-CHARACTER_DAMAGE_PRESET.maxInjuries);
 const health=Math.max(0,state.health-loss);
 const legAffected=input.zone==='left-leg'||input.zone==='right-leg';
 const mobility=legAffected?Math.max(25,state.mobility-(input.intensity==='major'?30:input.intensity==='moderate'?15:5)):state.mobility;
 return {...state,health,stamina:Math.max(0,state.stamina-loss/2),mobility,conscious:health>0,injuries,lastUpdated:at};
}
export function applyFictionalFirstAid(state:CharacterVitals,at=Date.now()):CharacterVitals{
 if(!state)return state;
 return {...state,injuries:state.injuries.map(injury=>({...injury,bleeding:false})),health:Math.min(100,state.health+10),stamina:Math.min(100,state.stamina+15),lastUpdated:at};
}
export function restAtSafeZone(state:CharacterVitals,at=Date.now()):CharacterVitals{
 if(!state)return state;
 return {...state,health:Math.min(100,state.health+20),stamina:100,mobility:Math.min(100,state.mobility+15),lastUpdated:at};
}
export function injuryPresentation(state:CharacterVitals){
 return {health:state.health,stamina:state.stamina,mobility:state.mobility,knockedOut:!state.conscious,hasBleedingStatus:state.injuries.some(i=>i.bleeding),limping:state.mobility<75,injuryCount:state.injuries.length};
}
