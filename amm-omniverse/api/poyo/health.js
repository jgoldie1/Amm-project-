import {json} from '../_lib/supabase-admin.js';

export default async function handler(req,res){
  if(req.method!=='GET')return json(res,405,{error:'method_not_allowed'});
  const configured=Boolean(String(process.env.POYO_API_KEY||'').trim());
  return json(res,200,{
    ok:true,
    service:'tryamm-poyo-ai-studio',
    schema:'tryamm.poyo-health.v2',
    configured,
    studioShellReady:true,
    liveGenerationReady:configured,
    mode:configured?'provider-ready':'configuration-required',
    provider:'poyo.ai',
    serverOnlyCredential:true,
    requiredEnvironment:['POYO_API_KEY'],
    submitEndpoint:'https://api.poyo.ai/api/generate/submit',
    statusEndpointPattern:'https://api.poyo.ai/api/generate/status/{taskId}',
    capabilities:['image','video','music','avatar','3d','media-tools'],
    activation:configured?{
      state:'ready-for-authenticated-generation',
      next:['run authenticated image smoke test','run status polling test','verify output handoff into TRYAMM media/StreetVerse']
    }:{
      state:'credential-required',
      next:['Create or use a Poyo.ai API key','Store it server-side as POYO_API_KEY in Vercel production','Redeploy','Run /api/poyo/health then one authenticated generation smoke test']
    },
    note:configured
      ?'Provider credential is present. Generation still requires an authenticated TRYAMM user and consent for referenced people/voices/brands/media.'
      :'The Poyo integration code is complete, but Poyo requires a real account API key. The key must stay server-side and cannot be fabricated or exposed in browser code.'
  });
}
