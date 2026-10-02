import {json} from '../_lib/supabase-admin.js';
import {requireUser} from '../_lib/security.js';
import {MESHY_FACTORY_CATALOG,startMeshyFactoryJob,startWorldForgerFactoryJob,startCircleParkBootstrapWave,listMeshyFactoryJobs,tickMeshyFactoryJob,importExistingMeshyTask} from '../_lib/meshy-factory.js';

export default async function handler(req,res){
  const user=await requireUser(req,res);if(!user)return;
  try{
    if(req.method==='GET'){
      const jobs=await listMeshyFactoryJobs(user,{limit:req.query?.limit});
      return json(res,200,{ok:true,schema:'tryamm.meshy.factory.v1',catalog:MESHY_FACTORY_CATALOG.map(({assetId,filename,generationType,height,ageLane,role})=>({assetId,filename,generationType,height,ageLane,role})),jobs});
    }
    if(req.method==='POST'){
      const body=req.body&&typeof req.body==='object'?req.body:{};
      const action=String(body.action||'start');
      if(action==='start'){
        const job=await startMeshyFactoryJob(user,{assetId:body.assetId,imageUrl:body.imageUrl,cityScope:body.cityScope});
        return json(res,202,{ok:true,schema:'tryamm.meshy.factory.v1',action:'start',job});
      }
      if(action==='start-circle-park-wave'){
        const wave=await startCircleParkBootstrapWave(user);
        return json(res,202,{ok:true,schema:'tryamm.meshy.factory.v1',action:'start-circle-park-wave',wave});
      }
      if(action==='start-world-forger'){
        const job=await startWorldForgerFactoryJob(user,body);
        return json(res,202,{ok:true,schema:'tryamm.meshy.factory.v1',action:'start-world-forger',job,creditsMayBeConsumed:true});
      }
      if(action==='import-existing'){
        const job=await importExistingMeshyTask(user,{
          assetId:body.assetId,
          taskId:body.taskId,
          type:body.type,
          cityScope:body.cityScope
        });
        return json(res,202,{ok:true,schema:'tryamm.meshy.factory.v1',action:'import-existing',job,reusedGenerationCredits:true});
      }
      if(action==='tick'){
        const job=await tickMeshyFactoryJob(user,String(body.jobId||''));
        return json(res,200,{ok:true,schema:'tryamm.meshy.factory.v1',action:'tick',job});
      }
      return json(res,400,{error:'unsupported_factory_action'});
    }
    res.setHeader('Allow','GET, POST');
    return json(res,405,{error:'method_not_allowed'});
  }catch(error){
    return json(res,error.status||500,{error:error.code||'meshy_factory_failed',message:error.message});
  }
}
