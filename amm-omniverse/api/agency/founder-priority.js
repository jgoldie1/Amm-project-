import crypto from 'node:crypto';
import {requireUser,recentlyAuthenticated,audit} from '../_lib/security.js';
import {adminRest,adminReady} from '../_lib/supabase-admin.js';

const founderId=()=>String(process.env.TRYAMM_FOUNDER_USER_ID||'').trim();
const clean=(v,max=120)=>String(v||'').trim().slice(0,max);
const hash=v=>crypto.createHash('sha256').update(String(v).toUpperCase().trim()).digest('hex');
const makeCode=()=>`TRYAMM-VIP-${crypto.randomBytes(9).toString('base64url').toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,12)}`;

export default async function handler(req,res){
  res.setHeader('Cache-Control','no-store');
  if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'});
  const user=await requireUser(req,res);if(!user)return;
  if(!adminReady())return res.status(503).json({error:'Admin database access is not configured'});
  if(!founderId())return res.status(503).json({error:'Founder identity gate is not configured'});
  if(user.id!==founderId())return res.status(403).json({error:'Founder authorization required'});
  if(!recentlyAuthenticated(user,900))return res.status(403).json({error:'Recent sign-in required to issue priority invites'});
  const code=makeCode();
  const maxUses=Math.max(1,Math.min(25,Number(req.body?.maxUses)||1));
  const days=Math.max(1,Math.min(90,Number(req.body?.expiresDays)||14));
  const expiresAt=new Date(Date.now()+days*86400000).toISOString();
  const rows=await adminRest('tryamm_founder_priority_invites',{method:'POST',body:{code_hash:hash(code),label:clean(req.body?.label,80)||'Founder Priority Agency Invite',note:clean(req.body?.note,240)||null,max_uses:maxUses,uses:0,expires_at:expiresAt,active:true,created_by:user.id}});
  await audit(user.id,'founder_priority_invite_issued','info',{invite_id:rows?.[0]?.id||null,max_uses:maxUses,expires_at:expiresAt});
  return res.status(201).json({code,label:rows?.[0]?.label||'Founder Priority Agency Invite',maxUses,expiresAt,warning:'Share this code only with the intended recipient. It skips the normal agency waitlist, not mandatory identity, age, tax, payment, telecom, security or legal checks.'});
}
