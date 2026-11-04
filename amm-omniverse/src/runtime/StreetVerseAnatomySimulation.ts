/**
 * Fictional RPG body-system simulation for the StreetVerse character rig.
 * This is not a medical model, a diagnostic system, or a physical anatomy mesh.
 * Does not accept real-world medical measurements or expose graphic organs.
 */
export type StreetVerseBodyZone='head'|'chest'|'abdomen'|'arms'|'legs'|'general'
export type StreetVerseOrgan='brain'|'heart'|'lungs'|'liver'|'kidneys'
export type StreetVerseOrganState={
  characterId:string
  integrity:Record<StreetVerseOrgan,number>
  stamina:number
  breathing:number
  mobility:number
  consciousness:'alert'|'stunned'|'downed'
  needsRescue:boolean
  fictional:true
}
export const STREETVERSE_ORGAN_LABELS:Record<StreetVerseOrgan,string>={
 brain:'Brain / awareness',heart:'Heart / circulation',lungs:'Lungs / breathing',liver:'Liver / endurance',kidneys:'Kidneys / recovery'
}
export const STREETVERSE_ANATOMY_ZONES:Record<StreetVerseBodyZone,readonly StreetVerseOrgan[]>={
 head:['brain'],chest:['heart','lungs'],abdomen:['liver','kidneys'],arms:[],legs:[],general:[]
}
const clamp=(x:number)=>Math.max(0,Math.min(100,Number.isFinite(x)?x:0))
export function createStreetVerseOrganState(characterId='bj-stubbs'):StreetVerseOrganState{
 return {characterId,integrity:{brain:100,heart:100,lungs:100,liver:100,kidneys:100},stamina:100,breathing:100,mobility:100,consciousness:'alert',needsRescue:false,fictional:true}
}
/** Bounded, deliberately simplified game rules; no medical realism claimed. */
export function applyStreetVerseOrganImpact(state:StreetVerseOrganState,request:{amount:number;zone?:StreetVerseBodyZone}):StreetVerseOrganState{
 if(!Number.isFinite(request.amount)||request.amount<=0||state.consciousness==='downed')return state
 const amount=clamp(request.amount)
 const zone=STREETVERSE_ANATOMY_ZONES[request.zone||'general']?request.zone||'general':'general'
 const affected=STREETVERSE_ANATOMY_ZONES[zone]
 const integrity={...state.integrity}
 for(const organ of affected)integrity[organ]=clamp(integrity[organ]-amount*.75)
 const stamina=clamp(state.stamina-amount*.6)
 const breathing=clamp(state.breathing-(zone==='chest'?amount*.7:amount*.12))
 const mobility=clamp(state.mobility-(zone==='legs'?amount*.7:amount*.16))
 const downed=integrity.brain<25||integrity.heart<25||breathing<18
 const stunned=!downed&&(amount>=30||integrity.brain<60)
 return {...state,integrity,stamina,breathing,mobility,consciousness:downed?'downed':stunned?'stunned':'alert',needsRescue:downed||breathing<40||integrity.heart<40}
}
export function resetStreetVerseOrganState(characterId:string){return createStreetVerseOrganState(characterId)}
