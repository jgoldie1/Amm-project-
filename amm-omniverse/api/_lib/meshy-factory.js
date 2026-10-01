import {adminRest} from './supabase-admin.js';
import {createMeshyTask,getMeshyTask,summarizeMeshyTask,createMeshyRiggingTask,getMeshyRiggingTask,summarizeMeshyRiggingTask} from './meshy.js';
import {persistRemoteGlb} from './streetverse-asset-storage.js';

export const ASSET_FACTORY_ROLES=['founder','admin','superadmin','platform-admin','asset-admin','ai-cto'];

const CATALOG=[
 {assetId:'sv-james-body-base-v1',filename:'SV_HERO_JAMES_BODY_BASE_V1.glb',generationType:'text-to-3d',height:1.80,heritage:'identity-neutral',ageLane:'adult',role:'James body base; neutral face until an approved reference image is supplied',prompt:'game-ready realistic adult male hero body base, neutral non-identifying face, balanced athletic-average build, full body, A-pose for humanoid rigging, PBR textures, clean mobile-web topology, no celebrity likeness, no logos, StreetVerse hero body base'},
 {assetId:'sv-female-body-base-v1',filename:'SV_BODY_FEMALE_BASE_V1.glb',generationType:'text-to-3d',height:1.68,heritage:'identity-neutral',ageLane:'adult',role:'reusable adult female body base for StreetVerse character creation',prompt:'game-ready realistic adult female body base, neutral non-identifying face, balanced natural proportions, full body, A-pose for humanoid rigging, PBR textures, clean mobile-web topology, no celebrity likeness, no logos, reusable StreetVerse female character base'},
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
const claim=async(id,expectedStage,body)=>{
  const rows=await adminRest('meshy_asset_jobs',{method:'PATCH',query:{id:`eq.${id}`,stage:`eq.${expectedStage}`},body:{...body,updated_at:new Date().toISOString()}});
  return rows?.[0]||null;
}
const failed=async(job,code,message)=>update(job.id,{stage:'failed',error_code:String(code||'meshy_factory_failed').slice(0,120),error_message:String(message||'Meshy asset factory failed').slice(0,1000),evidence:{...(job.evidence||{}),failedAt:new Date().toISOString()}});
const isSuccess=status=>['SUCCEEDED','SUCCESS','COMPLETED'].includes(String(status||'').toUpperCase());
const isFailure=status=>['FAILED','FAILURE','ERROR','CANCELED','CANCELLED','EXPIRED'].includes(String(status||'').toUpperCase());
const retryableError=error=>{
  const status=Number(error?.status||error?.statusCode||0);
  const code=String(error?.code||'').toLowerCase();
  const message=String(error?.message||'').toLowerCase();
  return !status||status===408||status===425||status===429||status>=500||code.includes('timeout')||code.includes('network')||message.includes('timeout')||message.includes('fetch failed')||message.includes('temporar');
}
const retryable=async(job,error)=>update(job.id,{
  error_code:'retryable_infrastructure_error',
  error_message:String(error?.message||error||'Temporary provider/storage error').slice(0,1000),
  evidence:{...(job.evidence||{}),lastRetryableErrorAt:new Date().toISOString(),retryable:true}
});
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function attachProviderTask(jobId,stage,body){
  let lastError=null;
  for(let attempt=1;attempt<=3;attempt++){
    try{
      const attached=await claim(jobId,stage,body);
      if(attached)return attached;
      const current=await rowById(jobId);
      if(current)return current;
    }catch(error){lastError=error;if(attempt<3)await sleep(120*attempt)}
  }
  if(lastError)throw lastError;
  return null;
}

export async function startMeshyFactoryJob(user,{assetId,imageUrl,cityScope='global'}={}){
  requireFactoryAuthority(user);
  const spec=specFor(assetId);
  const prompt=spec.generationType==='text-to-3d'?(spec.prompt||defaultPrompt(spec)):null;
  const payload=spec.generationType==='image-to-3d'
    ?{image_url:String(imageUrl||'').trim(),ai_model:'meshy-7.1',target_formats:['glb'],should_texture:true,enable_pbr:true,should_remesh:true,target_polycount:45000,pose_mode:'a-pose'}
    :{prompt,ai_model:'meshy-7.1',target_formats:['glb'],should_texture:true,enable_pbr:true,should_remesh:true,target_polycount:45000,pose_mode:'a-pose'};
  if(spec.generationType==='image-to-3d'&&!payload.image_url)throw Object.assign(new Error('approved_reference_image_url_required_for_bj'),{status:400,code:'approved_reference_image_url_required_for_bj'});

  // Persist before any credit-consuming provider call. A paid provider task can
  // therefore never exist without a durable TRYAMM recovery row.
  const queuedRows=await adminRest('meshy_asset_jobs',{method:'POST',body:{
    owner_user_id:user.id,asset_id:spec.assetId,filename:spec.filename,city_scope:String(cityScope||'global').slice(0,80),
    generation_type:spec.generationType,prompt,source_image_url:spec.generationType==='image-to-3d'?payload.image_url:null,
    stage:'queued',progress:0,evidence:{authority:'founder-or-admin',ceoObjective:'product-readiness',distinguishedEngineeringOwner:true,provider:'meshy.ai',queuedAt:new Date().toISOString()}
  }});
  const queued=queuedRows?.[0];
  if(!queued)throw Object.assign(new Error('meshy_factory_queue_persist_failed'),{status:503,code:'meshy_factory_queue_persist_failed'});

  const submitting=await claim(queued.id,'queued',{stage:'generation-submitting',progress:1,evidence:{...(queued.evidence||{}),generationSubmissionClaimedAt:new Date().toISOString()}});
  if(!submitting)return await rowById(queued.id);

  let task;
  try{
    task=await createMeshyTask(spec.generationType,payload);
  }catch(error){
    if(retryableError(error)){
      await claim(queued.id,'generation-submitting',{stage:'queued',progress:0,error_code:'retryable_generation_submit',error_message:String(error?.message||error).slice(0,1000),evidence:{...(submitting.evidence||{}),retryableGenerationSubmitAt:new Date().toISOString()}});
      throw error;
    }
    return failed(submitting,error?.code||'meshy_generation_submit_failed',error?.message||String(error));
  }
  try{
    const attached=await attachProviderTask(queued.id,'generation-submitting',{
      stage:'generating',progress:2,provider_generation_task_id:task.id,
      evidence:{...(submitting.evidence||{}),generationSubmittedAt:new Date().toISOString(),generationTaskId:task.id}
    });
    if(attached)return attached;
  }catch(error){
    // Provider task already exists. Never reset to queued here or a retry could
    // spend credits twice. Return the real provider ID for recovery instead.
    return {...submitting,provider_generation_task_id:task.id,recovery_required:true,recovery_error:String(error?.message||error)};
  }
  return {...submitting,provider_generation_task_id:task.id,recovery_required:true};
}

export async function listMeshyFactoryJobs(user,{limit=30}={}){
  requireFactoryAuthority(user);
  return await adminRest('meshy_asset_jobs',{query:{owner_user_id:`eq.${user.id}`,order:'created_at.desc',limit:Math.max(1,Math.min(100,Number(limit)||30))}})||[];
}

export async function tickMeshyFactoryJob(user,jobId){
  requireFactoryAuthority(user);
  const owned=await rowById(jobId);
  if(!owned)throw Object.assign(new Error('meshy_factory_job_not_found'),{status:404,code:'meshy_factory_job_not_found'});
  if(owned.owner_user_id!==user.id&&!hasFactoryAuthority(user))throw Object.assign(new Error('meshy_factory_job_forbidden'),{status:403,code:'meshy_factory_job_forbidden'});
  return tickMeshyFactoryJobInternal(jobId);
}

export async function tickMeshyFactoryJobInternal(jobId){
  let job=await rowById(jobId);
  if(!job)throw Object.assign(new Error('meshy_factory_job_not_found'),{status:404,code:'meshy_factory_job_not_found'});
  const spec=specFor(job.asset_id);
  try{
    if(job.stage==='generating'){
      const snapshot=summarizeMeshyTask(await getMeshyTask(job.generation_type,job.provider_generation_task_id),job.generation_type);
      if(isFailure(snapshot.status))return failed(job,'meshy_generation_failed',snapshot.status);
      if(!isSuccess(snapshot.status)||!snapshot.glb)return update(job.id,{progress:Math.max(2,Math.min(55,Math.round(Number(snapshot.progress||0)*.55))),provider_credits:snapshot.consumedCredits,error_code:null,error_message:null,evidence:{...(job.evidence||{}),generationStatus:snapshot.status,lastProviderPollAt:new Date().toISOString()}});
      const claimed=await claim(job.id,'generating',{
        stage:'rig-submitting',progress:57,generation_glb_url:snapshot.glb,provider_credits:snapshot.consumedCredits,
        evidence:{...(job.evidence||{}),generationStatus:snapshot.status,generationCompletedAt:new Date().toISOString(),rigSubmissionClaimedAt:new Date().toISOString()}
      });
      if(!claimed)return await rowById(job.id);
      let rig;
      try{
        rig=await createMeshyRiggingTask({modelUrl:snapshot.glb,heightMeters:spec.height});
      }catch(error){
        if(retryableError(error)){
          return await claim(job.id,'rig-submitting',{stage:'generating',progress:56,error_code:'retryable_rig_submit',error_message:String(error?.message||error).slice(0,1000),evidence:{...(claimed.evidence||{}),retryableRigSubmitAt:new Date().toISOString()}})||await rowById(job.id);
        }
        return failed(claimed,error?.code||'meshy_rig_submit_failed',error?.message||String(error));
      }
      try{
        return await attachProviderTask(job.id,'rig-submitting',{
          stage:'rigging',progress:58,provider_rig_task_id:rig.id,error_code:null,error_message:null,
          evidence:{...(claimed.evidence||{}),rigSubmittedAt:new Date().toISOString(),rigTaskId:rig.id}
        })||{...claimed,provider_rig_task_id:rig.id,recovery_required:true};
      }catch(error){
        // Rig task already exists. Keep the claimed stage so another tick cannot
        // submit and charge a duplicate rig. Surface the real provider ID.
        return {...claimed,provider_rig_task_id:rig.id,recovery_required:true,recovery_error:String(error?.message||error)};
      }
    }
    if(job.stage==='rigging'){
      const snapshot=summarizeMeshyRiggingTask(await getMeshyRiggingTask(job.provider_rig_task_id));
      if(isFailure(snapshot.status))return failed(job,'meshy_rigging_failed',snapshot.error||snapshot.status);
      if(!isSuccess(snapshot.status)||!snapshot.riggedGlb)return update(job.id,{progress:Math.max(58,Math.min(85,58+Math.round(Number(snapshot.progress||0)*.27))),provider_credits:Number(job.provider_credits||0)+Number(snapshot.consumedCredits||0),error_code:null,error_message:null,evidence:{...(job.evidence||{}),rigStatus:snapshot.status,lastProviderPollAt:new Date().toISOString()}});
      const claimed=await claim(job.id,'rigging',{stage:'publishing',progress:88,rigged_glb_url:snapshot.riggedGlb,walking_glb_url:snapshot.walkingGlb,running_glb_url:snapshot.runningGlb,provider_credits:Number(job.provider_credits||0)+Number(snapshot.consumedCredits||0),error_code:null,error_message:null,evidence:{...(job.evidence||{}),rigStatus:snapshot.status,rigCompletedAt:new Date().toISOString()}});
      return claimed||await rowById(job.id);
    }
    if(job.stage==='publishing'){
      const scope=String(job.city_scope||'global').replace(/[^a-zA-Z0-9_-]/g,'-')||'global';
      const version=String(job.id).replace(/[^a-zA-Z0-9_-]/g,'');
      const base=`characters/${scope}/${version}/${job.filename}`;
      const main=await persistRemoteGlb(job.rigged_glb_url,base);
      const stem=job.filename.replace(/\.glb$/i,'');
      const walk=job.walking_glb_url?await persistRemoteGlb(job.walking_glb_url,`characters/${scope}/${version}/${stem}.walk.glb`):null;
      const run=job.running_glb_url?await persistRemoteGlb(job.running_glb_url,`characters/${scope}/${version}/${stem}.run.glb`):null;
      return update(job.id,{stage:'ready',progress:100,published_path:main.path,public_url:main.url,walking_public_url:walk?.url||null,running_public_url:run?.url||null,completed_at:new Date().toISOString(),error_code:null,error_message:null,evidence:{...(job.evidence||{}),publishedAt:new Date().toISOString(),publishedBytes:main.bytes,walkingPublished:Boolean(walk),runningPublished:Boolean(run),immutableAssetVersion:version,releaseEvidence:'real provider task + validated GLB + durable storage'}});
    }
    return job;
  }catch(error){
    if(retryableError(error))return retryable(job,error);
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
  const scope=String(cityScope||'global').replace(/[^a-zA-Z0-9_-]/g,'')||'global';
  const rows=await adminRest('meshy_asset_jobs',{query:{stage:'eq.ready',city_scope:`in.(global,${scope})`,order:'completed_at.desc',limit:100}});
  const seen=new Set();
  return (rows||[]).filter(row=>{if(seen.has(row.asset_id))return false;seen.add(row.asset_id);return true}).map(publicFactoryManifestRow);
}
