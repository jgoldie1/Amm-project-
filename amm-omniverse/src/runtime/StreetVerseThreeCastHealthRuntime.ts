/** Fictional gameplay physiology. Not a clinical model, diagnosis or real-person health record. */
export type StreetVerseCastId='bj-stubbs'|'jacobie-stubbs'|'lateasia-monroe'
export type CastInjuryKind='light'|'moderate'|'recover'
export type CastHealthState={characterId:StreetVerseCastId;health:number;injury:'none'|'light'|'moderate';lastEvent:CastInjuryKind|null}
export const STREETVERSE_CAST_NAMES:Record<StreetVerseCastId,string>={
 'bj-stubbs':'BJ Stubbs','jacobie-stubbs':'Jacobie Stubbs','lateasia-monroe':'LaTeasia Monroe',
}
export const CAST_IDS=Object.keys(STREETVERSE_CAST_NAMES) as StreetVerseCastId[]
export function initialCastHealth(id:StreetVerseCastId):CastHealthState{
 return {characterId:id,health:100,injury:'none',lastEvent:null}
}
export function applyCastInjury(state:CastHealthState,kind:CastInjuryKind):CastHealthState{
 if(kind==='recover')return {...state,health:100,injury:'none',lastEvent:kind}
 const health=Math.max(0,state.health-(kind==='moderate'?30:12))
 return {...state,health,injury:health<=70?'moderate':'light',lastEvent:kind}
}
export function createThreeCastHealth(){
 const states:Record<StreetVerseCastId,CastHealthState>={
  'bj-stubbs':initialCastHealth('bj-stubbs'),
  'jacobie-stubbs':initialCastHealth('jacobie-stubbs'),
  'lateasia-monroe':initialCastHealth('lateasia-monroe'),
 }
 return {
  get:(id:StreetVerseCastId)=>states[id],
  apply:(id:StreetVerseCastId,kind:CastInjuryKind)=>{
   states[id]=applyCastInjury(states[id],kind)
   return states[id]
  },
  snapshot:()=>CAST_IDS.map(id=>({...states[id]})),
 }
}
export function isCastId(id:string):id is StreetVerseCastId{
 return Object.prototype.hasOwnProperty.call(STREETVERSE_CAST_NAMES,id)
}
export function isCastInjuryKind(kind:string):kind is CastInjuryKind{
 return kind==='light'||kind==='moderate'||kind==='recover'
}
