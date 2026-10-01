import {json} from '../_lib/supabase-admin.js';
import {requireUser} from '../_lib/security.js';
import {createMeshyRiggingTask} from '../_lib/meshy.js';

export default async function handler(req,res){
  if(req.method!=='POST'){
    res.setHeader('Allow','POST');
    return json(res,405,{error:'method_not_allowed'});
  }
  try{
    const user=await requireUser(req,res);if(!user)return;
    const body=req.body&&typeof req.body==='object'?req.body:{};
    const task=await createMeshyRiggingTask({
      inputTaskId:body.input_task_id,
      modelUrl:body.model_url,
      heightMeters:body.height_meters,
    });
    return json(res,202,{
      ok:true,
      schema:'tryamm.meshy-rig.v1',
      ownerId:user.id,
      provider:'meshy.ai',
      task,
      pollUrl:`/api/meshy/rig-task?id=${encodeURIComponent(task.id)}`,
      keyExposed:false
    });
  }catch(error){
    return json(res,error.status||500,{error:error.code||'meshy_rig_failed',message:error.message,provider:error.provider||undefined});
  }
}
