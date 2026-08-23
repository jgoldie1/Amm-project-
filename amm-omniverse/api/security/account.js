import {requireUser,consumeStepUp,audit} from '../_lib/security.js';
import {adminRest,adminReady,json} from '../_lib/supabase-admin.js';

const COOLING_MS=Math.max(60*60*1000,Number(process.env.PAYOUT_CHANGE_COOLING_MS)||24*60*60*1000);
const now=()=>new Date().toISOString();

async function state(userId){
  const rows=await adminRest('security_account_state',{query:{user_id:`eq.${userId}`,limit:1}});
  return rows?.[0]||null;
}
async function upsertState(userId,patch){
  const existing=await state(userId);
  if(existing){await adminRest('security_account_state',{method:'PATCH',query:{user_id:`eq.${userId}`},body:{...patch,updated_at:now()}});}
  else{await adminRest('security_account_state',{method:'POST',body:{user_id:userId,...patch,updated_at:now()}});}
  return await state(userId);
}

export default async function handler(req,res){
  if(!adminReady())return json(res,503,{error:'Security vault unavailable'});
  const user=await requireUser(req,res);if(!user)return;
  try{
    if(req.method==='GET'){
      const s=await state(user.id)||{};
      return json(res,200,{locked:Boolean(s.locked),payoutFrozen:Boolean(s.payout_frozen),apiKeysFrozen:Boolean(s.api_keys_frozen),recoveryRequired:Boolean(s.recovery_required),payoutChangePendingUntil:s.payout_change_pending_until||null});
    }
    if(req.method!=='POST')return json(res,405,{error:'Method not allowed'});
    const op=String(req.body?.op||'');
    if(op==='lockdown'){
      const s=await upsertState(user.id,{locked:true,locked_at:now(),locked_reason:String(req.body?.reason||'user_emergency_lockdown').slice(0,500),payout_frozen:true,api_keys_frozen:true,recovery_required:true});
      await audit(user.id,'account.lockdown','critical',{reason:s.locked_reason});
      return json(res,200,{ok:true,locked:true,payoutFrozen:true,apiKeysFrozen:true,recoveryRequired:true});
    }
    if(op==='payout-change-request'){
      const token=String(req.headers['x-step-up-token']||req.body?.stepUpToken||'');
      const approved=await consumeStepUp(user.id,token,'change-payout-destination');
      if(!approved)return json(res,403,{error:'Valid step-up authentication required',code:'STEP_UP_REQUIRED'});
      const pendingUntil=new Date(Date.now()+COOLING_MS).toISOString();
      await upsertState(user.id,{payout_frozen:true,payout_change_pending_until:pendingUntil});
      await audit(user.id,'payout.change_requested','high',{pendingUntil,method:approved.method});
      return json(res,202,{pending:true,payoutFrozen:true,pendingUntil,notificationRequired:true});
    }
    if(op==='payout-change-cancel'){
      await upsertState(user.id,{payout_frozen:false,payout_change_pending_until:null,payout_change_destination_hash:null});
      await audit(user.id,'payout.change_cancelled','warning');
      return json(res,200,{ok:true,cancelled:true});
    }
    return json(res,400,{error:'Unknown operation'});
  }catch(e){return json(res,500,{error:'Security operation failed',detail:String(e?.message||e)});}
}
