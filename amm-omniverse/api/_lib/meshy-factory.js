import {adminRest} from './supabase-admin.js';
import {createMeshyTask,getMeshyTask,summarizeMeshyTask,createMeshyRiggingTask,getMeshyRiggingTask,summarizeMeshyRiggingTask} from './meshy.js';
import {persistRemoteGlb} from './streetverse-asset-storage.js';

export const ASSET_FACTORY_ROLES=['founder','admin','superadmin','platform-admin','asset-admin','ai-cto'] as const;

const CATALOG=[
 {assetId:'sv-bj-stubbs-v6',filename:'SV_HERO_BJ_STUBBS_V6.glb',generationType:'image-to-3d',height:1.82,heritage:'reference-authorized',ageLane:'adult',role:'hero/founder character',prompt:null},
 {assetId:'sv-black-man-youngadult-01',filename:'SV_NPC_BLACK_MAN_YOUNGADULT_01.glb',generationType:'text-to-3d',height:1.80,heritage:'Black',ageLane:'young-adult',role:'resident creator athlete driver'},
 {assetId:'sv-black-woman-youngadult-01',filename:'SV_NPC_BLACK_WOMAN_YOUNGADULT_01.glb',generationType:'text-to-3d',height:1.68,heritage:'Black',ageLane:'young-adult',role:'resident creator merchant medical worker'},
 {assetId:'sv-black-man-adult-01',filename:'SV_NPC_BLACK_MAN_ADULT_01.glb',generationType:'text-to-3d',height:1.82,heritage:'Black',ageLane:'adult',role:'resident merchant security worker parent'},
 {assetId:'sv-black-woman-adult-01',filename:'SV_NPC_BLACK_WOMAN_ADULT_01.glb',generationType:'text-to-3d',height:1.69,heritage:'Black',ageLane:'adult',role:'resident merchant worker parent community leader'},
 {assetId:'sv-black-man-senior-01',filename:'SV_NPC_BLACK_MAN_SENIOR_01.glb',generationType:'text-to-3d',height:1.76,heritage:'Black',ageLane:'senior',role:'senior resident mentor'},
 {assetId:'sv-black-woman-senior-01',filename:'SV_NPC_BLACK_WOMAN_SENIOR_01.glb',generationType:'text-to-3d',height:1.64,heritage:'Black',ageLane:'senior',role:'senior resident mentor'},
 {assetId:'sv-white-man-youngadult-01',filename:'SV_NPC_WHITE_MAN_YOUNGADULT_01.glb',generationType:'text-to-3d',height:1.81,heritage:'White',ageLane:'young-adult',role:'student resident worker creator'},
 {assetId:'sv-white-woman-youngadult-01',filename:'SV_NPC_WHITE_WOMAN_YOUNGADULT_01.glb',generationType:'text-to-3d',height:1.68,heritage:'White',ageLane:'young-adult',role:'student resident worker creator'},
 {assetId:'sv-latino-man-adult-01',filename:'SV_NPC_LATINO_MAN_ADULT_01.glb',generationType:'text-to-3d',height:1.77,heritage:'Latino/Hispanic',ageLane:'adult',role:'resident merchant worker driver'},
 {assetId:'sv-latina-woman-adult-01',filename:'SV_NPC_LATINA_WOMAN_ADULT_01.glb',generationType:'text-to-3d',height:1.65,heritage:'Latina/Hispanic',ageLane:'adult',role:'resident merchant worker medical worker'},
 {assetId:'sv-east-asian-youngadult-01',filename:'SV_NPC_EAST_ASIAN_YOUNGADULT_01.glb',generationType:'text-to-3d',height:1.70,heritage:'East Asian',ageLane:'young-adult',role:'student resident creator worker'},
 {assetId:'sv-south-asian-adult-01',filename:'SV_NPC_SOUTH_ASIAN_ADULT_01.glb',generationType:'text-to-3d',height:1.72,heritage:'South Asian',ageLane:'adult',role:'resident professional merchant worker'},
 {assetId:'sv-mena-adult-01',filename:'SV_NPC_MENA_ADULT_01.glb',generationType:'text-to-3d',height:1.73,heritage:'Middle Eastern/North African',ageLane:'adult',role:'resident merchant professional worker'},
 {assetId:'sv-multiracial-youngadult-01',filename:'SV_NPC_MULTIRACIAL_YOUNGADULT_01.glb',generationType:'text-to-3d',height:1.72,heritage:'Multiracial',ageLane:'young-adult',role:'student resident creator worker'},
 {assetId:'sv-child-01',filename:'SV_NPC_CHILD_01.glb',generationType:'text-to-3d',height:1.33,heritage:'configurable',ageLane:'child',role:'family school playground sports community'},
 {assetId:'sv-teen-01',filename:'SV_NPC_TEEN_01.glb',generationType:'text-to-3d',height:1.62,heritage:'configurable',ageLane:'teen',role:'student family sports creator-safe community'},
];

export const MESHY_FACTORY_CATALOG=CATALOG;

function rolesFor(user){
  const values=[user?.app_metadata?.role,user?.user_metadata?.role,...(Array.isArray(user?.app_metadata?.roles)?user.app_metadata.roles:[]),...(Array.isArray(user?.user_metadata?.roles)?user.user_metadata.roles:[])];
  return values.map(v=>String(v||'').trim().toLowerCase()).filter(Boolean);
}
export function hasFactoryAuthority(user){
  const explicit=String(process.env.TRYAMM_ASSET_FACTORY_USER_IDS||'').split(',').map(v=>v.trim()).filter(Boolean);
  if(explicit.includes(String(user?.id||'')))return true;
  return rolesFor(user).some(role=>ASSET_FACTORY_ROLES.includes(role));
}
export function requireFactoryAuthority(user){
  if(!hasFactoryAuthority(user))throw Object.assign(new Error('asset_factory_founder_or_admin_required'),{status:403,code:'asset_factory_founder_or_admin_required'});
}
function specFor(assetId){
  const spec=CATALOG.find(x=>x.assetId===String(assetId||''));
  if(!spec)throw Object.assign(new Error('unknown_streetverse_asset'),{status:404,code:'unknown_streetverse_asset'});
  return spec;
}
function defaultPrompt(spec){
  return [
    'game-ready realistic full-body humanoid character',
    spec.heritage!=='configurable'?spec.heritage:'diverse community',
    spec.ageLane,
    spec.role,
    'neutral everyday contemporary clothing',
    'A-pose suitable for humanoid rigging',
    'PBR textures',
    'clean mobile-web optimized topology',
    'realistic proportions',
    'no logos no trademarks no celebrity likeness',
    'StreetVerse open-world NPC'
  ].join(', ');
}
const rowById=async(id)=>{
  const rows=await adminRest('meshy_asset_jobs',{query:{id:`eq.${id}`,limit:1}});
  return rows?.[0]||null;
}
const update=async(id,body)=>{
  const rows=await adminRest('meshy_asset_jobs',{method:'PATCH',query:{id:`eq.${id}`},body:{...body,updated_at:new Date().toISOString()}});
  return rows?.[0]||await rowById(id);
}
const failed=async(job,code,message)=>update(job.id,{stage:'failed',error_code:String(code||'meshy_factory_failed').slice(0,120),error_message:String(message||'Meshy asset factory failed').slice(0,1000),evidence:{...(job.evidence||{}),failedAt:new Date().toISOString()}});
const isSuccess=status=>['SUCCEEDED','SUCCESS','COMPLETED'].includes(String(status||'').toUpperCase());
const isFailure=status=>['FAILED','FAILURE','ERROR','CANCELED','CANCELLED','EXPIRED'].includes(String(status||'').toUpperCase());

export async function startMeshyFactoryJob(user,{assetId,imageUrl,cityScope='global'}={}){
  requireFactoryAuthority(user);
  const spec=specFor(assetId);
  const prompt=spec.generationType==='text-to-3d'?defaultPrompt(spec):null;
  const payload=spec.generationType==='image-to-3d'
    ?{image_url:String(imageUrl||'').trim(),ai_model:'meshy-7.1',target_formats:['glb'],should_texture:true,enable_pbr:true,should_remesh:true,target_polycount:45000,pose_mode:'a-pose'}
    :{prompt,ai_model:'meshy-7.1',target_formats:['glb'],should_texture:true,enable_pbr:true,should_remesh:true,target_polycount:45000,pose_mode:'a-pose'};
  if(spec.generationType==='image-to-3d'&&!payload.image_url)throw Object.assign(new Error('approved_reference_image_url_required_for_bj'),{status:400,code:'approved_reference_image_url_required_for_bj'});
  const task=await createMeshyTask(spec.generationType,payload);
  const evidence={authority:'founder-or-admin',ceoObjective:'product-readiness',distinguishedEngineeringOwner:true,provider:'meshy.ai',generationSubmittedAt:new Date().toISOString(),generationTaskId:task.id};
  const rows=await adminRest('meshy_asset_jobs',{method:'POST',body:{
    owner_user_id:user.id,asset_id:spec.assetId,filename:spec.filename,city_scope:String(cityScope||'global').slice(0,80),
    generation_type:spec.generationType,prompt,source_image_url:spec.generationType==='image-to-3d'?payload.image_url:null,
    stage:'generating',progress:1,provider_generation_task_id:task.id,evidence
  }});
  return rows?.[0];
}

export async function listMeshyFactoryJobs(user,{limit=30}={}){
  requireFactoryAuthority(user);
  return await adminRest('meshy_asset_jobs',{query:{owner_user_id:`eq.${user.id}`,order:'created_at.desc',limit:Math.max(1,Math.min(100,Number(limit)||30))}})||[];
}

export async function tickMeshyFactoryJob(user,jobId){
  requireFactoryAuthority(user);
  let job=await rowById(jobId);
  if(!job)throw Object.assign(new Error('meshy_factory_job_not_found'),{status:404,code:'meshy_factory_job_not_found'});
  if(job.owner_user_id!==user.id&&!hasFactoryAuthority(user))throw Object.assign(new Error('meshy_factory_job_forbidden'),{status:403,code:'meshy_factory_job_forbidden'});
  const spec=specFor(job.asset_id);
  try{
    if(job.stage==='generating'){
      const snapshot=summarizeMeshyTask(await getMeshyTask(job.generation_type,job.provider_generation_task_id),job.generation_type);
      if(isFailure(snapshot.status))return failed(job,'meshy_generation_failed',snapshot.status);
      if(!isSuccess(snapshot.status)||!snapshot.glb)return update(job.id,{progress:Math.max(1,Math.min(55,Math.round(Number(snapshot.progress||0)*.55))),provider_credits:snapshot.consumedCredits,evidence:{...(job.evidence||{}),generationStatus:snapshot.status,lastProviderPollAt:new Date().toISOString()}});
      const rig=await createMeshyRiggingTask({modelUrl:snapshot.glb,heightMeters:spec.height});
      job=await update(job.id,{stage:'rigging',progress:58,generation_glb_url:snapshot.glb,provider_generation_task_id:snapshot.id,provider_rig_task_id:rig.id,provider_credits:snapshot.consumedCredits,evidence:{...(job.evidence||{}),generationStatus:snapshot.status,rigSubmittedAt:new Date().toISOString(),rigTaskId:rig.id}});
      return job;
    }
    if(job.stage==='rigging'){
      const snapshot=summarizeMeshyRiggingTask(await getMeshyRiggingTask(job.provider_rig_task_id));
      if(isFailure(snapshot.status))return failed(job,'meshy_rigging_failed',snapshot.error||snapshot.status);
      if(!isSuccess(snapshot.status)||!snapshot.riggedGlb)return update(job.id,{progress:Math.max(58,Math.min(85,58+Math.round(Number(snapshot.progress||0)*.27))),provider_credits:Number(job.provider_credits||0)+Number(snapshot.consumedCredits||0),evidence:{...(job.evidence||{}),rigStatus:snapshot.status,lastProviderPollAt:new Date().toISOString()}});
      return update(job.id,{stage:'publishing',progress:88,rigged_glb_url:snapshot.riggedGlb,walking_glb_url:snapshot.walkingGlb,running_glb_url:snapshot.runningGlb,provider_credits:Number(job.provider_credits||0)+Number(snapshot.consumedCredits||0),evidence:{...(job.evidence||{}),rigStatus:snapshot.status,rigCompletedAt:new Date().toISOString()}});
    }
    if(job.stage==='publishing'){
      const base=`characters/${job.filename}`;
      const main=await persistRemoteGlb(job.rigged_glb_url,base);
      const stem=job.filename.replace(/\.glb$/i,'');
      const walk=job.walking_glb_url?await persistRemoteGlb(job.walking_glb_url,`characters/${stem}.walk.glb`):null;
      const run=job.running_glb_url?await persistRemoteGlb(job.running_glb_url,`characters/${stem}.run.glb`):null;
      return update(job.id,{stage:'ready',progress:100,published_path:main.path,public_url:main.url,walking_public_url:walk?.url||null,running_public_url:run?.url||null,completed_at:new Date().toISOString(),error_code:null,error_message:null,evidence:{...(job.evidence||{}),publishedAt:new Date().toISOString(),publishedBytes:main.bytes,walkingPublished:Boolean(walk),runningPublished:Boolean(run),releaseEvidence:'real provider task + validated GLB + durable storage'}});
    }
    return job;
  }catch(error){
    return failed(job,error?.code||'meshy_factory_tick_failed',error?.message||String(error));
  }
}

export function publicFactoryManifestRow(job){
  return {
    assetId:job.asset_id,
    filename:job.filename,
    cityScope:job.city_scope,
    url:job.public_url,
    walkUrl:job.walking_public_url||null,
    runUrl:job.running_public_url||null,
    ready:job.stage==='ready'&&Boolean(job.public_url),
    completedAt:job.completed_at||null,
  };
}

export async function publicMeshyFactoryManifest({cityScope='global'}={}){
  const rows=await adminRest('meshy_asset_jobs',{query:{stage:'eq.ready',city_scope:`in.(global,${String(cityScope||'global').replace(/[^a-zA-Z0-9_-]/g,'')})`,order:'completed_at.desc',limit:100}});
  const seen=new Set();
  return (rows||[]).filter(row=>{if(seen.has(row.asset_id))return false;seen.add(row.asset_id);return true}).map(publicFactoryManifestRow);
}
