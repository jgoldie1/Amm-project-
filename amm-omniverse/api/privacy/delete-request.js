import {requireUser,audit} from '../_lib/security.js';
import {adminRest,adminReady} from '../_lib/supabase-admin.js';

const CONFIRM='DELETE MY TRYAMM ACCOUNT';

async function latestOpen(userId){
  const rows=await adminRest('account_deletion_requests',{query:{user_id:`eq.${userId}`,status:'in.(requested,in_review)',order:'requested_at.desc',limit:1}});
  return rows?.[0]||null;
}

export default async function handler(req,res){
  res.setHeader('Cache-Control','no-store');
  if(!['GET','POST'].includes(req.method))return res.status(405).json({error:'Method not allowed'});
  if(!adminReady())return res.status(503).json({error:'Account deletion service is not configured'});

  const user=await requireUser(req,res);
  if(!user)return;

  if(req.method==='GET'){
    try{
      const request=await latestOpen(user.id);
      return res.status(200).json({request:request?{id:request.id,status:request.status,requestedAt:request.requested_at}:null});
    }catch(error){
      return res.status(500).json({error:'Could not load account deletion status'});
    }
  }

  const body=typeof req.body==='string'?JSON.parse(req.body||'{}'):req.body||{};
  if(String(body.confirm||'')!==CONFIRM){
    return res.status(400).json({error:`Type "${CONFIRM}" to confirm the deletion request`});
  }

  try{
    const existing=await latestOpen(user.id);
    if(existing)return res.status(200).json({request:{id:existing.id,status:existing.status,requestedAt:existing.requested_at},existing:true});

    const rows=await adminRest('account_deletion_requests',{method:'POST',body:{
      user_id:user.id,
      status:'requested',
      source:String(body.source||'web-or-app').slice(0,80),
      requested_at:new Date().toISOString(),
      updated_at:new Date().toISOString()
    }});
    const request=rows?.[0];
    await audit(user.id,'account_deletion_requested','important',{requestId:request?.id||null,source:String(body.source||'web-or-app').slice(0,80)});
    return res.status(201).json({request:{id:request?.id,status:request?.status||'requested',requestedAt:request?.requested_at||new Date().toISOString()},message:'Account deletion request received'});
  }catch(error){
    return res.status(500).json({error:'Could not create account deletion request'});
  }
}
