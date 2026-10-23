import {normalizeCityBuild} from '../_lib/ai-cafe-city-plan.js';
import {adminRest,json} from '../_lib/supabase-admin.js';
import {requireUser} from '../_lib/security.js';
import {hasTemplateAuthority} from '../_lib/template-listing.js';
import {UUID,normalizeDraft,jobRpc,publicJob,executeOne} from '../_lib/ai-cafe-executor.js';
export function createJobsHandler({userFor=requireUser,allowed=hasTemplateAuthority,rest=adminRest,rpc=jobRpc,execute=executeOne}={}){
 return async function handler(req,res){
  res.setHeader('Cache-Control','no-store');
  if(!['GET','POST','PATCH'].includes(req.method)){res.setHeader('Allow','GET, POST, PATCH');return json(res,405,{error:'Method not allowed'})}
  try{
   const user=await userFor(req,res);if(!user)return;
   if(!allowed(user))return json(res,403,{error:'Execution pilot requires a studio owner account.'});
   if(req.method==='GET'){
    const id=req.query?.id;
    if(id&&!UUID.test(id))return json(res,400,{error:'Invalid job ID'});
    const rows=await rest('ai_cafe_jobs',{query:{user_id:`eq.${user.id}`,...(id?{id:`eq.${id}`} : {}),order:'created_at.desc',limit:20},signal:AbortSignal.timeout(10000)});
    return json(res,200,{jobs:rows.map(publicJob)});
   }
   const body=typeof req.body==='string'?JSON.parse(req.body):req.body;
   if(!body||Buffer.byteLength(JSON.stringify(body))>12000)return json(res,400,{error:'Invalid or oversized request'});
   if(req.method==='POST'){
    if(!UUID.test(body.requestKey||'')||!['website-draft','city-build-plan'].includes(body.kind))return json(res,400,{error:'Invalid request key or job kind'});
    const input=body.kind==='city-build-plan'?{...normalizeCityBuild(body.input),assets:body.input.assets||[]}:normalizeDraft(body.input);
    const job=await rpc(body.kind==='city-build-plan'?'ai_cafe_submit_city':'ai_cafe_submit',{p_user:user.id,p_key:body.requestKey,p_input:input});
    return json(res,200,{job:publicJob(job)});
   }
   if(!UUID.test(body.id||''))return json(res,400,{error:'Invalid job ID'});
   return json(res,200,await execute({userId:user.id,jobId:body.id,rpc}));
  }catch(error){
   if(error.message==='invalid_input'||error instanceof SyntaxError)return json(res,400,{error:'Add a business name, headline and description within the form limits.'});
   if(error.message==='idempotency_conflict')return json(res,409,{error:'This request key belongs to another draft.'});
   if(error.message==='job_quota_exceeded')return json(res,429,{error:'Pilot limit reached. Try again after the rolling 24-hour window.'});
   return json(res,503,{error:'Execution service unavailable. Your saved job can be checked or retried later.'});
  }
 };
}
export default createJobsHandler();
