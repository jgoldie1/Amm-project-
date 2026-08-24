import {json} from '../_lib/supabase-admin.js';

export default async function handler(req,res){
  if(req.method!=='GET')return json(res,405,{error:'method_not_allowed'});
  const configured=Boolean(String(process.env.POYO_API_KEY||'').trim());
  return json(res,200,{
    ok:true,
    service:'tryamm-poyo-ai-studio',
    schema:'tryamm.poyo-health.v1',
    configured,
    mode:configured?'provider-ready':'configuration-required',
    provider:'poyo.ai',
    capabilities:['image','video','music','avatar','3d','media-tools'],
    note:configured?'Provider credential is present. Generation still requires an authenticated TRYAMM user.':'Set POYO_API_KEY in the deployment environment to enable live generation.'
  });
}
