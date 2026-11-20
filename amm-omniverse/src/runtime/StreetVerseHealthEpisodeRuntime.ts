/** StreetVerse fictional health roleplay for the three named characters.
 * These scripted scenes are not diagnoses or real medical treatment.
 * Stroke-like signs and severe allergic reactions always request emergency help.
 */
export type StreetVerseHealthCharacter='bj-stubbs'|'jacobie-stubbs'|'lateasia-monroe'
export type StreetVerseEpisode='stroke'|'nosebleed'|'allergy'|'severe-allergy'
export type StreetVerseEpisodeAction=StreetVerseEpisode|'first-aid'|'emergency-dispatch'|'hospital-discharge'
export type StreetVerseEpisodeStage='healthy'|'symptoms'|'emergency-dispatched'|'first-aid'|'hospital-recovery'
export type StreetVerseEpisodeState={
 characterId:StreetVerseHealthCharacter;condition:StreetVerseEpisode|null;
 stage:StreetVerseEpisodeStage; emergency:boolean;fictional:true
}
export type StreetVerseEpisodeOutcome={state:StreetVerseEpisodeState;message:string;dispatchEmergency:boolean}
export const STREETVERSE_HEALTH_CHARACTERS:readonly StreetVerseHealthCharacter[]=['bj-stubbs','jacobie-stubbs','lateasia-monroe']
export const initialHealthEpisode=(characterId:StreetVerseHealthCharacter):StreetVerseEpisodeState=>({
 characterId,condition:null,stage:'healthy',emergency:false,fictional:true,
})
export function advanceHealthEpisode(previous:StreetVerseEpisodeState,action:StreetVerseEpisodeAction):StreetVerseEpisodeOutcome{
 const result=(state:StreetVerseEpisodeState,message:string,dispatchEmergency=false):StreetVerseEpisodeOutcome=>({state,message,dispatchEmergency})
 if(action==='stroke')return result({...previous,condition:'stroke',stage:'emergency-dispatched',emergency:true},'Possible stroke signs: face weakness, arm weakness, speech changes. Dispatch emergency services now. No driving, no waiting for symptoms to pass.',true)
 if(action==='severe-allergy')return result({...previous,condition:'severe-allergy',stage:'emergency-dispatched',emergency:true},'Severe allergic reaction: breathing difficulty or throat swelling. Dispatch emergency services; use prescribed epinephrine per emergency plan. Simulation only.',true)
 if(action==='nosebleed')return result({...previous,condition:'nosebleed',stage:'symptoms',emergency:false},'Nosebleed roleplay: sit upright, lean forward, pinch the soft part of the nose. Seek urgent help for severe or persistent bleeding.')
 if(action==='allergy')return result({...previous,condition:'allergy',stage:'symptoms',emergency:false},'Mild allergy roleplay: sneezing, itchy eyes or rash. Check for breathing trouble or swelling; those require emergency response.')
 if(action==='emergency-dispatch'){
  if(!previous.condition||previous.stage==='healthy')return result(previous,'No active health episode to dispatch.')
  return result({...previous,stage:'emergency-dispatched',emergency:true},'Fictional emergency dispatcher notified. Await ambulance and hospital roleplay.',true)
 }
 if(action==='first-aid'){
  if(previous.condition==='stroke'||previous.condition==='severe-allergy')return result(previous,'Emergency response is required. First aid alone does not clear a stroke or severe allergy.')
  if(!previous.condition)return result(previous,'No active first-aid episode.')
  return result({...previous,stage:'first-aid'},'First-aid scene recorded. Symptoms are not automatically resolved.')
 }
 if(action==='hospital-discharge'){
  if(previous.stage==='healthy')return result(previous,'Character is already healthy.')
  return result({...previous,stage:'hospital-recovery',emergency:false},'Fictional hospital examination and discharge completed. Continue follow-up roleplay.')
 }
 return result(previous,'Unsupported episode.')
}
export const HEALTH_EPISODE_SAVE_KEY='tryamm.streetverse.health-episodes.v1'
const isCharacter=(id:unknown):id is StreetVerseHealthCharacter=>typeof id==='string'&&STREETVERSE_HEALTH_CHARACTERS.includes(id as StreetVerseHealthCharacter)
const isEpisode=(value:unknown):value is StreetVerseEpisode=>value==='stroke'||value==='nosebleed'||value==='allergy'||value==='severe-allergy'
const isStage=(value:unknown):value is StreetVerseEpisodeStage=>value==='healthy'||value==='symptoms'||value==='emergency-dispatched'||value==='first-aid'||value==='hospital-recovery'
export function readHealthEpisodeSave(raw:string|null):Record<StreetVerseHealthCharacter,StreetVerseEpisodeState>{
 const result=Object.fromEntries(STREETVERSE_HEALTH_CHARACTERS.map(id=>[id,initialHealthEpisode(id)])) as Record<StreetVerseHealthCharacter,StreetVerseEpisodeState>
 if(!raw)return result
 try{
  const data=JSON.parse(raw) as Record<string,unknown>
  for(const id of STREETVERSE_HEALTH_CHARACTERS){
   const item=data[id]
   if(!item||typeof item!=='object')continue
   const entry=item as Record<string,unknown>
   if(!isCharacter(entry.characterId)||entry.characterId!==id||!isStage(entry.stage)||!(entry.condition===null||isEpisode(entry.condition)))continue
   result[id]={characterId:id,condition:entry.condition,stage:entry.stage,emergency:entry.emergency===true,fictional:true}
  }
 }catch{/* Corrupted save defaults to healthy. */}
 return result
}
export function installStreetVerseHealthEpisodes(){
 const read=()=>{try{return localStorage.getItem(HEALTH_EPISODE_SAVE_KEY)}catch{return null}}
 const save=()=>{try{localStorage.setItem(HEALTH_EPISODE_SAVE_KEY,JSON.stringify(states))}catch{/* private mode */}}
 const states=readHealthEpisodeSave(read())
 const handle=(event:Event)=>{
  const d=(event as CustomEvent<{characterId?:string;action?:StreetVerseEpisodeAction;fictional?:boolean}>).detail
  if(d?.fictional!==true||!isCharacter(d.characterId))return
  const action=d.action
  if(action!=='stroke'&&action!=='nosebleed'&&action!=='allergy'&&action!=='severe-allergy'&&action!=='first-aid'&&action!=='emergency-dispatch'&&action!=='hospital-discharge')return
  const next=advanceHealthEpisode(states[d.characterId],action)
  states[d.characterId]=next.state;save()
  window.dispatchEvent(new CustomEvent('tryamm:streetverse-health-episode-status',{detail:{...next.state,message:next.message}}))
  if(next.dispatchEmergency)window.dispatchEvent(new CustomEvent('tryamm:streetverse-cast-rescue-request',{detail:{characterId:d.characterId,fictional:true,reason:next.state.condition,priority:'emergency'}}))
 }
 window.addEventListener('tryamm:streetverse-health-episode',handle)
 return {get:(id:StreetVerseHealthCharacter)=>states[id],dispose:()=>window.removeEventListener('tryamm:streetverse-health-episode',handle)}
}
