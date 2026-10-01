import {json} from '../_lib/supabase-admin.js';
import {requireUser} from '../_lib/security.js';
import {createMeshyTask} from '../_lib/meshy.js';

const ALLOWED=['image-to-3d','multi-image-to-3d'];

export default async function handler(req,res){
  if(req.method!=='POST'){
    res.setHeader('Allow','POST');
    return json(res,405,{error:'method_not_allowed'});
  }
  try{
    const user=await requireUser(req,res);if(!user)return;
    const body=req.body&&typeof req.body==='object'?req.body:{};
    const type=String(body.type||'image-to-3d');
    if(!ALLOWED.includes(type))return json(res,400,{error:'unsupported_meshy_type'});

    const payload={
      ...(type==='image-to-3d'?{image_url:body.image_url}:{image_urls:body.image_urls}),
      ai_model:String(body.ai_model||'meshy-7.1'),
      should_texture:body.should_texture!==false,
      enable_pbr:body.enable_pbr!==false,
      should_remesh:body.should_remesh!==false,
      target_polycount:Math.max(8_000,Math.min(100_000,Number(body.target_polycount)||45_000)),
      pose_mode:['a-pose','t-pose'].includes(String(body.pose_mode||''))?String(body.pose_mode):'a-pose',
      geometry_resolution:type==='multi-image-to-3d'?'2k':(String(body.geometry_resolution||'2k')==='4k'?'4k':'2k'),
    };

    const task=await createMeshyTask(type,payload);
    return json(res,202,{
      ok:true,
      schema:'tryamm.meshy-generate.v1',
      ownerId:user.id,
      provider:'meshy.ai',
      task,
      pollUrl:`/api/meshy/task?type=${encodeURIComponent(type)}&id=${encodeURIComponent(task.id)}`,
      keyExposed:false
    });
  }catch(error){
    return json(res,error.status||500,{error:error.code||'meshy_generate_failed',message:error.message,provider:error.provider||undefined});
  }
}
