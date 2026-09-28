import type {SupabaseClient} from '@supabase/supabase-js'
export type PassportAccessPrefs={languageTag:string;signLanguageTag?:string;oneHand?:'left'|'right';captions?:boolean;voice?:boolean;switchControl?:boolean;screenReader?:boolean;largeTargets?:boolean;reducedMotion?:boolean;highContrast?:boolean;plainLanguage?:boolean}
const cache=new Map<string,PassportAccessPrefs>()
const row=(p:PassportAccessPrefs)=>({language_tag:p.languageTag,sign_language_tag:p.signLanguageTag??null,one_hand:p.oneHand??null,captions:!!p.captions,voice:!!p.voice,switch_control:!!p.switchControl,screen_reader:!!p.screenReader,large_targets:!!p.largeTargets,reduced_motion:!!p.reducedMotion,high_contrast:!!p.highContrast,plain_language:!!p.plainLanguage,updated_at:new Date().toISOString()})
const prefs=(r:any):PassportAccessPrefs=>({languageTag:r.language_tag,signLanguageTag:r.sign_language_tag??undefined,oneHand:r.one_hand??undefined,captions:r.captions,voice:r.voice,switchControl:r.switch_control,screenReader:r.screen_reader,largeTargets:r.large_targets,reducedMotion:r.reduced_motion,highContrast:r.high_contrast,plainLanguage:r.plain_language})
export function savePassportAccess(passportId:string,p:PassportAccessPrefs){cache.set(passportId,{...p});return cache.get(passportId)!}
export function loadPassportAccess(passportId:string){return cache.get(passportId)}
export function clearPassportAccess(passportId:string){return cache.delete(passportId)}
export async function savePassportAccessDurable(client:SupabaseClient,p:PassportAccessPrefs){
 const {data:{user},error:authError}=await client.auth.getUser();if(authError||!user)throw new Error('authenticated-user-required')
 const {error}=await client.from('passport_accessibility_preferences').upsert({user_id:user.id,...row(p)},{onConflict:'user_id'});if(error)throw error
 cache.set(user.id,{...p});return p
}
export async function loadPassportAccessDurable(client:SupabaseClient){
 const {data:{user},error:authError}=await client.auth.getUser();if(authError||!user)throw new Error('authenticated-user-required')
 const {data,error}=await client.from('passport_accessibility_preferences').select('*').eq('user_id',user.id).maybeSingle();if(error)throw error
 if(!data)return cache.get(user.id)
 const p=prefs(data);cache.set(user.id,p);return p
}
export async function deletePassportAccessDurable(client:SupabaseClient){
 const {data:{user},error:authError}=await client.auth.getUser();if(authError||!user)throw new Error('authenticated-user-required')
 const {error}=await client.from('passport_accessibility_preferences').delete().eq('user_id',user.id);if(error)throw error
 cache.delete(user.id);return true
}
