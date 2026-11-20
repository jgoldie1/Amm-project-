/** Client-side, fictional Mycelium character state. Never send real medical data.
 * Versioned event ledger for NPC response, dispatch and saved conditions.
 */
export type MyceliumCharacterCondition='healthy'|'injured'|'recovering'|'stroke'|'nosebleed'|'allergy'|'severe-allergy'
export type MyceliumCharacterState={characterId:string;condition:MyceliumCharacterCondition;health:number;needsRescue:boolean;updatedAt:number;version:1}
export const MYCELIUM_CHARACTER_SAVE_KEY='tryamm.mycelium.character-conditions.v1'
const VALID=new Set<MyceliumCharacterCondition>(['healthy','injured','recovering','stroke','nosebleed','allergy','severe-allergy'])
export function normalizeMyceliumCondition(x:unknown):MyceliumCharacterCondition{
 return typeof x==='string'&&VALID.has(x as MyceliumCharacterCondition)?x as MyceliumCharacterCondition:'healthy'
}
function isId(value:unknown):value is string{return typeof value==='string'&&/^[a-zA-Z0-9][a-zA-Z0-9_-]{1,127}$/.test(value)}
export function createMyceliumCharacterState(input:{characterId:string;condition:MyceliumCharacterCondition;health?:number;updatedAt?:number}):MyceliumCharacterState{
 const health=typeof input.health==='number'&&Number.isFinite(input.health)?Math.round(Math.max(0,Math.min(100,input.health))):100
 const condition=normalizeMyceliumCondition(input.condition)
 return {characterId:input.characterId,condition,health,needsRescue:condition==='stroke'||condition==='severe-allergy'||health<=40,updatedAt:input.updatedAt??Date.now(),version:1}
}
export function readMyceliumSavedCharacters(raw:string|null):Record<string,MyceliumCharacterState>{
 const states:Record<string,MyceliumCharacterState>={}
 if(!raw)return states
 try{
  const data=JSON.parse(raw)
  if(!data||typeof data!=='object'||Array.isArray(data))return states
  for(const [id,value] of Object.entries(data).slice(0,100)){
   if(!isId(id)||!value||typeof value!=='object')continue
   const item=value as Partial<MyceliumCharacterState>
   if(item.characterId!==id||typeof item.condition!=='string'||!VALID.has(item.condition)||typeof item.health!=='number'||!Number.isFinite(item.health))continue
   states[id]=createMyceliumCharacterState({characterId:id,condition:item.condition,health:item.health,updatedAt:typeof item.updatedAt==='number'?item.updatedAt:undefined})
  }
 }catch{/* corrupted data is discarded */}
 return states
}
export function installStreetVerseMyceliumCharacterBridge(){
 const read=()=>{try{return localStorage.getItem(MYCELIUM_CHARACTER_SAVE_KEY)}catch{return null}}
 const states=readMyceliumSavedCharacters(read())
 const persist=()=>{try{localStorage.setItem(MYCELIUM_CHARACTER_SAVE_KEY,JSON.stringify(states))}catch{}}
 const publish=(item:MyceliumCharacterState)=>{
  // Broadcast an immutable snapshot for UI, dispatch and other connected Verse systems.
  window.dispatchEvent(new CustomEvent('tryamm:mycelium-character-condition',{detail:{...item,fictional:true,origin:'streetverse-character-factory'}}))
  window.dispatchEvent(new CustomEvent('tryamm:living-world-character-condition',{detail:{...item,fictional:true}}))
  // Adaptive runtime may choose NPC schedules, ambulances and proximity around this state.
  // Do not claim that the world has spawned a real ambulance until a responder acknowledges.
  if(item.needsRescue)window.dispatchEvent(new CustomEvent('tryamm:mycelium-medical-response-request',{detail:{characterId:item.characterId,condition:item.condition,fictional:true}}))
 }
 const update=(characterId:string,condition:MyceliumCharacterCondition,health?:number)=>{
  if(!isId(characterId))return
  const next=createMyceliumCharacterState({characterId,condition,health:health??states[characterId]?.health??100})
  states[characterId]=next;persist();publish(next)
 }
 const onHealth=(e:Event)=>{
  const d=(e as CustomEvent<{characterId?:string;condition?:string;stage?:string;fictional?:boolean}>).detail
  if(d?.fictional!==true||!isId(d.characterId))return
  let condition=normalizeMyceliumCondition(d.condition)
  if(d.stage==='hospital-recovery')condition='recovering'
  update(d.characterId,condition)
 }
 const onInjury=(e:Event)=>{
  const d=(e as CustomEvent<{characterId?:string;health?:number;injured?:boolean;fictional?:boolean}>).detail
  if(d?.fictional!==true||!isId(d.characterId))return
  update(d.characterId,d.injured?'injured':'healthy',d.health)
 }
 const onBJInjury=(e:Event)=>{
  const d=(e as CustomEvent<{health?:number;injured?:boolean}>).detail
  if(typeof d?.health==='number'&&Number.isFinite(d.health))update('bj-stubbs',d.injured?'injured':'healthy',d.health)
 }
 const onNewCharacter=(e:Event)=>{
  const d=(e as CustomEvent<{characterId?:string;fictional?:boolean}>).detail
  if(!isId(d?.characterId)||d?.fictional!==true)return
  if(!states[d.characterId])update(d.characterId,'healthy',100)
 }
 window.addEventListener('tryamm:streetverse-health-episode-status',onHealth)
 window.addEventListener('tryamm:streetverse-cast-medical-status',onInjury)
 window.addEventListener('tryamm:streetverse-bj-health-changed',onBJInjury)
 window.addEventListener('tryamm:streetverse-character-registered',onNewCharacter)
 // Existing snapshots are republished to the Mycelium channel on startup.
 for(const item of Object.values(states))publish(item)
 return {
  get:(id:string)=>states[id],
  register:(id:string)=>{if(!states[id])update(id,'healthy',100)},
  update,
  dispose(){
   window.removeEventListener('tryamm:streetverse-health-episode-status',onHealth)
   window.removeEventListener('tryamm:streetverse-cast-medical-status',onInjury)
   window.removeEventListener('tryamm:streetverse-bj-health-changed',onBJInjury)
   window.removeEventListener('tryamm:streetverse-character-registered',onNewCharacter)
  },
 }
}
