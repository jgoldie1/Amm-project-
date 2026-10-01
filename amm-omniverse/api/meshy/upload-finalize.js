import {json,adminRest} from '../_lib/supabase-admin.js';
import {requireUser} from '../_lib/security.js';
import {MESHY_FACTORY_CATALOG,requireFactoryAuthority} from '../_lib/meshy-factory.js';
import {downloadGlb,publicAssetUrl} from '../_lib/streetverse-asset-storage.js';

export default async function handler(req,res){
  if(req.method!=='POST'){
    res.setHeader('Allow','POST');
    return json(res,405,{error:'method_not_allowed'});
  }
  const user=await requireUser(req,res);if(!user)return;
  try{
    requireFactoryAuthority(user);
    const body=req.body&&typeof req.body==='object'?req.body:{};
    const assetId=String(body.assetId||'');
    const spec=MESHY_FACTORY_CATALOG.find(item=>item.assetId===assetId);
    if(!spec)return json(res,404,{error:'unknown_streetverse_asset'});
    const safeScope=String(body.cityScope||'global').replace(/[^a-zA-Z0-9_-]/g,'-').slice(0,80)||'global';
    const path=String(body.path||'').replace(/^\/+/, '');
    const prefix=`characters/manual/${safeScope}/${user.id}/`;
    if(!path.startsWith(prefix)||!path.endsWith('/'+spec.filename)){
      return json(res,400,{error:'invalid_manual_asset_path'});
    }
    const url=publicAssetUrl(path);
    const bytes=await downloadGlb(url);
    const now=new Date().toISOString();
    const rows=await adminRest('meshy_asset_jobs',{method:'POST',body:{
      owner_user_id:user.id,
      asset_id:spec.assetId,
      filename:spec.filename,
      city_scope:safeScope,
      generation_type:spec.generationType,
      stage:'ready',
      progress:100,
      generation_glb_url:url,
      rigged_glb_url:url,
      published_path:path,
      public_url:url,
      provider_credits:0,
      completed_at:now,
      evidence:{
        authority:'founder-or-admin',
        provider:'manual-meshy-export',
        manualUpload:true,
        validatedGlbMagic:true,
        uploadedBytes:bytes.length,
        uploadedAt:now,
        embeddedRigOrAnimations:'runtime-detect'
      }
    }});
    const job=rows?.[0];
    if(!job)throw Object.assign(new Error('manual_meshy_job_persist_failed'),{status:503,code:'manual_meshy_job_persist_failed'});
    return json(res,201,{
      ok:true,
      schema:'tryamm.meshy-upload-finalize.v1',
      assetId:spec.assetId,
      filename:spec.filename,
      job,
      publicUrl:url,
      validatedBytes:bytes.length,
      generationCreditsSpent:0
    });
  }catch(error){
    return json(res,error.status||500,{error:error.code||'meshy_upload_finalize_failed',message:error.message});
  }
}
