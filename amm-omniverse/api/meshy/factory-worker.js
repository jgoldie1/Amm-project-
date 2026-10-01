import {json,adminRest} from '../_lib/supabase-admin.js';
import {tickMeshyFactoryJobInternal} from '../_lib/meshy-factory.js';

function authorized(req){
  const expected=String(process.env.MESHY_FACTORY_WORKER_SECRET||process.env.CRON_SECRET||'').trim();
  const auth=String(req.headers.authorization||'');
  return Boolean(expected&&auth===`Bearer ${expected}`);
}

export default async function handler(req,res){
  if(!['GET','POST'].includes(req.method)){
    res.setHeader('Allow','GET, POST');
    return json(res,405,{error:'method_not_allowed'});
  }
  if(!authorized(req))return json(res,401,{error:'worker_authorization_required'});
  try{
    const jobs=await adminRest('meshy_asset_jobs',{query:{stage:'in.(generating,rigging,publishing)',order:'updated_at.asc',limit:6}})||[];
    const results=[];
    for(const job of jobs){
      const next=await tickMeshyFactoryJobInternal(job.id);
      results.push({id:next.id,assetId:next.asset_id,stage:next.stage,progress:next.progress,error:next.error_code||null});
    }
    return json(res,200,{ok:true,schema:'tryamm.meshy.factory-worker.v1',processed:results.length,results});
  }catch(error){
    return json(res,error.status||500,{error:error.code||'meshy_factory_worker_failed',message:error.message});
  }
}
