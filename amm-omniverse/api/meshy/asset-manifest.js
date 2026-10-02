import {adminReady,json} from '../_lib/supabase-admin.js';

function degradedManifest(res,cityScope){
  res.setHeader('Cache-Control','public, max-age=15, s-maxage=30, stale-while-revalidate=120');
  return res.status(200).json({
    ok:true,
    schema:'tryamm.meshy.asset-manifest.v1',
    cityScope,
    assets:[],
    degraded:true,
    source:'native-fallback',
    reason:'supabase_admin_not_configured',
  });
}

export default async function handler(req,res){
  if(req.method!=='GET'){
    res.setHeader('Allow','GET');
    return json(res,405,{error:'method_not_allowed'});
  }

  const cityScope=String(req.query?.city||req.query?.scope||'global');

  // StreetVerse remains playable if the durable Meshy catalog is unavailable.
  // Avoid importing the heavier Meshy backend at all in degraded mode; the
  // client will immediately use the native GLB fallback catalog instead.
  if(!adminReady())return degradedManifest(res,cityScope);

  try{
    const {publicMeshyFactoryManifest}=await import('../_lib/meshy-factory.js');
    const assets=await publicMeshyFactoryManifest({cityScope});
    res.setHeader('Cache-Control','public, max-age=30, s-maxage=60, stale-while-revalidate=300');
    return res.status(200).json({ok:true,schema:'tryamm.meshy.asset-manifest.v1',cityScope,assets});
  }catch(error){
    if(error?.message==='supabase_admin_not_configured')return degradedManifest(res,cityScope);
    return json(res,error.status||500,{error:error.code||'meshy_manifest_failed',message:error.message});
  }
}
