import {json} from '../_lib/supabase-admin.js';
import {publicMeshyFactoryManifest} from '../_lib/meshy-factory.js';

export default async function handler(req,res){
  if(req.method!=='GET'){
    res.setHeader('Allow','GET');
    return json(res,405,{error:'method_not_allowed'});
  }
  try{
    const cityScope=String(req.query?.city||req.query?.scope||'global');
    const assets=await publicMeshyFactoryManifest({cityScope});
    res.setHeader('Cache-Control','public, max-age=30, s-maxage=60, stale-while-revalidate=300');
    return res.status(200).json({ok:true,schema:'tryamm.meshy.asset-manifest.v1',cityScope,assets});
  }catch(error){
    return json(res,error.status||500,{error:error.code||'meshy_manifest_failed',message:error.message});
  }
}
