export default async function handler(req,res){
  res.setHeader('Cache-Control','no-store');
  if(req.method!=='GET')return res.status(405).json({ok:false,error:'Method not allowed'});
  const supabaseUrl=Boolean(process.env.VITE_SUPABASE_URL||process.env.NEXT_PUBLIC_SUPABASE_URL||process.env.SUPABASE_URL);
  const serviceRole=Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
  const storageConfigured=supabaseUrl&&serviceRole;
  return res.status(storageConfigured?200:503).json({
    ok:storageConfigured,
    service:'TRYAMM Creator Media',
    bucket:'creator-media',
    signedUploads:storageConfigured,
    verifiedPlayback:storageConfigured,
    maxUploadBytes:1024*1024*1024,
    supportedTypes:['video/mp4','video/webm','image/jpeg','image/png','image/webp','image/gif'],
    publicSecrets:false,
    reason:storageConfigured?null:'Supabase URL and service-role configuration are required for signed creator-media storage.',
    time:new Date().toISOString()
  });
}
