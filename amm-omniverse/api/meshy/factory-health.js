import {json,adminReady,adminRest} from '../_lib/supabase-admin.js';
import {requireUser} from '../_lib/security.js';
import {meshyKey} from '../_lib/meshy.js';
import {requireFactoryAuthority} from '../_lib/meshy-factory.js';

export default async function handler(req,res){
  if(req.method!=='GET'){
    res.setHeader('Allow','GET');
    return json(res,405,{error:'method_not_allowed'});
  }
  const user=await requireUser(req,res);if(!user)return;
  try{
    requireFactoryAuthority(user);
    let durableJobs=false,ready=0,active=0,recoveryRequired=0;
    if(adminReady()){
      const rows=await adminRest('meshy_asset_jobs',{query:{select:'id,stage',limit:200}});
      durableJobs=Array.isArray(rows);
      ready=(rows||[]).filter(row=>row.stage==='ready').length;
      active=(rows||[]).filter(row=>['generating','rigging','publishing'].includes(row.stage)).length;
      recoveryRequired=(rows||[]).filter(row=>['generation-submitting','rig-submitting'].includes(row.stage)).length;
    }
    return json(res,200,{
      ok:Boolean(meshyKey()&&adminReady()&&durableJobs),
      schema:'tryamm.meshy.factory-health.v1',
      providerConfigured:Boolean(meshyKey()),
      supabaseAdminConfigured:adminReady(),
      durableJobStoreReady:durableJobs,
      backgroundWorkerSecretConfigured:Boolean(process.env.MESHY_FACTORY_WORKER_SECRET||process.env.CRON_SECRET),
      readyAssets:ready,
      activeJobs:active,
      recoveryRequiredJobs:recoveryRequired,
      blockers:[
        ...(!meshyKey()?['MESHY_API_KEY missing']:[]),
        ...(!adminReady()?['Supabase admin credentials missing']:[]),
        ...(!durableJobs?['meshy_asset_jobs migration not applied']:[]),
        ...(!(process.env.MESHY_FACTORY_WORKER_SECRET||process.env.CRON_SECRET)?['background worker secret not configured; founder panel can still auto-advance while open']:[]),
        ...(recoveryRequired?[`${recoveryRequired} provider submission claim(s) require task-ID recovery before any resubmission`]:[]),
      ]
    });
  }catch(error){
    return json(res,error.status||500,{error:error.code||'meshy_factory_health_failed',message:error.message});
  }
}
