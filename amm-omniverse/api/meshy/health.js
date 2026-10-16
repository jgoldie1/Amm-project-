import {json,adminReady} from '../_lib/supabase-admin.js';
import {meshyKey} from '../_lib/meshy.js';

export default async function handler(req,res){
  if(req.method!=='GET'){
    res.setHeader('Allow','GET');
    return json(res,405,{error:'method_not_allowed'});
  }
  return json(res,200,{
    ok:true,
    provider:'meshy.ai',
    configured:Boolean(meshyKey()),
    authenticationConfigured:Boolean((process.env.VITE_SUPABASE_URL||process.env.SUPABASE_URL)&&(process.env.VITE_SUPABASE_ANON_KEY||process.env.SUPABASE_PUBLISHABLE_KEY)),
    durableStorageConfigured:adminReady(),
    backgroundWorkerConfigured:Boolean(process.env.MESHY_FACTORY_WORKER_SECRET||process.env.CRON_SECRET),
    keyExposed:false,
    schema:'tryamm.meshy-health.v1'
  });
}
