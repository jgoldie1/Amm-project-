import {OMNIVAULT_100_ARCHITECTURE} from '../data/OmniVault100Architecture'
import {PrivateMemorySession} from './PrivateMemorySession'
import {installCatalogMemory} from './GoogloplexCatalogMemory'
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

const MAX_NOTE_KEYS=24
let installed=false
function appIdentity():SharedQuantumMemory['sourceApp']{
 return typeof location!=='undefined'&&location.pathname.startsWith('/streetverse')?'streetverse':'tryamm'
}
function baseMemory():SharedQuantumMemory{
 return{
  schema:'tryamm.quantum-memory.v1',
  savedAt:0,
  sourceApp:appIdentity(),
  lastRoute:typeof location!=='undefined'?location.pathname:'',
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
 if(typeof window==='undefined')return
 if(memory.world.weather)window.dispatchEvent(new CustomEvent('tryamm:world-weather',{detail:{weather:memory.world.weather,source:'quantum-memory'}}))
 if(memory.world.quality)window.dispatchEvent(new CustomEvent('tryamm:quantum-lag-buster',{detail:{quality:memory.world.quality,metrics:{fps:60,rtt:0},source:'quantum-memory'}}))
 if(Number.isFinite(memory.world.hour))window.dispatchEvent(new CustomEvent('tryamm:world-clock',{detail:{hour:memory.world.hour,source:'quantum-memory'}}))
 window.dispatchEvent(new CustomEvent('tryamm:quantum-memory-hydrated',{detail:{memory,source,crossDevice:source==='cloud'}}))
}

export function installSharedQuantumMemoryRuntime(){
 if(installed||typeof window==='undefined')return
 installed=true
 installCatalogMemory()
 const client=getSupabaseClient()
 const store=new PrivateMemorySession('world',client)
 let current=baseMemory(),dirty=false,editVersion=0
 let savingGeneration:number|null=null
 let saveTimer:number|undefined
 const signal=(name:string,detail:unknown)=>window.dispatchEvent(new CustomEvent(name,{detail}))
 const reset=()=>{current=baseMemory();dirty=false;editVersion++;if(saveTimer)clearTimeout(saveTimer);saveTimer=undefined;signal('tryamm:quantum-memory-reset',{memory:current});apply(current,'local')}
 const persistCloud=async()=>{
  if(!store.owner||!store.ready||!dirty||savingGeneration===store.generation)return
  const generation=store.generation,version=editVersion
  savingGeneration=generation
  try{
   const row=await store.save({...current,notes:sanitizeNotes(current.notes)})
   if(!row||generation!==store.generation)return
   if(version===editVersion)dirty=false
   signal('tryamm:quantum-memory-synced',{savedAt:current.savedAt,crossDevice:true})
  }catch(error){
   if(generation===store.generation){
    signal('tryamm:quantum-memory-sync-error',{message:(error as Error).message})
    try{const latest=await store.load();if(generation===store.generation&&latest?.payload?.notes)current={...current,notes:sanitizeNotes({...latest.payload.notes,...current.notes})}}catch{/* Keep unsaved state and report on next attempt. */}
   }
  }
  finally{if(savingGeneration===generation)savingGeneration=null;if(generation===store.generation&&dirty)scheduleCloud()}

 }
 const scheduleCloud=()=>{
  if(saveTimer||!store.ready)return
  saveTimer=window.setTimeout(()=>{saveTimer=undefined;void persistCloud()},15000)
 }
 const update=(patch:Partial<SharedQuantumMemory>)=>{
  current={
   ...current,
   ...patch,
   schema:'tryamm.quantum-memory.v1',
   savedAt:Date.now(),
   sourceApp:appIdentity(),
   lastRoute:location.pathname,
   world:{...current.world,...(patch.world||{})},
   notes:sanitizeNotes({...current.notes,...sanitizeNotes(patch.notes as Record<string,unknown>|undefined)}),
  }
  dirty=true;editVersion++
  scheduleCloud()
  window.dispatchEvent(new CustomEvent('tryamm:quantum-memory-updated',{detail:{memory:current,crossDevice:Boolean(store.owner&&store.ready)}}))
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
  window.dispatchEvent(new CustomEvent('tryamm:quantum-memory-state',{detail:{memory:current,crossDevice:Boolean(store.owner&&store.ready)}}))
 })

 if(client){
  client.auth.onAuthStateChange((event,session)=>{
   const owner=session?.user.id||null
   if(owner===store.owner&&event!=='INITIAL_SESSION')return
   store.switchOwner(owner);reset()
   if(!owner)return
   const generation=store.generation
   // Run outside the auth callback to avoid auth-lock deadlocks.
   setTimeout(()=>{void (async()=>{
    try{
     const row=await store.load()
     if(generation!==store.generation)return
     const memory=row?.payload
     if(memory?.schema==='tryamm.quantum-memory.v1'){
      const loadedWorld:CompactWorldMemory={}
      for(const key of ['hour','generatedAt','lastEnteredAt','lastLeftAt'] as const)if(Number.isFinite(memory.world?.[key]))loadedWorld[key]=memory.world[key]
      for(const key of ['weather','quality'] as const)if(typeof memory.world?.[key]==='string')loadedWorld[key]=memory.world[key].slice(0,100)
      const community=memory.world?.lastCommunity
      if(community&&typeof community==='object')loadedWorld.lastCommunity={number:typeof community.number==='string'?community.number.slice(0,20):undefined,name:typeof community.name==='string'?community.name.slice(0,200):undefined,x:Number.isFinite(community.x)?community.x:undefined,z:Number.isFinite(community.z)?community.z:undefined}
      const fresh=dirty?current:null
      current={...baseMemory(),savedAt:Number(memory.savedAt)||0,world:{...loadedWorld,...(fresh?.world||{})},notes:sanitizeNotes({...sanitizeNotes(memory.notes),...(fresh?.notes||{})})}
      apply(current,'cloud')
     }
     if(dirty)scheduleCloud()
    }catch(error){if(generation===store.generation)signal('tryamm:quantum-memory-sync-error',{message:(error as Error).message})}
   })()},0)
  })
 }
 // Legacy unscoped local data and user_metadata are deliberately not imported:
 // their ownership cannot be established safely on shared devices.
 window.dispatchEvent(new CustomEvent('tryamm:quantum-memory-ready',{detail:{
  local:false,
  crossDevice:false,
  cloudConfigured:Boolean(client),
  sharedBy:['tryamm','streetverse','hologpt','middleverse','holo-fon'],
  regionalCoreTarget:OMNIVAULT_100_ARCHITECTURE.id,
  regionalCoreStatus:OMNIVAULT_100_ARCHITECTURE.status,
  payload:'compact-continuation-state',
 }}))
}
