import type {Session} from '@supabase/supabase-js'
import {createAccessibilityPassport,loadAccessibilityPassport,saveAccessibilityPassport,type AccessibilityPassport} from '../accessibility/accessibilityPassport'
import {getSupabaseClient} from '../services/supabaseClient'
import {loadPassportAccessDurable,savePassportAccessDurable,type PassportAccessPrefs} from './PassportAccessibilityMemory'
import type {AdaptiveAccessProfile,AccessNeed} from './UniversalAccessOrchestrator'

function browserLanguage(){
 if(typeof navigator!=='undefined'&&navigator.language)return navigator.language
 return 'en-US'
}
function needsFor(p:PassportAccessPrefs):AccessNeed[]{
 const needs=new Set<AccessNeed>()
 if(p.oneHandedMode||p.oneHand||p.switchControl||p.largeTargets)needs.add('mobility')
 if(p.screenReader||p.highContrast||p.largeText||p.audioDescription)needs.add('vision')
 if(p.captions||p.transcripts||p.signLanguageTag)needs.add('hearing')
 if(p.speechToText||p.textToSpeech||p.communicationPreference==='text')needs.add('speech')
 if(p.simplifiedUI||p.plainLanguage||p.extraProcessingTime)needs.add('cognitive')
 return [...needs]
}
function toAdaptiveProfile(p:PassportAccessPrefs):AdaptiveAccessProfile{
 return {
  languageTag:p.languageTag||browserLanguage(),needs:needsFor(p),oneHand:p.oneHand,voiceControl:p.voice,
  switchControl:p.switchControl,screenReader:p.screenReader,largeTargets:p.largeTargets,reducedMotion:p.reducedMotion,
  highContrast:p.highContrast,captions:p.captions,textToSpeech:p.textToSpeech,speechToText:p.speechToText,
  simpleLanguage:Boolean(p.plainLanguage||p.simplifiedUI),signLanguageTag:p.signLanguageTag
 }
}
function toLegacyPassport(userId:string,p:PassportAccessPrefs):AccessibilityPassport{
 const current=loadAccessibilityPassport()
 return createAccessibilityPassport({
  ...current,userId,
  communicationPreference:p.communicationPreference??current.communicationPreference??'none',
  opportunityNeeds:p.opportunityNeeds??current.opportunityNeeds,
  preferences:{
   ...current.preferences,screenReader:!!p.screenReader,keyboardOnly:!!p.keyboardOnly,switchAccess:!!p.switchControl,
   voiceControl:!!p.voice,oneHandedMode:!!(p.oneHandedMode||p.oneHand),largeTargets:!!p.largeTargets,largeText:!!p.largeText,
   highContrast:!!p.highContrast,reducedMotion:!!p.reducedMotion,captions:!!p.captions,transcripts:!!p.transcripts,
   audioDescription:!!p.audioDescription,speechToText:!!p.speechToText,textToSpeech:!!p.textToSpeech,
   simplifiedUI:!!(p.simplifiedUI||p.plainLanguage),extraProcessingTime:!!p.extraProcessingTime
  }
 })
}
function fromLegacyPassport(passport:AccessibilityPassport,current?:PassportAccessPrefs):PassportAccessPrefs{
 const q=passport.preferences
 return {
  ...current,languageTag:current?.languageTag||browserLanguage(),signLanguageTag:current?.signLanguageTag,oneHand:current?.oneHand,
  oneHandedMode:q.oneHandedMode,captions:q.captions,voice:q.voiceControl,switchControl:q.switchAccess,screenReader:q.screenReader,
  largeTargets:q.largeTargets,reducedMotion:q.reducedMotion,highContrast:q.highContrast,plainLanguage:q.simplifiedUI,
  keyboardOnly:q.keyboardOnly,largeText:q.largeText,transcripts:q.transcripts,audioDescription:q.audioDescription,
  speechToText:q.speechToText,textToSpeech:q.textToSpeech,simplifiedUI:q.simplifiedUI,extraProcessingTime:q.extraProcessingTime,
  communicationPreference:passport.communicationPreference??'none',opportunityNeeds:[...passport.opportunityNeeds]
 }
}
function applyHydratedPreferences(userId:string,p:PassportAccessPrefs){
 saveAccessibilityPassport(toLegacyPassport(userId,p))
 if(typeof window==='undefined')return
 window.dispatchEvent(new CustomEvent('tryamm:access-profile',{detail:toAdaptiveProfile(p)}))
 window.dispatchEvent(new CustomEvent('tryamm:accessibility-update',{detail:{
  mobility:(p.oneHandedMode||p.oneHand)?'one-hand':p.switchControl?'switch':p.voice?'voice':'standard',
  vision:p.screenReader?'screen-reader':p.highContrast?'high-contrast':p.largeText?'large-text':'standard',
  hearing:p.captions?'captions':'standard',cognitive:(p.simplifiedUI||p.plainLanguage)?'simplified':'standard',
  speech:p.textToSpeech?'text-to-speech':'standard',motion:p.reducedMotion?'reduced':'standard',
  handedness:p.oneHand??'either',language:p.languageTag||browserLanguage(),autoTranslate:true,captions:!!p.captions,spatialAudioCues:true
 }}))
 window.dispatchEvent(new CustomEvent('tryamm:passport-access-hydrated',{detail:{userId,languageTag:p.languageTag,hasSignLanguage:Boolean(p.signLanguageTag)}}))
}
export function installPassportAccessibilityHydrationRuntime(){
 if(typeof window==='undefined')return()=>{}
 const client=getSupabaseClient()
 if(!client){window.dispatchEvent(new CustomEvent('tryamm:passport-access-unavailable',{detail:{reason:'supabase-not-configured'}}));return()=>{}}
 let generation=0
 let activeUserId:string|undefined
 let activePrefs:PassportAccessPrefs|undefined
 const hydrate=async(session:Session,token:number)=>{
  try{
   const loaded=await loadPassportAccessDurable(client)
   if(token!==generation||!session.user)return
   activeUserId=session.user.id
   if(!loaded){window.dispatchEvent(new CustomEvent('tryamm:passport-access-missing',{detail:{userId:session.user.id}}));return}
   activePrefs=loaded
   applyHydratedPreferences(session.user.id,loaded)
  }catch(error){
   if(token!==generation)return
   window.dispatchEvent(new CustomEvent('tryamm:passport-access-error',{detail:{operation:'hydrate',message:error instanceof Error?error.message:'unknown-error'}}))
  }
 }
 const authHandler=(event:string,session:Session|null)=>{
  const token=++generation
  if(event==='SIGNED_OUT'||!session?.user){
   activeUserId=undefined;activePrefs=undefined
   window.dispatchEvent(new CustomEvent('tryamm:passport-access-signed-out'))
   return
  }
  if(!['INITIAL_SESSION','SIGNED_IN','USER_UPDATED'].includes(event))return
  queueMicrotask(()=>void hydrate(session,token))
 }
 const {data:{subscription}}=client.auth.onAuthStateChange(authHandler)
 const legacySave=(event:Event)=>{
  const passport=(event as CustomEvent<AccessibilityPassport>).detail
  if(!passport)return
  const next=fromLegacyPassport(passport,activePrefs)
  void savePassportAccessDurable(client,next).then(saved=>{
   activePrefs=saved
   if(activeUserId)applyHydratedPreferences(activeUserId,saved)
   window.dispatchEvent(new CustomEvent('tryamm:passport-access-saved',{detail:{source:'legacy-passport'}}))
  }).catch(error=>window.dispatchEvent(new CustomEvent('tryamm:passport-access-error',{detail:{operation:'save',message:error instanceof Error?error.message:'unknown-error'}})))
 }
 const universalSave=(event:Event)=>{
  const incoming=(event as CustomEvent<Partial<PassportAccessPrefs>>).detail
  if(!incoming)return
  const next:PassportAccessPrefs={...(activePrefs??{languageTag:browserLanguage()}),...incoming,languageTag:incoming.languageTag||activePrefs?.languageTag||browserLanguage()}
  void savePassportAccessDurable(client,next).then(saved=>{
   activePrefs=saved
   if(activeUserId)applyHydratedPreferences(activeUserId,saved)
   window.dispatchEvent(new CustomEvent('tryamm:passport-access-saved',{detail:{source:'universal-access'}}))
  }).catch(error=>window.dispatchEvent(new CustomEvent('tryamm:passport-access-error',{detail:{operation:'save',message:error instanceof Error?error.message:'unknown-error'}})))
 }
 window.addEventListener('tryamm:accessibility-passport-updated',legacySave)
 window.addEventListener('tryamm:passport-access-save',universalSave)
 window.dispatchEvent(new CustomEvent('tryamm:passport-access-runtime-ready',{detail:{durable:true,rlsScoped:true,diagnosisRequired:false}}))
 return()=>{generation++;subscription.unsubscribe();window.removeEventListener('tryamm:accessibility-passport-updated',legacySave);window.removeEventListener('tryamm:passport-access-save',universalSave)}
}
