import {requireUser,securityReady,randomChallenge,saveChallenge,consumeChallenge,activePasskeys,verifyClientData,verifyAuthenticatorData,verifyAssertion,issueStepUp,expectedRp,audit,recentlyAuthenticated,consumeStepUp} from '../_lib/security.js';
import {adminRest,json} from '../_lib/supabase-admin.js';

export default async function handler(req,res){
  if(!securityReady())return json(res,503,{error:'Security vault unavailable'});
  const user=await requireUser(req,res);if(!user)return;
  try{
    if(req.method==='GET'){
      const rows=await activePasskeys(user.id);return json(res,200,{rp:expectedRp(),passkeys:rows.map(p=>({id:p.credential_id,label:p.label,createdAt:p.created_at,lastUsedAt:p.last_used_at,backedUp:p.backed_up,deviceType:p.device_type}))});
    }
    if(req.method!=='POST')return json(res,405,{error:'Method not allowed'});
    const op=String(req.body?.op||'');
    if(op==='register-options'){
      const keys=await activePasskeys(user.id);
      if(keys.length){
        const token=String(req.headers['x-step-up-token']||req.body?.stepUpToken||'');
        const approved=await consumeStepUp(user.id,token,'add-passkey');
        if(!approved)return json(res,403,{error:'Existing passkey verification required before adding another passkey',code:'PASSKEY_STEP_UP_REQUIRED'});
      }else if(!recentlyAuthenticated(user,600)){
        return json(res,403,{error:'Please sign in again before enrolling your first passkey',code:'RECENT_AUTH_REQUIRED'});
      }
      const challenge=randomChallenge();await saveChallenge(user.id,'registration',challenge);return json(res,200,{challenge,rp:expectedRp(),user:{id:user.id,name:user.email||user.id,displayName:user.user_metadata?.full_name||user.email||'TRYAMM User'}});
    }
    if(op==='register-verify'){
      const row=await consumeChallenge(user.id,'registration');if(!row)return json(res,400,{verified:false,error:'Challenge expired or used'});
      const r=req.body?.response||{};const client=verifyClientData(r.clientDataJSON,row.challenge,'webauthn.create');if(!client.ok)return json(res,400,{verified:false,error:client.reason});
      const auth=verifyAuthenticatorData(r.authenticatorData);if(!auth.ok)return json(res,400,{verified:false,error:auth.reason});
      if(!r.credentialId||!r.publicKey)return json(res,400,{verified:false,error:'Missing credential material'});
      await adminRest('security_passkeys',{method:'POST',body:{credential_id:r.credentialId,user_id:user.id,webauthn_user_id:user.id,public_key_b64:r.publicKey,counter:auth.counter,transports:r.transports||[],device_type:r.deviceType||null,backed_up:Boolean(r.backedUp),label:String(req.body?.label||'Passkey').slice(0,120)}});
      const existing=await adminRest('security_mfa_profiles',{query:{user_id:`eq.${user.id}`,limit:1}});const methods=[...new Set([...(existing?.[0]?.methods||[]),'passkey'])];
      if(existing?.[0]) await adminRest('security_mfa_profiles',{method:'PATCH',query:{user_id:`eq.${user.id}`},body:{enabled:true,methods,updated_at:new Date().toISOString()}}); else await adminRest('security_mfa_profiles',{method:'POST',body:{user_id:user.id,enabled:true,methods}});
      await audit(user.id,'passkey.registered');return json(res,200,{verified:true});
    }
    if(op==='auth-options'){
      const action=String(req.body?.action||'').slice(0,120);if(!action)return json(res,400,{error:'action required'});const keys=await activePasskeys(user.id);if(!keys.length)return json(res,409,{error:'No passkeys enrolled'});const challenge=randomChallenge();await saveChallenge(user.id,'step-up',challenge,action);return json(res,200,{challenge,action,rp:expectedRp(),allowCredentials:keys.map(k=>({id:k.credential_id,transports:k.transports||[]}))});
    }
    if(op==='auth-verify'){
      const action=String(req.body?.action||'').slice(0,120),r=req.body?.response||{};const row=await consumeChallenge(user.id,'step-up');if(!row)return json(res,400,{verified:false,error:'Challenge expired or used'});const prefix=`${action}:`;if(!row.challenge.startsWith(prefix))return json(res,400,{verified:false,error:'Challenge scope mismatch'});const expected=row.challenge.slice(prefix.length);const keys=await activePasskeys(user.id);const key=keys.find(k=>k.credential_id===r.credentialId);if(!key)return json(res,404,{verified:false,error:'Passkey not found'});const check=verifyAssertion({authenticatorData:r.authenticatorData,clientDataJSON:r.clientDataJSON,signature:r.signature,publicKeyB64:key.public_key_b64,expectedChallenge:expected});if(!check.ok)return json(res,401,{verified:false,error:check.reason});if(Number(key.counter)>0&&check.counter<=Number(key.counter))return json(res,401,{verified:false,error:'Authenticator counter replay detected'});await adminRest('security_passkeys',{method:'PATCH',query:{credential_id:`eq.${key.credential_id}`},body:{counter:check.counter,last_used_at:new Date().toISOString()}});const issued=issueStepUp();await adminRest('security_stepup_challenges',{method:'POST',body:{id:`sup_${Date.now()}_${Math.random().toString(36).slice(2)}`,token_hash:issued.hash,user_id:user.id,session_id:'supabase',action,method:'passkey',expires_at:issued.expiresAt}});await audit(user.id,'passkey.step_up','info',{action});return json(res,200,{verified:true,stepUpToken:issued.token,expiresAt:issued.expiresAt});
    }
    if(op==='revoke'){
      const token=String(req.headers['x-step-up-token']||req.body?.stepUpToken||'');
      const approved=await consumeStepUp(user.id,token,'remove-passkey');
      if(!approved)return json(res,403,{error:'Passkey verification required before revocation',code:'PASSKEY_STEP_UP_REQUIRED'});
      const id=String(req.body?.credentialId||'');await adminRest('security_passkeys',{method:'PATCH',query:{credential_id:`eq.${id}`,user_id:`eq.${user.id}`},body:{revoked_at:new Date().toISOString()}});await audit(user.id,'passkey.revoked','warning',{credentialId:id});return json(res,200,{ok:true});
    }
    return json(res,400,{error:'Unknown operation'});
  }catch(e){return json(res,500,{error:'Security operation failed',detail:String(e?.message||e)});}
}
