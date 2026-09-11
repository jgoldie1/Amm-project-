import {requireUser} from '../_lib/security.js';
import {buildCycle} from '../_lib/recursive-improvement.js';

export default async function handler(req,res){
  if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'});
  const user=await requireUser(req,res);if(!user)return;
  const result=buildCycle(req.body||{});
  const status=result.status==='BLOCKED'?400:result.status==='HUMAN_APPROVAL_REQUIRED'?202:200;
  res.setHeader('Cache-Control','no-store');
  return res.status(status).json({...result,userId:user.id,time:new Date().toISOString()});
}
