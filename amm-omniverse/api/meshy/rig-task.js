import {json} from '../_lib/supabase-admin.js';
import {requireUser} from '../_lib/security.js';
import {getMeshyRiggingTask,summarizeMeshyRiggingTask} from '../_lib/meshy.js';

export default async function handler(req,res){
  if(req.method!=='GET'){
    res.setHeader('Allow','GET');
    return json(res,405,{error:'method_not_allowed'});
  }
  try{
    const user=await requireUser(req,res);if(!user)return;
    const id=String(req.query?.id||'');
    const raw=await getMeshyRiggingTask(id);
    return json(res,200,{ok:true,schema:'tryamm.meshy-rig-task.v1',ownerId:user.id,provider:'meshy.ai',task:summarizeMeshyRiggingTask(raw)});
  }catch(error){
    return json(res,error.status||500,{error:error.code||'meshy_rig_task_failed',message:error.message,provider:error.provider||undefined});
  }
}
