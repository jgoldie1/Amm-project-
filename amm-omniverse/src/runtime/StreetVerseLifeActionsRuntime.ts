/** Non-explicit, fictional StreetVerse character and wildlife action state machine. */
export type LifeAction='eat'|'drink'|'sleep'|'sit'|'cook'|'limp'|'recover'|'partner-intimacy'|'birth'|'animal-feed'|'animal-rest'|'insect-forage'|'insect-rest'
export type LifeSpecies='human'|'animal'|'insect'
export type LifeNeeds={hunger:number;hydration:number;fatigue:number;stamina:number}
export type LifeSettings={needsEnabled:boolean;fatigueEnabled:boolean;oneHandedMode:boolean}
export type LifeActor={id:string;species:LifeSpecies;adultVerified?:boolean;consents?:boolean;pregnancyStoryEligible?:boolean;needs:LifeNeeds}
export type LifeActionResult={ok:boolean;reason?:string;animation:string;actor:LifeActor}
export const defaultLifeSettings:LifeSettings={needsEnabled:false,fatigueEnabled:false,oneHandedMode:true}
const limit=(n:number)=>Math.max(0,Math.min(100,n))
const animation:Record<LifeAction,string>={
 eat:'Eat',drink:'Drink',sleep:'Sleep',sit:'Sit',cook:'Cook',limp:'Limp',recover:'Recover',
 'partner-intimacy':'Embrace','birth':'HospitalFamilyArrival','animal-feed':'AnimalEat','animal-rest':'AnimalRest','insect-forage':'InsectForage','insect-rest':'InsectRest',
}
export function performLifeAction(actor:LifeActor,action:LifeAction,settings:LifeSettings,partner?:LifeActor):LifeActionResult{
 const reject=(reason:string):LifeActionResult=>({ok:false,reason,animation:'Idle',actor})
 const humanActions:LifeAction[]=['eat','drink','sleep','sit','cook','limp','recover','partner-intimacy','birth']
 const animalActions:LifeAction[]=['eat','drink','sleep','sit','limp','recover','animal-feed','animal-rest']
 const insectActions:LifeAction[]=['eat','drink','sleep','recover','insect-forage','insect-rest']
 if(!(actor.species==='human'?humanActions:actor.species==='animal'?animalActions:insectActions).includes(action))return reject('Action unavailable for this species')
 if(action==='partner-intimacy'&&(!partner||partner.id===actor.id||partner.species!=='human'||!actor.adultVerified||!partner.adultVerified||!actor.consents||!partner.consents))return reject('Two consenting, verified adult human characters required')
 if(action==='birth'&&(!actor.adultVerified||!actor.pregnancyStoryEligible))return reject('Hospital family-story mission eligibility required')
 const needs={...actor.needs}
 if(settings.needsEnabled){
  if(['eat','animal-feed','insect-forage'].includes(action))needs.hunger=limit(needs.hunger+30)
  if(action==='drink')needs.hydration=limit(needs.hydration+35)
  if(action==='cook')needs.stamina=limit(needs.stamina-5)
 }
 if(settings.fatigueEnabled){
  if(['sleep','animal-rest','insect-rest'].includes(action)){needs.fatigue=limit(needs.fatigue-50);needs.stamina=limit(needs.stamina+40)}
  if(action==='recover')needs.fatigue=limit(needs.fatigue-20)
 }
 return {ok:true,animation:animation[action],actor:{...actor,needs}}
}
export function tickLifeNeeds(actor:LifeActor,settings:LifeSettings,minutes:number):LifeActor{
 const needs={...actor.needs}
 const elapsed=Math.max(0,Math.min(minutes,60))
 if(settings.needsEnabled){needs.hunger=limit(needs.hunger-elapsed*.12);needs.hydration=limit(needs.hydration-elapsed*.16)}
 if(settings.fatigueEnabled)needs.fatigue=limit(needs.fatigue+elapsed*.1)
 return {...actor,needs}
}
export type LifeMission='eat'|'drink'|'sit'|'cook'|'sleep'|'limp'|'recover'|'animal-feed'|'insect-forage'|'hospital-family-story'
export const LIFE_MISSION_ROUTE:LifeMission[]=['eat','drink','sit','cook','sleep','limp','recover','animal-feed','insect-forage','hospital-family-story']
export function createLifeMissionRoute(){
 let index=0
 return {current:()=>LIFE_MISSION_ROUTE[index]??null,progress:()=>index,complete:(mission:LifeMission)=>{if(LIFE_MISSION_ROUTE[index]!==mission)return false;index++;return true},reset:()=>{index=0}}
}
