/** Universal fictional gameplay health. Never clinical advice or real-person health data. */
export type StreetVerseCastId=string
export type CastInjuryKind='light'|'moderate'|'recover'
export type AnatomyProfile='adult-human'|'teen-human'|'child-human'|'animal'|'unknown'
export type CastHealthState={characterId:StreetVerseCastId;health:number;injury:'none'|'light'|'moderate';lastEvent:CastInjuryKind|null;profile:AnatomyProfile}
export const STREETVERSE_CAST_NAMES:Record<string,string>={
 'bj-stubbs':'BJ Stubbs','jacobie-stubbs':'Jacobie Stubbs','lateasia-monroe':'LaTeasia Monroe',
}
export const CAST_IDS=Object.keys(STREETVERSE_CAST_NAMES)
const SAFE_ID=/^[a-z0-9][a-z0-9-]{0,79}$/
export function isCastId(id:string):id is StreetVerseCastId{return SAFE_ID.test(id)}
export function isCastInjuryKind(kind:string):kind is CastInjuryKind{return kind==='light'||kind==='moderate'||kind==='recover'}
export const supportsHumanOrganOverlay=(profile:AnatomyProfile)=>profile==='adult-human'||profile==='teen-human'||profile==='child-human'
export function initialCastHealth(id:StreetVerseCastId,profile:AnatomyProfile='unknown'):CastHealthState{
 return {characterId:id,health:100,injury:'none',lastEvent:null,profile}
}
export function applyCastInjury(state:CastHealthState,kind:CastInjuryKind):CastHealthState{
 if(kind==='recover')return {...state,health:100,injury:'none',lastEvent:kind}
 const health=Math.max(0,state.health-(kind==='moderate'?30:12))
 return {...state,health,injury:health<=70?'moderate':'light',lastEvent:kind}
}
/** Per-character registry. Profiles are explicitly set by the character factory,
 * never inferred from personal photos. Unknown / animal rigs get health gameplay,
 * but no human organ mesh overlay. A bounded map prevents untrusted events
 * growing unlimited state.
 */
export function createUniversalCharacterHealth(){
 const states=new Map<StreetVerseCastId,CastHealthState>()
 const register=(id:StreetVerseCastId,profile:AnatomyProfile='unknown')=>{
  if(!isCastId(id))throw Error('Invalid character ID')
  const existing=states.get(id)
  if(existing){
   if(profile!=='unknown'&&existing.profile!==profile)states.set(id,{...existing,profile})
  }else{
   if(states.size>=1024)throw Error('Character health registry limit reached')
   states.set(id,initialCastHealth(id,profile))
  }
  return states.get(id)!
 }
 for(const id of CAST_IDS)register(id,'adult-human')
 return {
  register,
  get:(id:StreetVerseCastId)=>register(id),
  apply:(id:StreetVerseCastId,kind:CastInjuryKind)=>{const next=applyCastInjury(register(id),kind);states.set(id,next);return next},
  snapshot:()=>[...states.values()].map(state=>({...state})),
 }
}
// Backwards-compatible export for existing three-cast event consumers.
export const createThreeCastHealth=createUniversalCharacterHealth
