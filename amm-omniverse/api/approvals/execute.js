import { adminRest, json } from '../_lib/supabase-admin.js';
import { requireUser, consumeStepUp, audit } from '../_lib/security.js';

export default async function handler(req,res){
  if(req.method!=='POST') return json(res,405,{error:'Method not allowed'});
  const user=await requireUser(req,res); if(!user) return;
  const {approvalId,decision,stepUpToken}=req.body||{};
  if(!approvalId||!['approve','deny'].includes(decision)) return json(res,400,{error:'approvalId and approve/deny decision required'});

  const rows=await adminRest('agent_approval_requests',{query:{id:`eq.${approvalId}`,account_id:`eq.${user.id}`,status:'eq.pending',limit:1}});
  const approval=rows?.[0];
  if(!approval) return json(res,404,{error:'Pending approval not found'});
  if(approval.expires_at && new Date(approval.expires_at)<=new Date()){
    await adminRest('agent_approval_requests',{method:'PATCH',query:{id:`eq.${approvalId}`},body:{status:'expired'}});
    return json(res,410,{error:'Approval expired'});
  }

  if(['high','critical'].includes(approval.risk_level)){
    const step=await consumeStepUp(user.id,stepUpToken,'agent_approval');
    if(!step) return json(res,403,{error:'Step-up authentication required'});
  }

  const status=decision==='approve'?'approved':'denied';
  await adminRest('agent_approval_requests',{method:'PATCH',query:{id:`eq.${approvalId}`,status:'eq.pending'},body:{status,approved_by:user.id,approved_at:new Date().toISOString()}});
  await audit(user.id,`agent_approval_${status}`,'info',{approvalId,action:approval.action,riskLevel:approval.risk_level});
  return json(res,200,{ok:true,status,approvalId});
}
