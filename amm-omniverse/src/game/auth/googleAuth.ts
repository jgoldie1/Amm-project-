// Supabase authentication for Google, Apple, email/password, phone OTP, and local guest access.
import { getSupabaseClient, isSupabaseConfigured } from '../../services/supabaseClient'

export type AuthProvider = 'google' | 'apple' | 'email' | 'phone' | 'mock'
export interface AuthUser { id:string; name:string; email:string; phone:string; avatar_url:string|null; provider:AuthProvider }
const redirect=()=>`${window.location.origin}/auth/callback`
const normalizePhone=(v:string)=>v.replace(/[\s().-]/g,'')

async function signInWithProvider(provider:'google'|'apple') {
 const sb=getSupabaseClient(); if(!sb)return {user:null,error:'Secure sign-in is not configured yet.'}
 const {error}=await sb.auth.signInWithOAuth({provider,options:{redirectTo:redirect(),...(provider==='google'?{queryParams:{access_type:'offline',prompt:'consent'}}:{})}})
 return {user:null,error:error?.message??null}
}
export const signInWithGoogle=()=>signInWithProvider('google')
export const signInWithApple=()=>signInWithProvider('apple')

export async function signUpWithEmail(email:string,password:string,name:string){
 const sb=getSupabaseClient(); if(!sb)return {user:null,error:'Email sign-up is not configured yet.'}
 const {data,error}=await sb.auth.signUp({email:email.trim(),password,options:{data:{full_name:name.trim()||email.split('@')[0]}}})
 return {user:data.user?toAuthUser(data.user):null,error:error?.message??null}
}
export async function signInWithEmail(email:string,password:string){
 const sb=getSupabaseClient(); if(!sb)return {user:null,error:'Email sign-in is not configured yet.'}
 const {data,error}=await sb.auth.signInWithPassword({email:email.trim(),password})
 return {user:data.user?toAuthUser(data.user):null,error:error?.message??null}
}
export async function sendEmailMagicLink(email:string){
 const sb=getSupabaseClient(); if(!sb)return {error:'Email sign-in is not configured yet.'}
 const {error}=await sb.auth.signInWithOtp({email:email.trim(),options:{emailRedirectTo:redirect()}})
 return {error:error?.message??null}
}
export async function sendPhoneOtp(phone:string){
 const sb=getSupabaseClient(); if(!sb)return {error:'Phone sign-in is not configured yet.'}
 const value=normalizePhone(phone); if(!/^\+[1-9]\d{7,14}$/.test(value))return {error:'Use a full phone number with country code, for example +13125551212.'}
 const {error}=await sb.auth.signInWithOtp({phone:value})
 return {error:error?.message??null}
}
export async function verifyPhoneOtp(phone:string,token:string){
 const sb=getSupabaseClient(); if(!sb)return {user:null,error:'Phone sign-in is not configured yet.'}
 const {data,error}=await sb.auth.verifyOtp({phone:normalizePhone(phone),token:token.trim(),type:'sms'})
 return {user:data.user?toAuthUser(data.user):null,error:error?.message??null}
}
function toAuthUser(u:any):AuthUser{
 const raw=(u.app_metadata?.provider||'email') as string
 const provider:AuthProvider=raw==='phone'?'phone':raw==='google'?'google':raw==='apple'?'apple':'email'
 return {id:u.id,name:u.user_metadata?.full_name||u.user_metadata?.name||u.email?.split('@')[0]||u.phone||'Creator',email:u.email||'',phone:u.phone||'',avatar_url:u.user_metadata?.avatar_url||u.user_metadata?.picture||null,provider}
}
export async function getSessionUser():Promise<AuthUser|null>{
 const sb=getSupabaseClient()
 if(!sb){const stored=sessionStorage.getItem('amm_mock_user');return stored?JSON.parse(stored):null}
 const {data}=await sb.auth.getSession();return data.session?.user?toAuthUser(data.session.user):null
}
export async function signOut(){sessionStorage.removeItem('amm_mock_user');const sb=getSupabaseClient();if(sb)await sb.auth.signOut()}
export function continueAsGuest(name='Creator'):AuthUser{
 const safe=name.trim()||'Creator';const user:AuthUser={id:'guest-'+crypto.randomUUID(),name:safe,email:'',phone:'',avatar_url:null,provider:'mock'}
 sessionStorage.setItem('amm_mock_user',JSON.stringify(user));return user
}
export { isSupabaseConfigured }
