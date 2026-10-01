import {json} from '../_lib/supabase-admin.js';
import {requireUser} from '../_lib/security.js';
import {listMeshyTasks,summarizeMeshyTask} from '../_lib/meshy.js';

const TYPES=['image-to-3d','multi-image-to-3d'];

export default async function handler(req,res){
  if(req.method!=='GET'){
    res.setHeader('Allow','GET');
    return json(res,405,{error:'method_not_allowed'});
  }
  try{
    const user=await requireUser(req,res);if(!user)return;
    const requested=String(req.query?.type||'all');
    const types=requested==='all'?TYPES:TYPES.includes(requested)?[requested]:null;
    if(!types)return json(res,400,{error:'unsupported_meshy_type'});
    const pageSize=Math.max(1,Math.min(50,Number(req.query?.page_size)||20));
    const groups=await Promise.all(types.map(async type=>({
      type,
      tasks:(await listMeshyTasks(type,pageSize)).map(task=>summarizeMeshyTask(task,type))
    })));
    const tasks=groups.flatMap(group=>group.tasks)
      .filter(task=>task.id)
      .sort((a,b)=>Number(new Date(b.createdAt||0))-Number(new Date(a.createdAt||0)));
    return json(res,200,{
      ok:true,
      schema:'tryamm.meshy-tasks.v1',
      ownerId:user.id,
      provider:'meshy.ai',
      count:tasks.length,
      tasks
    });
  }catch(error){
    return json(res,error.status||500,{error:error.code||'meshy_tasks_failed',message:error.message,provider:error.provider||undefined});
  }
}
