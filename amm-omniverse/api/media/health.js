import {publicDataApiProbe,userSupabaseReady} from '../_lib/supabase-user.js';

export default async function handler(req,res){
  res.setHeader('Cache-Control','no-store');
  if(req.method!=='GET')return res.status(405).json({ok:false,error:'Method not allowed'});
  const configured=userSupabaseReady();
  const probe=configured?await publicDataApiProbe():{ok:false,status:0,error:'supabase_public_config_missing'};
  const ready=configured&&probe.ok;
  return res.status(ready?200:503).json({
    ok:ready,
    service:'TRYAMM Creator Media',
    bucket:'creator-media',
    authMode:'authenticated-user-rls',
    serviceRoleRequired:false,
    signedUploads:ready,
    verifiedPlayback:ready,
    dataApiReachable:probe.ok,
    dataApiStatus:probe.status,
    maxUploadBytes:1024*1024*1024,
    supportedTypes:['video/mp4','video/webm','image/jpeg','image/png','image/webp','image/gif'],
    publicSecrets:false,
    reason:ready?null:(probe.error||'Supabase URL and publishable-key configuration are required for creator media.'),
    time:new Date().toISOString()
  });
}
