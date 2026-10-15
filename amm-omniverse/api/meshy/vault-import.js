import {createClient} from '@supabase/supabase-js';
import {json} from '../_lib/supabase-admin.js';
import {requireUser} from '../_lib/security.js';
import {getMeshyTask,summarizeMeshyTask} from '../_lib/meshy.js';
import {requireAssetVaultOperator,callCharacterVault} from '../_lib/asset-vault-access.js';

// Reuse a FINISHED Meshy task: no creation/refine/rig calls, no provider credits.
// Upload via signed private token; only the founder can later approve publishing.
const MAX=50*1024*1024;
export default async function handler(req,res){
 if(req.method!=='POST'){res.setHeader('Allow','POST');return json(res,405,{error:'method_not_allowed'});}
 const user=await requireUser(req,res);
 if(!user)return;
 try{
  // Verify founder/operator in the secure Supabase database before fetching
  // any provider task or consuming even provider read-rate quota.
  const access=await requireAssetVaultOperator(req);
  const body=req.body&&typeof req.body==='object'?req.body:{};
  const type=String(body.type||'image-to-3d');
  if(!['image-to-3d','multi-image-to-3d','text-to-3d'].includes(type))
    return json(res,400,{error:'invalid_task_type'});
  const taskId=String(body.taskId||'').trim();
  if(!/^[A-Za-z0-9_-]{8,120}$/.test(taskId))return json(res,400,{error:'invalid_task_id'});
  const assetId=String(body.assetId||'').trim();
  const cityScope=String(body.cityScope||'global').trim();
  if(!/^[a-z0-9][a-z0-9_-]{2,89}$/.test(assetId)||!/^[a-z0-9_-]{1,80}$/.test(cityScope))
    return json(res,400,{error:'invalid_asset_scope'});

  const provider=summarizeMeshyTask(await getMeshyTask(type,taskId),type);
  if(!['SUCCEEDED','SUCCESS','COMPLETED'].includes(String(provider.status).toUpperCase())||!provider.glb)
    return json(res,409,{error:'meshy_task_not_finished',providerStatus:provider.status});
  const glbURL=new URL(provider.glb);
  if(glbURL.protocol!=='https:'||!glbURL.hostname||/^(localhost|127[.]|10[.]|192[.]168[.]|169[.]254[.]|0[.]|::1)/i.test(glbURL.hostname)||
    glbURL.username||glbURL.password)
    return json(res,422,{error:'unsupported_meshy_asset_host'});
  const fetched=await fetch(glbURL.href,{cache:'no-store',signal:AbortSignal.timeout(22000)});
  if(!fetched.ok)return json(res,502,{error:'meshy_finished_glb_unavailable'});
  if(Number(fetched.headers.get('content-length')||0)>MAX)
    return json(res,413,{error:'meshy_glb_too_large'});
  const raw=await fetched.arrayBuffer();
  if(raw.byteLength<32||raw.byteLength>MAX)return json(res,413,{error:'meshy_glb_size_invalid'});
  const dv=new DataView(raw);
  if(dv.getUint32(0,true)!==0x46546c67||dv.getUint32(4,true)!==2||dv.getUint32(8,true)!==raw.byteLength)
    return json(res,422,{error:'meshy_export_not_valid_glb'});
  const filename='SV_'+assetId.replace(/[^a-z0-9_-]/g,'_').toUpperCase()+'.glb';
  const intent=await callCharacterVault(access,{
    action:'intent',assetId,cityScope,sourceKind:'meshy_existing',
    filename,fileSize:raw.byteLength
  });
  const sb=createClient(access.base,access.publishableKey,{auth:{persistSession:false,autoRefreshToken:false}});
  const uploaded=await sb.storage.from(intent.bucket).uploadToSignedUrl(
    intent.path,intent.token,new Blob([raw],{type:'model/gltf-binary'}),
    {contentType:'model/gltf-binary',cacheControl:'300'}
  );
  if(uploaded.error)throw Object.assign(new Error('private_upload_failed'),{status:503,code:'private_upload_failed'});
  const finalized=await callCharacterVault(access,{action:'finalize',recordId:intent.recordId});
  return json(res,201,{ok:true,schema:'tryamm.meshy-existing-to-vault.v1',
    taskId,assetId,generationCreditsSpent:0,character:finalized.asset,
    pendingFounderReview:true,public:false});
 }catch(e){
  return json(res,e.status||503,{ok:false,error:e.code||'meshy_existing_import_failed'});
 }
}
