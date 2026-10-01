import {json} from '../_lib/supabase-admin.js';
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
    keyExposed:false,
    schema:'tryamm.meshy-health.v1'
  });
}
