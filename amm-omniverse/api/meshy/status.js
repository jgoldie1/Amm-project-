import {json} from '../_lib/supabase-admin.js';
import {meshyKey} from '../_lib/meshy.js';

export default async function handler(req,res){
  res.setHeader('Cache-Control','no-store');
  if(req.method!=='GET'){
    res.setHeader('Allow','GET');
    return json(res,405,{error:'method_not_allowed'});
  }
  const configured=Boolean(meshyKey());
  return json(res,200,{
    ok:true,
    schema:'tryamm.meshy-status.v1',
    provider:'meshy.ai',
    configured,
    serverSideSecret:true,
    publicSecret:false,
    envName:'MESHY_API_KEY',
    capabilities:{
      imageTo3d:true,
      multiImageTo3d:true,
      textTo3d:true,
      rigging:true,
      animation:true,
      glbTarget:true,
      bjV6HotSwap:true
    },
    heroAsset:'SV_HERO_BJ_STUBBS_V6.glb',
    time:new Date().toISOString()
  });
}
