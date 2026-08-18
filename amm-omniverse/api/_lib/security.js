import crypto from 'node:crypto';
import {adminRest,adminReady} from './supabase-admin.js';

const SUPABASE_URL=()=>process.env.VITE_SUPABASE_URL||process.env.NEXT_PUBLIC_SUPABASE_URL||process.env.SUPABASE_URL||'';
const enc=v=>encodeURIComponent(String(v??''));
const b64u=b=>Buffer.from(b).toString('base64url');
const fromB64u=s=>Buffer.from(String(s||''),'base64url');
const nowIso=()=>new Date().toISOString();
const rp=()=>({origin:(process.env.WEBAUTHN_ORIGIN||'https://tryamm.online').replace(/\/$/,''),rpID:process.env.WEBAUTHN_RP_ID||'tryamm.online'});

export async function requireUser(req,res){
  const auth=String(req.headers.authorization||'');
  if(!auth.startsWith('Bearer ')) {res.status(401).json({error:'Authentication required'});return null;}
  const token=auth.slice(7).trim();
  if(!token||!SUPABASE_URL()) {res.status(503).json({error:'Authentication service unavailable'});return null;}
  const r=await fetch(`${SUPABASE_URL().replace(/\/$/,'')}/auth/v1/user`,{headers:{apikey:process.env.VITE_SUPABASE_ANON_KEY||process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY||'',authorization:`Bearer ${token}`}});
  if(!r.ok){res.status(401).json({error:'Invalid or expired session'});return null;}
  return await r.json();
}

export function securityReady(){return adminReady()}
export function randomChallenge(){return crypto.randomBytes(32).toString('base64url')}
export function hashToken(v){const pepper=process.env.STEP_UP_TOKEN_PEPPER||process.env.SESSION_TOKEN_PEPPER||'';if(!pepper)throw new Error('step_up_pepper_missing');return crypto.createHmac('sha256',pepper).update(String(v)).digest('hex')}
export function issueStepUp(){const token=crypto.randomBytes(32).toString('base64url');return {token,hash:hashToken(token),expiresAt:new Date(Date.now()+10*60*1000).toISOString()}}
export function expectedRp(){return rp()}

export async function saveChallenge(userId,purpose,challenge,action=''){
  await adminRest('security_webauthn_challenges',{method:'POST',body:{user_id:userId,session_id:'supabase',purpose,challenge:action?`${action}:${challenge}`:challenge,expires_at:new Date(Date.now()+5*60*1000).toISOString()}})
}
export async function consumeChallenge(userId,purpose){
  const rows=await adminRest('security_webauthn_challenges',{query:{user_id:`eq.${userId}`,session_id:'eq.supabase',purpose:`eq.${purpose}`,used_at:'is.null',expires_at:`gt.${nowIso()}`,order:'created_at.desc',limit:1}});
  const row=rows?.[0];if(!row)return null;
  await adminRest('security_webauthn_challenges',{method:'PATCH',query:{id:`eq.${row.id}`,used_at:'is.null'},body:{used_at:nowIso()}});
  return row;
}
export async function activePasskeys(userId){return await adminRest('security_passkeys',{query:{user_id:`eq.${userId}`,revoked_at:'is.null',order:'created_at.asc'}})||[]}
export async function audit(userId,event_type,severity='info',metadata={}){try{await adminRest('security_audit_events',{method:'POST',body:{user_id:userId,actor_id:userId,event_type,severity,metadata}})}catch{}}

export function verifyClientData(clientDataB64,expectedChallenge,type){
  const {origin}=rp();let data;try{data=JSON.parse(fromB64u(clientDataB64).toString('utf8'))}catch{return {ok:false,reason:'bad_client_data'}}
  if(data.type!==type)return {ok:false,reason:'wrong_type'};
  if(data.challenge!==expectedChallenge)return {ok:false,reason:'challenge_mismatch'};
  if(data.origin!==origin)return {ok:false,reason:'origin_mismatch'};
  return {ok:true,data};
}
export function verifyAuthenticatorData(authDataB64){
  const buf=fromB64u(authDataB64);if(buf.length<37)return {ok:false,reason:'bad_authenticator_data'};
  const {rpID}=rp();const expected=crypto.createHash('sha256').update(rpID).digest();
  if(!crypto.timingSafeEqual(buf.subarray(0,32),expected))return {ok:false,reason:'rp_id_mismatch'};
  const flags=buf[32];if((flags&0x01)===0)return {ok:false,reason:'user_presence_required'};
  if((flags&0x04)===0)return {ok:false,reason:'user_verification_required'};
  return {ok:true,counter:buf.readUInt32BE(33),raw:buf};
}
export function verifyAssertion({authenticatorData,clientDataJSON,signature,publicKeyB64,expectedChallenge}){
  const client=verifyClientData(clientDataJSON,expectedChallenge,'webauthn.get');if(!client.ok)return client;
  const auth=verifyAuthenticatorData(authenticatorData);if(!auth.ok)return auth;
  const clientHash=crypto.createHash('sha256').update(fromB64u(clientDataJSON)).digest();
  const signed=Buffer.concat([auth.raw,clientHash]);
  try{const key=crypto.createPublicKey({key:fromB64u(publicKeyB64),format:'der',type:'spki'});const ok=crypto.verify(null,signed,key,fromB64u(signature));return ok?{ok:true,counter:auth.counter}:{ok:false,reason:'bad_signature'}}catch{return {ok:false,reason:'bad_public_key'}}
}
export async function consumeStepUp(userId,token,action){
  if(!token)return null;let h;try{h=hashToken(token)}catch{return null}
  const rows=await adminRest('security_stepup_challenges',{query:{token_hash:`eq.${h}`,user_id:`eq.${userId}`,session_id:'eq.supabase',action:`eq.${action}`,used_at:'is.null',expires_at:`gt.${nowIso()}`,limit:1}});const row=rows?.[0];if(!row)return null;
  await adminRest('security_stepup_challenges',{method:'PATCH',query:{id:`eq.${row.id}`,used_at:'is.null'},body:{used_at:nowIso()}});return row;
}
