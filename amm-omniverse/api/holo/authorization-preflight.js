/** Read-only server-side HoloService authorization preflight.
 * A successful preflight is NOT a permit to dispatch, charge or run an ad.
 * Real mutation endpoints must independently fetch trusted records and enforce
 * the same requirements, with atomic idempotency and provider callbacks.
 */
import {adminReady,adminRest,json} from '../_lib/supabase-admin.js'

const ACTION_SERVICE=Object.freeze({
 'dispatch-ride':'rideshare','dispatch-delivery':'delivery',
 'dispatch-freight':'freight','dispatch-drone':'drone',
 'advertisement':'advertising','charge-payment':'payments',
 'issue-refund':'payments','publish-farm':'farm-discovery',
 'publish-provider':'provider'
})
const SUPPORTED=new Set(Object.keys(ACTION_SERVICE))
function text(v,n=160){return typeof v==='string'?v.trim().slice(0,n):''}
function bearer(req){const header=req.headers?.authorization||'';return typeof header==='string'&&/^Bearer [A-Za-z0-9._-]+$/.test(header)?header.slice(7):''}
async function authenticatedUser(token){
 const base=process.env.VITE_SUPABASE_URL||process.env.SUPABASE_URL||process.env.NEXT_PUBLIC_SUPABASE_URL||''
 const publishable=process.env.SUPABASE_ANON_KEY||process.env.VITE_SUPABASE_ANON_KEY||process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY||''
 if(!base||!publishable)return null
 const response=await fetch(base.replace(/\/$/,'')+'/auth/v1/user',{
  headers:{Authorization:'Bearer '+token,apikey:publishable},signal:AbortSignal.timeout(4000)
 })
 if(!response.ok)return null
 const u=await response.json()
 return typeof u.id==='string'&&u.id.length>0?u.id:null
}
export default async function handler(req,res){
 if(req.method!=='POST')return json(res,405,{error:'method_not_allowed'})
 const action=text(req.body?.action,40),passportId=text(req.body?.passportId,80),region=text(req.body?.region,80)
 if(!SUPPORTED.has(action)||!/^([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i.test(passportId)||!region||!(/^[A-Za-z0-9 .,'()\-]+$/.test(region)))return json(res,400,{error:'invalid_preflight_request'})
 const token=bearer(req)
 if(!token)return json(res,401,{error:'authentication_required'})
 let userId
 try{userId=await authenticatedUser(token)}catch{return json(res,503,{error:'authentication_unavailable'})}
 if(!userId)return json(res,401,{error:'authentication_required'})
 if(!adminReady())return json(res,503,{ready:false,error:'authorization_store_unavailable'})
 // Read from a server-owned registry only. Never accept a passport, covenant,
 // credentials, role or approval flag supplied by the browser.
 try{
  const rows=await adminRest('holo_service_passport_authorizations',{
   query:{select:'id,owner_user_id,status,approved_region,approved_service,authorization_expires_at,revoked_at',id:'eq.'+passportId,owner_user_id:'eq.'+userId,limit:'1'}
  })
  const row=Array.isArray(rows)?rows[0]:null
  const scoped=!!row&&row.status==='approved'&&row.approved_region===region&&row.approved_service===ACTION_SERVICE[action]&&!row.revoked_at&&
   !!row.authorization_expires_at&&Number.isFinite(Date.parse(row.authorization_expires_at))&&Date.parse(row.authorization_expires_at)>Date.now()
  // Even a correctly scoped passport never proves provider permission,
  // human signoff, ledger settlement, insurance or flight authorization.
  // This preflight endpoint intentionally cannot return ready:true.
  return json(res,200,{ready:false,passportScoped:scoped,next:'server_verified_provider_and_covenant_evidence_required',
   action,dispatchAuthorized:false,paymentAuthorized:false})
 }catch{
  return json(res,503,{ready:false,error:'authorization_registry_unavailable'})
 }
}
