import {authorizeAction,type AuthorityRequest} from './HoloGPTHumanAuthorityKernel'
import {CONSCIOUSNESS_PROTOCOL} from './HoloGPTConsciousnessProtocol'

/** Deluxe upgrade of the existing JARVIS/HoloGPT identity. This is a self-model,
 * not a claim of subjective consciousness. Live services require real configuration.
 */
export type JarvisDeluxeMode='FAST'|'BALANCED'|'DEEP'
export type JarvisDeluxeVoice='british'|'african-american'|'authorized-custom'|'device-default'
export type Connection='checking'|'online'|'degraded'|'offline'
export interface JarvisDeluxeSnapshot{
 identity:'JARVIS';edition:'DELUXE';reasoningProvider:'HoloGPT';
 mode:JarvisDeluxeMode;voice:JarvisDeluxeVoice;
 ai:Connection;livekit:Connection;livekitConfigured:boolean;livekitTwoDeviceVerified:false;
 world:'streetverse'|'campusverse'|'none';activeCharacterId:string|null;
 conditions:Record<string,{condition:string;health:number;needsRescue:boolean}>;
 memoryScope:'local-preferences-and-world-context';selfModel:'ADVANCED_SELF_MODEL';
 consciousnessVerified:false;updatedAt:string
}
export const JARVIS_DELUXE_SETTINGS_KEY='tryamm.jarvis.deluxe.v1'
export const JARVIS_DELUXE_CAPABILITIES=[
 'Existing HoloGPT /api/ai/answer text reasoning with verified fallback',
 'StreetVerse, CampusVerse, Mycelium condition and named-character context',
 'Non-graphic medical emergencies and NPC dispatch signals',
 'One-hand controls, typed commands, voice preferences, voice availability reporting',
 'LiveKit provider configuration and real host/viewer readiness checks',
 'Explicit human approval for privileged actions'
] as const
const MODES=['FAST','BALANCED','DEEP'] as const
const VOICES=['british','african-american','authorized-custom','device-default'] as const
const isMode=(x:unknown):x is JarvisDeluxeMode=>typeof x==='string'&&MODES.includes(x as JarvisDeluxeMode)
const isVoice=(x:unknown):x is JarvisDeluxeVoice=>typeof x==='string'&&VOICES.includes(x as JarvisDeluxeVoice)
export function createJarvisDeluxeState(raw?:string|null):JarvisDeluxeSnapshot{
 let preference:{mode?:unknown;voice?:unknown}={}
 try{if(raw){const x=JSON.parse(raw);if(x&&typeof x==='object')preference=x}}catch{}
 return {identity:'JARVIS',edition:'DELUXE',reasoningProvider:'HoloGPT',
  mode:isMode(preference.mode)?preference.mode:'BALANCED',
  voice:isVoice(preference.voice)?preference.voice:'device-default',
  ai:'checking',livekit:'checking',livekitConfigured:false,livekitTwoDeviceVerified:false,
  world:'none',activeCharacterId:null,conditions:{},memoryScope:'local-preferences-and-world-context',
  selfModel:'ADVANCED_SELF_MODEL',consciousnessVerified:false,updatedAt:new Date(0).toISOString()}
}
export function normalizeJarvisStatus(service:'ai'|'livekit',responseOk:boolean,body:unknown):Connection{
 const b=body&&typeof body==='object'?body as Record<string,unknown>:{}
 if(!responseOk)return 'offline'
 if(service==='livekit')return b.configured===true?'online':'offline'
 return b.ok===true&&b.degraded!==true&&b.intelligentProviderConfigured!==false?'online':'degraded'
}
export function jarvisDeluxeAuthorize(request:AuthorityRequest){return authorizeAction(request)}
export function jarvisDeluxeContext(state:JarvisDeluxeSnapshot){
 return {assistant:'JARVIS',edition:'DELUXE',mode:state.mode,
  world:state.world,activeCharacterId:state.activeCharacterId,
  fictionalConditions:Object.entries(state.conditions).slice(0,12).map(([id,v])=>({characterId:id,...v})),
  humanAuthorizationRequired:true,consciousnessVerified:false,
  livekitConfigured:state.livekitConfigured,livekitTwoDeviceVerified:state.livekitTwoDeviceVerified}
}
export function installJarvisDeluxeRuntime(){
 let saved:string|null=null
 try{saved=localStorage.getItem(JARVIS_DELUXE_SETTINGS_KEY)}catch{}
 let state=createJarvisDeluxeState(saved),disposed=false
 const emit=()=>{
  if(disposed)return
  state={...state,updatedAt:new Date().toISOString()}
  window.dispatchEvent(new CustomEvent('tryamm:jarvis-deluxe-state',{detail:{...state,conditions:{...state.conditions}}}))
 }
 const save=()=>{try{localStorage.setItem(JARVIS_DELUXE_SETTINGS_KEY,JSON.stringify({mode:state.mode,voice:state.voice}))}catch{}}
 const refresh=async()=>{
  await Promise.all(([['ai','/api/ai/health'],['livekit','/api/live/status']] as const).map(async([service,url])=>{
   const c=new AbortController(),timeout=window.setTimeout(()=>c.abort(),6500)
   try{
    const response=await fetch(url,{cache:'no-store',signal:c.signal})
    const data=await response.json() as Record<string,unknown>
    if(disposed)return
    const status=normalizeJarvisStatus(service,response.ok,data)
    state=service==='ai'?{...state,ai:status}:{...state,livekit:status,livekitConfigured:data.configured===true}
   }catch{
    if(!disposed)state=service==='ai'?{...state,ai:'offline'}:{...state,livekit:'offline',livekitConfigured:false}
   }finally{clearTimeout(timeout);emit()}
  }))
 }
 const onPreference=(e:Event)=>{
  const d=(e as CustomEvent<{mode?:string;voice?:string}>).detail
  if(!d)return
  state={...state,mode:isMode(d.mode)?d.mode:state.mode,voice:isVoice(d.voice)?d.voice:state.voice}
  save();emit()
 }
 const onCharacter=(e:Event)=>{
  const d=(e as CustomEvent<{characterId?:string}>).detail
  if(typeof d?.characterId==='string'){state={...state,activeCharacterId:d.characterId,world:'streetverse'};emit()}
 }
 const onCondition=(e:Event)=>{
  const d=(e as CustomEvent<{characterId?:string;condition?:string;health?:number;needsRescue?:boolean;fictional?:boolean}>).detail
  if(d?.fictional!==true||typeof d.characterId!=='string'||typeof d.condition!=='string'||typeof d.health!=='number'||!Number.isFinite(d.health))return
  state={...state,world:'streetverse',conditions:{...state.conditions,[d.characterId]:{condition:d.condition,health:Math.max(0,Math.min(100,d.health)),needsRescue:Boolean(d.needsRescue)}}};emit()
 }
 const onContext=(e:Event)=>{
  const d=(e as CustomEvent<{world?:string}>).detail
  if(d?.world==='streetverse'||d?.world==='campusverse'||d?.world==='none'){state={...state,world:d.world};emit()}
 }
 const onRefresh=()=>{void refresh()}
 const onHello=()=>emit()
 window.addEventListener('tryamm:jarvis-deluxe-preferences',onPreference)
 window.addEventListener('tryamm:jarvis-deluxe-refresh',onRefresh)
 window.addEventListener('tryamm:jarvis-deluxe-request-state',onHello)
 window.addEventListener('tryamm:streetverse-character-registered',onCharacter)
 window.addEventListener('tryamm:mycelium-character-condition',onCondition)
 window.addEventListener('tryamm:jarvis-world-context',onContext)
 emit();void refresh()
 return {get:()=>state,refresh,dispose(){
  disposed=true
  window.removeEventListener('tryamm:jarvis-deluxe-preferences',onPreference)
  window.removeEventListener('tryamm:jarvis-deluxe-refresh',onRefresh)
  window.removeEventListener('tryamm:jarvis-deluxe-request-state',onHello)
  window.removeEventListener('tryamm:streetverse-character-registered',onCharacter)
  window.removeEventListener('tryamm:mycelium-character-condition',onCondition)
  window.removeEventListener('tryamm:jarvis-world-context',onContext)
 }}
}
export const JARVIS_DELUXE_CONSCIOUSNESS_POLICY=CONSCIOUSNESS_PROTOCOL.principle
