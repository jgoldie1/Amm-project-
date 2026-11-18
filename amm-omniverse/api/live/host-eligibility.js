import {requireUser} from '../_lib/security.js';
import {liveHostDecision} from '../_lib/live-host-authorization.js';

export default async function handler(req,res){
  res.setHeader('Cache-Control','no-store');
  if(req.method!=='GET')return res.status(405).json({error:'Method not allowed'});
  const user=await requireUser(req,res);
  if(!user)return;
  const decision=liveHostDecision(user);
  return res.status(200).json({canHost:decision.allowed,reason:decision.reason,verification:'server-admin-reviewed',viewerAllowed:true});
}
