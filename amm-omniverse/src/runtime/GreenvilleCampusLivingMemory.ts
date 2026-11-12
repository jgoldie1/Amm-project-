/** Fictional Greenville campus memory. Does not change any academic record,
 * real student identity, school service, credit balance or on-chain ledger.
 */
export const GREENVILLE_CAMPUS_MEMORY_SAVE_KEY='tryamm.campusverse.greenville.living-memory.v1'
export const GREENVILLE_CAMPUS_MEMORY_EVENT='tryamm:campusverse-living-memory-changed'

export const GREENVILLE_MEMORY_HUBS=[
 {id:'student-union',label:'Student Union',mentor:'Orientation Guide',project:'Welcome Station',welcome:'Students recognize Jacobie for supporting campus orientation.'},
 {id:'hogue-lawn',label:'Hogue Lawn',mentor:'Garden Volunteer',project:'Community Garden',welcome:'The lawn has a shared garden and classmates greet Jacobie.'},
 {id:'burritt-hall',label:'Burritt Hall',mentor:'Dorm Resident',project:'Residence Welcome Board',welcome:'Dorm neighbors remember Jacobie helping a new student settle in.'},
 {id:'blankenship-tower',label:'Tower / Blankenship',mentor:'Safety Steward',project:'Safer Walkway Lights',welcome:'Campus neighbors recognize Jacobie for improving the pathway.'},
 {id:'scott-field',label:'Scott Field',mentor:'Team Captain',project:'Team Practice Station',welcome:'The team greets Jacobie as a familiar supporter.'},
] as const

export type GreenvilleMemoryHubId=typeof GREENVILLE_MEMORY_HUBS[number]['id']
export type GreenvilleCampusChoice='help'|'learn'|'create'
export type GreenvilleCampusMemoryEntry=Readonly<{hubId:GreenvilleMemoryHubId;choice:GreenvilleCampusChoice}>
export type GreenvilleCampusLivingMemory=Readonly<{version:1;entries:GreenvilleCampusMemoryEntry[]}>
const IDS=GREENVILLE_MEMORY_HUBS.map(h=>h.id)
const CHOICES:readonly GreenvilleCampusChoice[]=['help','learn','create']
const MAX_SIZE=4000

export const initialGreenvilleCampusLivingMemory=():GreenvilleCampusLivingMemory=>({version:1,entries:[]})
export const greenvilleCampusXp=(state:GreenvilleCampusLivingMemory)=>state.entries.length*25
export const greenvilleCampusReputation=(state:GreenvilleCampusLivingMemory)=>state.entries.length

export function readGreenvilleCampusLivingMemory(raw:string|null):GreenvilleCampusLivingMemory{
 const initial=initialGreenvilleCampusLivingMemory()
 if(!raw||raw.length>MAX_SIZE)return initial
 try{
  const parsed:unknown=JSON.parse(raw)
  if(!parsed||typeof parsed!=='object')return initial
  const data=parsed as {version?:unknown;entries?:unknown}
  if(data.version!==1||!Array.isArray(data.entries)||data.entries.length>IDS.length)return initial
  const entries:GreenvilleCampusMemoryEntry[]=[]
  const seen=new Set<string>()
  for(const entry of data.entries){
   if(!entry||typeof entry!=='object')return initial
   const item=entry as {hubId?:unknown;choice?:unknown}
   if(!IDS.includes(item.hubId as GreenvilleMemoryHubId)||!CHOICES.includes(item.choice as GreenvilleCampusChoice)||seen.has(String(item.hubId)))return initial
   seen.add(String(item.hubId))
   entries.push({hubId:item.hubId as GreenvilleMemoryHubId,choice:item.choice as GreenvilleCampusChoice})
  }
  return {version:1,entries}
 }catch{return initial}
}
export const serializeGreenvilleCampusLivingMemory=(state:GreenvilleCampusLivingMemory)=>JSON.stringify(state)

export function chooseGreenvilleCampusAction(state:GreenvilleCampusLivingMemory,hubId:GreenvilleMemoryHubId,choice:GreenvilleCampusChoice){
 const hub=GREENVILLE_MEMORY_HUBS.find(item=>item.id===hubId)
 if(!hub||!CHOICES.includes(choice))return {ok:false,state,message:'Unknown campus activity.'}
 if(state.entries.some(entry=>entry.hubId===hubId))return {ok:false,state,message:'Jacobie already helped shape '+hub.label+'. The community remembers.'}
 const next:GreenvilleCampusLivingMemory={version:1,entries:[...state.entries,{hubId,choice}]}
 const action=choice==='help'?'helping students':choice==='learn'?'learning a skill':'creating something for others'
 return {ok:true,state:next,message:'Jacobie advanced campus life by '+action+'. '+hub.project+' is now visible. +25 fictional XP.'}
}

export function greenvilleCampusGreeting(state:GreenvilleCampusLivingMemory,hubId:GreenvilleMemoryHubId):string{
 const hub=GREENVILLE_MEMORY_HUBS.find(item=>item.id===hubId)
 if(!hub)return 'Choose a valid Greenville campus stop.'
 const completed=state.entries.some(entry=>entry.hubId===hubId)
 return completed?hub.welcome:'New campus opportunity: reach '+hub.label+' and choose how Jacobie helps the community.'
}

/** Offline, deterministic NPC lines; not generated AI, real campus staff, or open chat.
 * Repeating a conversation grants no XP, credits or inventory.
 */
export function greenvilleCampusNPCDialogue(state:GreenvilleCampusLivingMemory,hubId:GreenvilleMemoryHubId):Readonly<{speaker:string;text:string;remembered:boolean;hubId:GreenvilleMemoryHubId}>{
 const hub=GREENVILLE_MEMORY_HUBS.find(item=>item.id===hubId)
 if(!hub)return {speaker:'Campus Guide',text:'Visit a marked Greenville stop to meet a campus character.',remembered:false,hubId}
 const memory=state.entries.find(item=>item.hubId===hubId)
 if(!memory){
  return {speaker:hub.mentor,text:'Welcome to '+hub.label+', Jacobie. We are making this a more welcoming campus. Choose HELP, LEARN or CREATE, and I will remember what you do here.',remembered:false,hubId}
 }
 const action=memory.choice==='help'?'helped other students':memory.choice==='learn'?'learned and shared a campus skill':'created something for this community'
 return {speaker:hub.mentor,text:'Welcome back, Jacobie! I remember you '+action+' at '+hub.label+'. '+hub.project+' is still here. Other campus locations have their own stories.',remembered:true,hubId}
}
