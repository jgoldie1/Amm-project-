import { adminRest, json } from '../_lib/supabase-admin.js';
import { requireUser, consumeStepUp, audit } from '../_lib/security.js';

export default async function handler(req,res){
  if(req.method!=='POST') return json(res,405,{error:'Method not allowed'});
  const user=await requireUser(req,res); if(!user) return;
  const body=req.body||{};
  const {referenceType,referenceId,currency='USD',entries,approvalId,stepUpToken,metadata={}}=body;
  if(!referenceType||!referenceId||!Array.isArray(entries)||entries.length<2) return json(res,400,{error:'referenceType, referenceId and balanced entries are required'});

  if(!approvalId) return json(res,400,{error:'approvalId required'});
  const approvals=await adminRest('agent_approval_requests',{query:{id:`eq.${approvalId}`,account_id:`eq.${user.id}`,status:'eq.approved',limit:1}});
  const approval=approvals?.[0];
  if(!approval) return json(res,403,{error:'Approved request not found'});
  const step=await consumeStepUp(user.id,stepUpToken,'money_engine_post');
  if(!step) return json(res,403,{error:'Recent step-up approval required'});

  try{
    const result=await adminRest('rpc/money_engine_post',{method:'POST',body:{
      p_account_id:user.id,
      p_reference_type:String(referenceType),
      p_reference_id:String(referenceId),
      p_currency:String(currency).toUpperCase(),
      p_entries:entries,
      p_metadata:{...metadata,approval_id:approvalId}
    }});
    const postingId=Array.isArray(result)?result[0]:result;
    await adminRest('agent_approval_requests',{method:'PATCH',query:{id:`eq.${approvalId}`,status:'eq.approved'},body:{status:'executed',executed_at:new Date().toISOString(),execution_result:{posting_id:postingId}}});
    await audit(user.id,'money_engine_post','info',{postingId,referenceType,referenceId,approvalId});
    return json(res,200,{ok:true,postingId});
  }catch(error){
    await audit(user.id,'money_engine_post_failed','high',{referenceType,referenceId,approvalId,error:String(error?.message||error)});
    return json(res,400,{error:String(error?.message||'Posting failed')});
  }
}
