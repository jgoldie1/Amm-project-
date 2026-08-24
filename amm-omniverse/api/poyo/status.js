import {json} from '../_lib/supabase-admin.js';
import {requireUser} from '../_lib/security.js';

export default async function handler(req,res){
  if(req.method!=='GET')return json(res,405,{error:'method_not_allowed'});
  try{
    const user=await requireUser(req,res);if(!user)return;
    const key=String(process.env.POYO_API_KEY||'').trim();
    if(!key)return json(res,503,{error:'poyo_provider_not_configured'});
    const taskId=String(req.query?.taskId||'').trim();
    if(!/^[-_a-zA-Z0-9]{8,180}$/.test(taskId))return json(res,400,{error:'invalid_task_id'});
    const response=await fetch(`https://api.poyo.ai/api/generate/status/${encodeURIComponent(taskId)}`,{headers:{Authorization:`Bearer ${key}`}});
    const data=await response.json().catch(()=>({}));
    if(!response.ok||Number(data?.code||200)>=400)return json(res,response.status||502,{error:'poyo_status_failed',providerStatus:response.status,provider:data});
    return json(res,200,{ok:true,schema:'tryamm.poyo-status.v1',ownerId:user.id,provider:'poyo.ai',task:data?.data||data});
  }catch(error){return json(res,error.status||500,{error:error.message||'poyo_status_failed'});}
}
