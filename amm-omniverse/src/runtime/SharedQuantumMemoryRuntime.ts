import {OMNIVAULT_100_ARCHITECTURE} from '../data/OmniVault100Architecture'
import type {Session} from '@supabase/supabase-js'
import {getSupabaseClient} from '../services/supabaseClient'
import type {LivingWorldSnapshot} from './StreetVerseLivingWorldRuntime'

type CompactWorldMemory={
 hour?:number
 weather?:string
 quality?:string
 generatedAt?:number
 lastCommunity?:{number?:string;name?:string;x?:number;z?:number}
 lastEnteredAt?:number
 lastLeftAt?:number
}

export type SharedQuantumMemory={
 schema:'tryamm.quantum-memory.v1'
 savedAt:number
 sourceApp:'tryamm'|'streetverse'
 lastRoute:string
 world:CompactWorldMemory
 notes:Record<string,string|number|boolean|null>
}

const LOCAL_KEY='tryamm_quantum_memory_v1'
const USER_META_KEY='tryamm_quantum_memory_v1'
const MAX_NOTE_KEYS=24
let installed=false

function appIdentity():SharedQuantumMemory['sourceApp']{
 return typeof location!=='undefined'&&location.pathname.startsWith('/streetverse')?'streetverse':'tryamm'
}
function readLocal():SharedQuantumMemory|null{
 try{
  const value=JSON.parse(localStorage.getItem(LOCAL_KEY)||'null')
  return value?.schema==='tryamm.quantum-memory.v1'?value:null
 }catch{return null}
}
function writeLocal(memory:SharedQuantumMemory){
 try{localStorage.setItem(LOCAL_KEY,JSON.stringify(memory))}catch{}
}
function newer(a:SharedQuantumMemory|null,b:SharedQuantumMemory|null){
 if(!a)return b
 if(!b)return a
 return Number(a.savedAt||0)>=Number(b.savedAt||0)?a:b
}
function baseMemory():SharedQuantumMemory{
 return{
  schema:'tryamm.quantum-memory.v1',
  savedAt:Date.now(),
  sourceApp:appIdentity(),
  lastRoute:typeof location!=='undefined'?location.pathname+location.search:'',
  world:{},
  notes:{},
 }
}
function sanitizeNotes(input:Record<string,unknown>|undefined){
 const out:Record<string,string|number|boolean|null>={}
 for(const [key,value] of Object.entries(input||{}).slice(0,MAX_NOTE_KEYS)){
  if(typeof value==='string')out[key.slice(0,60)]=value.slice(0,300)
  else if(typeof value==='number'&&Number.isFinite(value))out[key.slice(0,60)]=value
  else if(typeof value==='boolean'||value===null)out[key.slice(0,60)]=value
 }
 return out
}
function apply(memory:SharedQuantumMemory,source:'local'|'cloud'){
 writeLocal(memory)
 if(typeof window==='undefined')return
 if(memory.world.weather)window.dispatchEvent(new CustomEvent('tryamm:world-weather',{detail:{weather:memory.world.weather,source:'quantum-memory'}}))
 if(memory.world.quality)window.dispatchEvent(new CustomEvent('tryamm:quantum-lag-buster',{detail:{quality:memory.world.quality,metrics:{fps:60,rtt:0},source:'quantum-memory'}}))
 if(Number.isFinite(memory.world.hour))window.dispatchEvent(new CustomEvent('tryamm:world-clock',{detail:{hour:memory.world.hour,source:'quantum-memory'}}))
 window.dispatchEvent(new CustomEvent('tryamm:quantum-memory-hydrated',{detail:{memory,source,crossDevice:source==='cloud'}}))
}

export function installSharedQuantumMemoryRuntime(){
 if(installed||typeof window==='undefined')return
 installed=true
 const client=getSupabaseClient()
 let current=readLocal()||baseMemory()
 let activeSession:Session|null=null
 let saveTimer:number|undefined
 apply(current,'local')

 const persistCloud=async()=>{
  if(!client||!activeSession?.user)return
  const payload:SharedQuantumMemory={
   ...current,
   savedAt:Date.now(),
   sourceApp:appIdentity(),
   lastRoute:location.pathname+location.search,
   notes:sanitizeNotes(current.notes),
  }
  current=payload
  writeLocal(payload)
  const {error}=await client.auth.updateUser({data:{[USER_META_KEY]:payload}})
  if(error){
   window.dispatchEvent(new CustomEvent('tryamm:quantum-memory-sync-error',{detail:{message:error.message}}))
   return
  }
  window.dispatchEvent(new CustomEvent('tryamm:quantum-memory-synced',{detail:{savedAt:payload.savedAt,sourceApp:payload.sourceApp,crossDevice:true,regionalCoreTarget:OMNIVAULT_100_ARCHITECTURE.id}}))
  window.dispatchEvent(new CustomEvent('tryamm:omnivault-sync-intent',{detail:{
    workload:'world-state',
    source:'quantum-memory',
    regionalCoreTarget:OMNIVAULT_100_ARCHITECTURE.id,
    regionalCoreStatus:OMNIVAULT_100_ARCHITECTURE.status,
    currentDurableProvider:'supabase-user-metadata',
    physicalCapacityRequired:false,
  }}))
 }
 const scheduleCloud=()=>{
  if(saveTimer)window.clearTimeout(saveTimer)
  saveTimer=window.setTimeout(()=>{void persistCloud()},1200)
 }

 const update=(patch:Partial<SharedQuantumMemory>)=>{
  current={
   ...current,
   ...patch,
   schema:'tryamm.quantum-memory.v1',
   savedAt:Date.now(),
   sourceApp:appIdentity(),
   lastRoute:location.pathname+location.search,
   world:{...current.world,...(patch.world||{})},
   notes:{...current.notes,...sanitizeNotes(patch.notes as Record<string,unknown>|undefined)},
  }
  writeLocal(current)
  scheduleCloud()
  window.dispatchEvent(new CustomEvent('tryamm:quantum-memory-updated',{detail:{memory:current,crossDevice:Boolean(activeSession?.user)}}))
 }

 window.addEventListener('tryamm:living-world-state',(event:Event)=>{
  const snapshot=(event as CustomEvent<LivingWorldSnapshot>).detail
  if(!snapshot?.generatedAt)return
  update({world:{
   hour:snapshot.hour,
   weather:snapshot.weather,
   quality:snapshot.budget?.quality,
   generatedAt:snapshot.generatedAt,
  }})
 })
 window.addEventListener('tryamm:streetverse-community-travel-complete',(event:Event)=>{
  const d=(event as CustomEvent<any>).detail||{}
  update({world:{lastCommunity:{
   number:String(d.communityAreaNumber||d.number||''),
   name:String(d.name||''),
   x:Number.isFinite(Number(d.x))?Number(d.x):undefined,
   z:Number.isFinite(Number(d.z))?Number(d.z):undefined,
  }}})
 })
 window.addEventListener('tryamm:streetverse-enter',()=>update({world:{lastEnteredAt:Date.now()}}))
 window.addEventListener('tryamm:streetverse-leave',()=>update({world:{lastLeftAt:Date.now()}}))
 window.addEventListener('tryamm:quantum-memory-note',(event:Event)=>{
  const d=(event as CustomEvent<{key?:string;value?:unknown}>).detail||{}
  if(!d.key)return
  update({notes:sanitizeNotes({[d.key]:d.value})})
 })
 window.addEventListener('tryamm:quantum-memory-request-state',()=>{
  window.dispatchEvent(new CustomEvent('tryamm:quantum-memory-state',{detail:{memory:current,crossDevice:Boolean(activeSession?.user)}}))
 })

 if(client){
  client.auth.onAuthStateChange((event,session)=>{
   activeSession=session
   if(!session?.user)return
   if(!['INITIAL_SESSION','SIGNED_IN','USER_UPDATED','TOKEN_REFRESHED'].includes(event))return
   const remote=(session.user.user_metadata?.[USER_META_KEY]||null) as SharedQuantumMemory|null
   const chosen=newer(current,remote)
   if(chosen){
    current=chosen
    apply(chosen,remote&&chosen.savedAt===remote.savedAt?'cloud':'local')
   }
   scheduleCloud()
  })
 }

 window.dispatchEvent(new CustomEvent('tryamm:quantum-memory-ready',{detail:{
  local:true,
  crossDevice:Boolean(client),
  sharedBy:['tryamm','streetverse','hologpt','middleverse','holo-fon'],
  regionalCoreTarget:OMNIVAULT_100_ARCHITECTURE.id,
  regionalCoreStatus:OMNIVAULT_100_ARCHITECTURE.status,
  payload:'compact-continuation-state',
 }}))
}
