import crypto from 'node:crypto'
import {adminRpc,json} from '../../_lib/supabase-admin.js'

function internalAuthorized(req){
 const expected=String(process.env.TRYAMM_CREDIT_RECONCILIATION_SECRET||process.env.TRYAMM_INTERNAL_COMPLIANCE_SECRET||'')
 const supplied=String(req.headers['x-tryamm-credit-secret']||req.headers['x-tryamm-compliance-secret']||'')
 if(!expected||!supplied)return false
 const a=Buffer.from(expected),b=Buffer.from(supplied)
 return a.length===b.length&&crypto.timingSafeEqual(a,b)
}

export default async function handler(req,res){
 if(req.method!=='POST')return json(res,405,{error:'Method not allowed'})
 if(!internalAuthorized(req))return json(res,403,{error:'Internal reconciliation authorization required'})
 const entitlementId=String(req.body?.entitlementId||'').trim()
 const verifiedNetMinor=Math.floor(Number(req.body?.verifiedNetMinor))
 const reference=String(req.body?.reference||'').trim().slice(0,240)
 if(!/^[0-9a-f-]{36}$/i.test(entitlementId)||!Number.isFinite(verifiedNetMinor)||verifiedNetMinor<0||!reference){
  return json(res,400,{error:'Valid entitlementId, verifiedNetMinor, and reference are required'})
 }
 try{
  const result=await adminRpc('verify_tryamm_play_credit_funding_lot',{p_entitlement_id:entitlementId,p_verified_net_minor:verifiedNetMinor,p_reference:reference})
  return json(res,200,{ok:true,result})
 }catch(error){
  return json(res,500,{error:String(error?.message||'Unable to reconcile Play Credit funding')})
 }
}
