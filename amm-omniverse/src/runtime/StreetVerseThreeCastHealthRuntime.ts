/** Universal fictional gameplay health. Never clinical advice or real-person health data. */
export type StreetVerseCastId=string
export type CastInjuryKind='light'|'moderate'|'recover'
export type AnatomyProfile='adult-human'|'teen-human'|'child-human'|'mammal'|'bird'|'fish'|'insect'|'reptile'|'amphibian'|'animal'|'unknown'
export type CastHealthState={characterId:StreetVerseCastId;health:number;injury:'none'|'light'|'moderate';lastEvent:CastInjuryKind|null;profile:AnatomyProfile;energy:number;hydration:number;nutrition:number;rest:number;environmentFit:number}
export const STREETVERSE_CAST_NAMES:Record<string,string>={
 'bj-stubbs':'BJ Stubbs','jacobie-stubbs':'Jacobie Stubbs','lateasia-monroe':'LaTeasia Monroe',
}
export const CAST_IDS=Object.keys(STREETVERSE_CAST_NAMES)
const SAFE_ID=/^[a-z0-9][a-z0-9-]{0,79}$/
export function isCastId(id:string):id is StreetVerseCastId{return SAFE_ID.test(id)}
export function isCastInjuryKind(kind:string):kind is CastInjuryKind{return kind==='light'||kind==='moderate'||kind==='recover'}
export const supportsHumanOrganOverlay=(profile:AnatomyProfile)=>profile==='adult-human'||profile==='teen-human'||profile==='child-human'
export const supportsAnimalOrganOverlay=(profile:AnatomyProfile)=>['mammal','bird','fish','insect','reptile','amphibian'].includes(profile)
export const isAnatomyProfile=(p:string):p is AnatomyProfile=>['adult-human','teen-human','child-human','mammal','bird','fish','insect','reptile','amphibian','animal','unknown'].includes(p)
export type CreatureNeed='food'|'water'|'rest'|'shelter'|'oxygen'|'temperature'|'habitat'|'care'
export const ANIMAL_NEEDS:Record<string,{respiration:string;diet:string;habitat:string;anatomy:string[];locomotion:string[];needs:CreatureNeed[]}>={
 mammal:{respiration:'lungs',diet:'species-specific',habitat:'land or water by species',anatomy:['heart','lungs','stomach','liver','kidneys'],locomotion:['walk','run','swim'],needs:['food','water','rest','shelter','oxygen','temperature','care']},
 bird:{respiration:'lungs and air sacs',diet:'species-specific',habitat:'aerial/terrestrial or aquatic',anatomy:['heart','lungs','air-sacs','crop','gizzard','liver'],locomotion:['walk','hop','fly','glide'],needs:['food','water','rest','shelter','oxygen','temperature','care']},
 fish:{respiration:'gills for most fish (species exceptions)',diet:'species-specific',habitat:'freshwater or saltwater by species',anatomy:['heart','gills','stomach','liver','swim-bladder'],locomotion:['swim','turn','school'],needs:['food','oxygen','temperature','habitat','rest','care']},
 insect:{respiration:'spiracles and tracheal tubes',diet:'species-specific',habitat:'species-specific microhabitat',anatomy:['brain','dorsal-vessel','tracheae','gut','malpighian-tubules'],locomotion:['crawl','fly','hop'],needs:['food','water','temperature','habitat','rest','care']},
 reptile:{respiration:'lungs',diet:'species-specific',habitat:'terrestrial or aquatic',anatomy:['heart','lungs','stomach','liver','kidneys'],locomotion:['crawl','walk','swim'],needs:['food','water','rest','shelter','temperature','care']},
 amphibian:{respiration:'lungs/skin/gills depending on life stage',diet:'species-specific',habitat:'moist land and/or water',anatomy:['heart','lungs','skin-respiration','stomach','kidneys'],locomotion:['hop','crawl','swim'],needs:['food','water','rest','habitat','temperature','care']},
}
export type CreatureEnvironment={oxygenOk:boolean;temperatureOk:boolean;habitatOk:boolean;foodAvailable:boolean;waterAvailable:boolean;restAvailable:boolean}
export function simulateCreatureNeeds(state:CastHealthState,environment:CreatureEnvironment,hours=1):CastHealthState{
 if(!supportsAnimalOrganOverlay(state.profile))return state
 const h=Math.max(0,Math.min(12,hours))
 const nutrition=Math.max(0,state.nutrition-(environment.foodAvailable?0:2*h))
 const hydration=Math.max(0,state.hydration-(environment.waterAvailable?0:3*h))
 const rest=Math.max(0,state.rest-(environment.restAvailable?0:2*h))
 const bad=Number(!environment.oxygenOk)+Number(!environment.temperatureOk)+Number(!environment.habitatOk)
 const environmentFit=Math.max(0,Math.min(100,state.environmentFit+(bad? -bad*10*h:4*h)))
 const health=Math.max(0,state.health-(environmentFit<30?2*h:0))
 return {...state,nutrition,hydration,rest,energy:Math.max(0,(nutrition+hydration+rest)/3),environmentFit,health}
}
export function initialCastHealth(id:StreetVerseCastId,profile:AnatomyProfile='unknown'):CastHealthState{
 return {characterId:id,health:100,injury:'none',lastEvent:null,profile,energy:100,hydration:100,nutrition:100,rest:100,environmentFit:100}
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
  updateNeeds:(id:StreetVerseCastId,env:CreatureEnvironment,hours=1)=>{const next=simulateCreatureNeeds(register(id),env,hours);states.set(id,next);return next},
  snapshot:()=>[...states.values()].map(state=>({...state})),
 }
}
// Backwards-compatible export for existing three-cast event consumers.
export const createThreeCastHealth=createUniversalCharacterHealth
