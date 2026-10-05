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
 if(!internalAuthorized(req))return json(res,403,{error:'Internal payout-release authorization required'})
 const purchaseId=String(req.body?.purchaseId||'').trim()
 const creatorPayoutEligible=req.body?.creatorPayoutEligible===true
 const riskClear=req.body?.riskClear===true
 const reference=String(req.body?.reference||'').trim().slice(0,240)
 if(!/^[0-9a-f-]{36}$/i.test(purchaseId)||!reference)return json(res,400,{error:'Valid purchaseId and reference are required'})
 try{
  const result=await adminRpc('release_tryamm_creator_credit_payout',{p_purchase_id:purchaseId,p_creator_payout_eligible:creatorPayoutEligible,p_risk_clear:riskClear,p_reference:reference})
  return json(res,200,{ok:true,result})
 }catch(error){
  return json(res,500,{error:String(error?.message||'Unable to release creator credit payout')})
 }
}
