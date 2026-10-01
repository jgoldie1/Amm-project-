import crypto from 'node:crypto';
import {createClient} from '@supabase/supabase-js';
import {json} from '../_lib/supabase-admin.js';
import {requireUser} from '../_lib/security.js';
import {MESHY_FACTORY_CATALOG,requireFactoryAuthority} from '../_lib/meshy-factory.js';
import {STREETVERSE_ASSET_BUCKET,MAX_GLB_BYTES,publicAssetUrl} from '../_lib/streetverse-asset-storage.js';

const SUPABASE_URL=()=>process.env.VITE_SUPABASE_URL||process.env.NEXT_PUBLIC_SUPABASE_URL||process.env.SUPABASE_URL||'';
const SERVICE_ROLE=()=>process.env.SUPABASE_SERVICE_ROLE_KEY||'';

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
    const size=Math.max(0,Number(body.size||0));
    if(!size||size>MAX_GLB_BYTES)return json(res,413,{error:'glb_size_invalid',maxBytes:MAX_GLB_BYTES});
    const originalName=String(body.filename||'').trim();
    if(!/\.glb$/i.test(originalName))return json(res,400,{error:'glb_file_required'});

    const url=SUPABASE_URL(),serviceRole=SERVICE_ROLE();
    if(!url||!serviceRole)return json(res,503,{error:'streetverse_asset_storage_not_configured'});
    const uploadId=crypto.randomUUID();
    const safeScope=String(body.cityScope||'global').replace(/[^a-zA-Z0-9_-]/g,'-').slice(0,80)||'global';
    const path=`characters/manual/${safeScope}/${user.id}/${uploadId}/${spec.filename}`;
    const supabase=createClient(url,serviceRole,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}});
    const {data,error}=await supabase.storage.from(STREETVERSE_ASSET_BUCKET).createSignedUploadUrl(path,{upsert:false});
    if(error||!data?.token)throw Object.assign(new Error(error?.message||'signed_upload_create_failed'),{status:502,code:'signed_upload_create_failed'});
    return json(res,200,{
      ok:true,
      schema:'tryamm.meshy-upload-intent.v1',
      assetId:spec.assetId,
      filename:spec.filename,
      path,
      token:data.token,
      signedUrl:data.signedUrl||null,
      publicUrl:publicAssetUrl(path),
      bucket:STREETVERSE_ASSET_BUCKET,
      maxBytes:MAX_GLB_BYTES,
      expiresInSeconds:7200,
      keyExposed:false
    });
  }catch(error){
    return json(res,error.status||500,{error:error.code||'meshy_upload_intent_failed',message:error.message});
  }
}
