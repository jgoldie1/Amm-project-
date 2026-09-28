import type {SupabaseClient} from '@supabase/supabase-js'

export type PassportCommunicationPreference='text'|'voice'|'video'|'email'|'none'
export type PassportAccessPrefs={
 languageTag:string;signLanguageTag?:string;oneHand?:'left'|'right';oneHandedMode?:boolean;captions?:boolean;voice?:boolean;
 switchControl?:boolean;screenReader?:boolean;largeTargets?:boolean;reducedMotion?:boolean;highContrast?:boolean;
 plainLanguage?:boolean;keyboardOnly?:boolean;largeText?:boolean;transcripts?:boolean;audioDescription?:boolean;
 speechToText?:boolean;textToSpeech?:boolean;simplifiedUI?:boolean;extraProcessingTime?:boolean;
 communicationPreference?:PassportCommunicationPreference;opportunityNeeds?:string[]
}
const cache=new Map<string,PassportAccessPrefs>()
const row=(p:PassportAccessPrefs)=>({
 language_tag:p.languageTag,sign_language_tag:p.signLanguageTag??null,one_hand:p.oneHand??null,one_handed_mode:!!p.oneHandedMode,
 captions:!!p.captions,voice:!!p.voice,switch_control:!!p.switchControl,screen_reader:!!p.screenReader,
 large_targets:!!p.largeTargets,reduced_motion:!!p.reducedMotion,high_contrast:!!p.highContrast,
 plain_language:!!p.plainLanguage,keyboard_only:!!p.keyboardOnly,large_text:!!p.largeText,
 transcripts:!!p.transcripts,audio_description:!!p.audioDescription,speech_to_text:!!p.speechToText,
 text_to_speech:!!p.textToSpeech,simplified_ui:!!p.simplifiedUI,extra_processing_time:!!p.extraProcessingTime,
 communication_preference:p.communicationPreference??'none',opportunity_needs:[...new Set(p.opportunityNeeds??[])],
 updated_at:new Date().toISOString()
})
const prefs=(r:any):PassportAccessPrefs=>({
 languageTag:r.language_tag??'en-US',signLanguageTag:r.sign_language_tag??undefined,oneHand:r.one_hand??undefined,oneHandedMode:!!r.one_handed_mode,
 captions:!!r.captions,voice:!!r.voice,switchControl:!!r.switch_control,screenReader:!!r.screen_reader,
 largeTargets:!!r.large_targets,reducedMotion:!!r.reduced_motion,highContrast:!!r.high_contrast,plainLanguage:!!r.plain_language,
 keyboardOnly:!!r.keyboard_only,largeText:!!r.large_text,transcripts:!!r.transcripts,audioDescription:!!r.audio_description,
 speechToText:!!r.speech_to_text,textToSpeech:!!r.text_to_speech,simplifiedUI:!!r.simplified_ui,
 extraProcessingTime:!!r.extra_processing_time,communicationPreference:(r.communication_preference??'none') as PassportCommunicationPreference,
 opportunityNeeds:Array.isArray(r.opportunity_needs)?r.opportunity_needs:[]
})
export function savePassportAccess(passportId:string,p:PassportAccessPrefs){cache.set(passportId,{...p,opportunityNeeds:[...(p.opportunityNeeds??[])]});return cache.get(passportId)!}
export function loadPassportAccess(passportId:string){return cache.get(passportId)}
export function clearPassportAccess(passportId:string){return cache.delete(passportId)}
export async function savePassportAccessDurable(client:SupabaseClient,p:PassportAccessPrefs){
 const {data:{user},error:authError}=await client.auth.getUser();if(authError||!user)throw new Error('authenticated-user-required')
 const {error}=await client.from('passport_accessibility_preferences').upsert({user_id:user.id,...row(p)},{onConflict:'user_id'});if(error)throw error
 return savePassportAccess(user.id,p)
}
export async function loadPassportAccessDurable(client:SupabaseClient){
 const {data:{user},error:authError}=await client.auth.getUser();if(authError||!user)throw new Error('authenticated-user-required')
 const {data,error}=await client.from('passport_accessibility_preferences').select('*').eq('user_id',user.id).maybeSingle();if(error)throw error
 if(!data)return cache.get(user.id)
 const p=prefs(data);savePassportAccess(user.id,p);return p
}
export async function deletePassportAccessDurable(client:SupabaseClient){
 const {data:{user},error:authError}=await client.auth.getUser();if(authError||!user)throw new Error('authenticated-user-required')
 const {error}=await client.from('passport_accessibility_preferences').delete().eq('user_id',user.id);if(error)throw error
 cache.delete(user.id);return true
}
