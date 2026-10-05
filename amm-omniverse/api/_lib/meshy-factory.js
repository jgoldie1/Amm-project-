import crypto from 'node:crypto';
import {adminRest} from './supabase-admin.js';
import {createMeshyTask,getMeshyTask,summarizeMeshyTask,createMeshyRiggingTask,getMeshyRiggingTask,summarizeMeshyRiggingTask} from './meshy.js';
import {persistRemoteGlb} from './streetverse-asset-storage.js';

export const ASSET_FACTORY_ROLES=['founder','admin','superadmin','platform-admin','asset-admin','ai-cto'];

const CATALOG=[
 {assetId:'sv-james-body-base-v1',filename:'SV_HERO_JAMES_BODY_BASE_V1.glb',generationType:'text-to-3d',height:1.55,heritage:'identity-neutral',ageLane:'youth',role:'James boy/youth body base; neutral face until an approved reference image is supplied; final height/age proportions are reference-tuned',prompt:'game-ready realistic boy/youth male hero body base, neutral non-identifying face, age-appropriate youthful proportions, no adult physique, full body, A-pose for humanoid rigging, PBR textures, clean mobile-web topology, no celebrity likeness, no logos, StreetVerse youth character body base'},
 {assetId:'sv-female-body-base-v1',filename:'SV_BODY_FEMALE_BASE_V1.glb',generationType:'text-to-3d',height:1.68,heritage:'configurable-black-mixed-global',ageLane:'adult',role:'reusable adult female body base for Black, mixed-heritage and multinational StreetVerse characters; identity comes from configurable head, skin, hair and styling variants',prompt:'game-ready realistic adult female body base for a diverse Black and mixed-heritage global character system, neutral non-identifying face, balanced natural proportions, full body, A-pose for humanoid rigging, PBR textures, clean mobile-web topology, configurable skin tone hair face and wardrobe modules, avoid stereotyped features, no celebrity likeness, no logos, reusable StreetVerse female character base'},
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

function customSpecFromJob(job){
  const raw=job?.evidence?.worldForgerSpec;
  if(!raw||typeof raw!=='object')return null;
  const kind=['building','character','vehicle','prop','street-furniture','infrastructure'].includes(String(raw.kind))?String(raw.kind):'prop';
  return{
    assetId:String(job.asset_id||raw.assetId||'').slice(0,120),
    filename:String(job.filename||raw.filename||'WORLD_FORGER_ASSET.glb').slice(0,180),
    generationType:['text-to-3d','image-to-3d','multi-image-to-3d'].includes(String(job.generation_type))?String(job.generation_type):'text-to-3d',
    height:Number(raw.height)||1.8,
    heritage:'world-forger',
    ageLane:kind==='character'?'adult':'n/a',
    role:String(raw.label||kind),
    prompt:String(job.prompt||raw.prompt||'').slice(0,4000),
    assetKind:kind,
    rigRequired:kind==='character',
    targetPolycount:Math.max(8000,Math.min(100000,Number(raw.targetPolycount)||(
      kind==='building'?85000:kind==='vehicle'?70000:kind==='character'?45000:35000
    ))),
    worldForger:true,
  };
}
function specForJob(job){
  return customSpecFromJob(job)||specFor(job.asset_id);
}
function specNeedsRig(spec){
  return spec?.rigRequired!==false&&(spec?.assetKind?spec.assetKind==='character':true);
}
function publishFolderForSpec(spec){
  const kind=String(spec?.assetKind||'character');
  if(kind==='building')return'buildings';
  if(kind==='vehicle')return'vehicles';
  if(kind==='infrastructure')return'infrastructure';
  if(kind==='street-furniture')return'props';
  if(kind==='prop')return'props';
  return'characters';
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

async function submitQueuedFactoryJob(job){
  if(!job||job.stage!=='queued')return job;
  if(job.depends_on_job_id){
    const dependency=await rowById(job.depends_on_job_id);
    if(!dependency||dependency.stage!=='ready')return job;
  }
  const spec=specForJob(job);
  const prompt=job.prompt||spec.prompt||defaultPrompt(spec);
  const sourceImageUrl=String(job.source_image_url||'').trim();
  const payload=spec.generationType==='image-to-3d'
    ?{image_url:sourceImageUrl,ai_model:'meshy-7.1',target_formats:['glb'],should_texture:true,enable_pbr:true,should_remesh:true,target_polycount:45000,pose_mode:'a-pose'}
    :{prompt,ai_model:'meshy-7.1',target_formats:['glb'],should_texture:true,enable_pbr:true,should_remesh:true,target_polycount:Math.max(8000,Math.min(100000,Number(spec.targetPolycount)||45000)),pose_mode:'a-pose'};
  if(spec.generationType==='image-to-3d'&&!sourceImageUrl)return failed(job,'approved_reference_image_required','Approved reference image is required before an identity-based Meshy job can start.');

  const submitting=await claim(job.id,'queued',{stage:'generation-submitting',progress:1,evidence:{...(job.evidence||{}),dependencySatisfiedAt:new Date().toISOString(),generationSubmissionClaimedAt:new Date().toISOString()}});
  if(!submitting)return await rowById(job.id);

  let task;
  try{
    task=await createMeshyTask(spec.generationType,payload);
  }catch(error){
    if(retryableError(error)){
      return await claim(job.id,'generation-submitting',{stage:'queued',progress:0,error_code:'retryable_generation_submit',error_message:String(error?.message||error).slice(0,1000),evidence:{...(submitting.evidence||{}),retryableGenerationSubmitAt:new Date().toISOString()}})||await rowById(job.id);
    }
    return failed(submitting,error?.code||'meshy_generation_submit_failed',error?.message||String(error));
  }

  try{
    return await attachProviderTask(job.id,'generation-submitting',{
      stage:'generating',progress:2,provider_generation_task_id:task.id,error_code:null,error_message:null,
      evidence:{...(submitting.evidence||{}),generationSubmittedAt:new Date().toISOString(),generationTaskId:task.id}
    })||{...submitting,provider_generation_task_id:task.id,recovery_required:true};
  }catch(error){
    return {...submitting,provider_generation_task_id:task.id,recovery_required:true,recovery_error:String(error?.message||error)};
  }
}

export async function startCircleParkBootstrapWave(user){
  requireFactoryAuthority(user);
  const waveId=crypto.randomUUID();
  const sequence=[
    {assetId:'sv-james-body-base-v1',cityScope:'global',sequenceIndex:1,dependsOn:null,label:'James boy/youth body base'},
    {assetId:'sv-female-body-base-v1',cityScope:'global',sequenceIndex:2,dependsOn:'previous',label:'Reusable female body base'},
    {assetId:'sv-black-man-youngadult-01',cityScope:'chicago-circle-park',sequenceIndex:3,dependsOn:'female',label:'Circle Park young adult male resident'},
    {assetId:'sv-black-woman-youngadult-01',cityScope:'chicago-circle-park',sequenceIndex:4,dependsOn:'female',label:'Circle Park young adult female resident'},
    {assetId:'sv-black-man-adult-01',cityScope:'chicago-circle-park',sequenceIndex:5,dependsOn:'female',label:'Circle Park adult male resident'},
    {assetId:'sv-black-woman-adult-01',cityScope:'chicago-circle-park',sequenceIndex:6,dependsOn:'female',label:'Circle Park adult female resident'},
  ];
  const created=[];
  let jamesJob=null;
  let femaleJob=null;
  for(const item of sequence){
    const spec=specFor(item.assetId);
    const prompt=spec.prompt||defaultPrompt(spec);
    const dependsOnJobId=item.dependsOn==='previous'?jamesJob?.id:item.dependsOn==='female'?femaleJob?.id:null;
    const rows=await adminRest('meshy_asset_jobs',{method:'POST',body:{
      owner_user_id:user.id,asset_id:spec.assetId,filename:spec.filename,city_scope:item.cityScope,
      wave_id:waveId,sequence_index:item.sequenceIndex,depends_on_job_id:dependsOnJobId||null,
      generation_type:spec.generationType,prompt,source_image_url:null,stage:'queued',progress:0,
      evidence:{authority:'founder-or-admin',ceoObjective:'product-readiness',distinguishedEngineeringOwner:true,provider:'meshy.ai',wave:'james-female-circle-park-v1',waveLabel:item.label,queuedAt:new Date().toISOString()}
    }});
    const job=rows?.[0];
    if(!job)throw Object.assign(new Error('meshy_wave_job_persist_failed'),{status:503,code:'meshy_wave_job_persist_failed'});
    created.push(job);
    if(item.assetId==='sv-james-body-base-v1')jamesJob=job;
    if(item.assetId==='sv-female-body-base-v1')femaleJob=job;
  }
  const started=jamesJob?await submitQueuedFactoryJob(jamesJob):null;
  return {waveId,jobs:created.map(job=>job.id),firstJob:started,sequence:'James boy/youth body base → Black/mixed-global female body base → four Circle Park residents in parallel'};
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

export async function importExistingMeshyTask(user,{assetId,taskId,type='image-to-3d',cityScope='global'}={}){
  requireFactoryAuthority(user);
  const spec=specFor(assetId);
  const providerType=['image-to-3d','multi-image-to-3d','text-to-3d'].includes(String(type||''))?String(type):'image-to-3d';
  const providerTaskId=String(taskId||'').trim();
  if(!providerTaskId)throw Object.assign(new Error('meshy_existing_task_id_required'),{status:400,code:'meshy_existing_task_id_required'});

  const duplicate=await adminRest('meshy_asset_jobs',{query:{provider_generation_task_id:`eq.${providerTaskId}`,limit:1}});
  if(duplicate?.[0])return duplicate[0];

  const snapshot=summarizeMeshyTask(await getMeshyTask(providerType,providerTaskId),providerType);
  if(!isSuccess(snapshot.status)||!snapshot.glb){
    throw Object.assign(new Error(`Meshy task is not ready for import (${snapshot.status||'UNKNOWN'})`),{status:409,code:'meshy_existing_task_not_ready'});
  }

  const rows=await adminRest('meshy_asset_jobs',{method:'POST',body:{
    owner_user_id:user.id,
    asset_id:spec.assetId,
    filename:spec.filename,
    city_scope:String(cityScope||'global').slice(0,80),
    generation_type:providerType,
    prompt:spec.prompt||null,
    source_image_url:null,
    stage:'rig-submitting',
    progress:57,
    provider_generation_task_id:providerTaskId,
    generation_glb_url:snapshot.glb,
    provider_credits:snapshot.consumedCredits,
    evidence:{
      authority:'founder-or-admin',
      provider:'meshy.ai',
      importedExistingTask:true,
      importedAt:new Date().toISOString(),
      originalProviderStatus:snapshot.status,
      generationTaskId:providerTaskId,
      reusedGenerationCredits:true
    }
  }});
  const imported=rows?.[0];
  if(!imported)throw Object.assign(new Error('meshy_existing_task_import_persist_failed'),{status:503,code:'meshy_existing_task_import_persist_failed'});

  let rig;
  try{
    rig=await createMeshyRiggingTask({modelUrl:snapshot.glb,heightMeters:spec.height});
  }catch(error){
    if(retryableError(error)){
      return await update(imported.id,{
        stage:'generating',
        progress:56,
        error_code:'retryable_import_rig_submit',
        error_message:String(error?.message||error).slice(0,1000),
        evidence:{...(imported.evidence||{}),retryableImportRigSubmitAt:new Date().toISOString()}
      });
    }
    return failed(imported,error?.code||'meshy_import_rig_submit_failed',error?.message||String(error));
  }

  try{
    return await attachProviderTask(imported.id,'rig-submitting',{
      stage:'rigging',
      progress:58,
      provider_rig_task_id:rig.id,
      error_code:null,
      error_message:null,
      evidence:{...(imported.evidence||{}),rigSubmittedAt:new Date().toISOString(),rigTaskId:rig.id,importedExistingTask:true}
    })||{...imported,provider_rig_task_id:rig.id,recovery_required:true};
  }catch(error){
    return {...imported,provider_rig_task_id:rig.id,recovery_required:true,recovery_error:String(error?.message||error)};
  }
}

export async function startWorldForgerFactoryJob(user,input={}){
  requireFactoryAuthority(user);
  if(String(input.confirmCreditUse||'')!=='START_MESHY_WORLD_FORGE'){
    throw Object.assign(new Error('world_forger_credit_confirmation_required'),{status:400,code:'world_forger_credit_confirmation_required'});
  }
  if(input.rightsAcknowledged!==true){
    throw Object.assign(new Error('world_forger_rights_acknowledgement_required'),{status:400,code:'world_forger_rights_acknowledgement_required'});
  }
  const kind=['building','character','vehicle','prop','street-furniture','infrastructure'].includes(String(input.kind))?String(input.kind):'prop';
  const assetId=String(input.assetId||'').trim().toLowerCase().replace(/[^a-z0-9_-]/g,'-').slice(0,120);
  const label=String(input.label||kind).trim().slice(0,160);
  const prompt=String(input.prompt||'').trim().slice(0,4000);
  const generationType=['text-to-3d','image-to-3d'].includes(String(input.generationType))?String(input.generationType):'text-to-3d';
  const imageUrl=String(input.imageUrl||'').trim().slice(0,1600);
  if(!assetId.startsWith('wf-'))throw Object.assign(new Error('world_forger_asset_id_must_start_wf'),{status:400,code:'world_forger_asset_id_must_start_wf'});
  if(prompt.length<20&&generationType==='text-to-3d')throw Object.assign(new Error('world_forger_prompt_required'),{status:400,code:'world_forger_prompt_required'});
  if(generationType==='image-to-3d'&&!imageUrl)throw Object.assign(new Error('world_forger_reference_image_required'),{status:400,code:'world_forger_reference_image_required'});
  const extSafe=label.toUpperCase().replace(/[^A-Z0-9]+/g,'_').replace(/(^_|_$)/g,'').slice(0,80)||'WORLD_FORGER_ASSET';
  const filename=`${extSafe}.glb`;
  const spec={
    assetId,filename,kind,label,prompt,
    generationType,
    height:Math.max(.2,Math.min(4,Number(input.height)||1.8)),
    targetPolycount:Math.max(8000,Math.min(100000,Number(input.targetPolycount)||(
      kind==='building'?85000:kind==='vehicle'?70000:kind==='character'?45000:35000
    ))),
    districtId:String(input.districtId||'global').slice(0,120),
    sourceKind:String(input.sourceKind||'conceptual').slice(0,80),
    streetViewReferenceOnly:Boolean(input.streetViewReferenceOnly),
    cadPlan:input.cadPlan&&typeof input.cadPlan==='object'?input.cadPlan:null,
  };
  if(spec.streetViewReferenceOnly&&generationType==='image-to-3d'){
    throw Object.assign(new Error('street_view_reference_cannot_drive_image_to_3d'),{status:400,code:'street_view_reference_cannot_drive_image_to_3d'});
  }
  const queuedRows=await adminRest('meshy_asset_jobs',{method:'POST',body:{
    owner_user_id:user.id,
    asset_id:assetId,
    filename,
    city_scope:String(input.cityScope||spec.districtId||'global').replace(/[^a-zA-Z0-9_-]/g,'-').slice(0,80)||'global',
    generation_type:generationType,
    prompt:generationType==='text-to-3d'?prompt:null,
    source_image_url:generationType==='image-to-3d'?imageUrl:null,
    stage:'queued',
    progress:0,
    evidence:{
      authority:'founder-or-admin',
      provider:'meshy.ai',
      queuedAt:new Date().toISOString(),
      worldForger:true,
      worldForgerSpec:spec,
      rightsAcknowledged:true,
      creditUseConfirmed:'START_MESHY_WORLD_FORGE',
      note:'World Forger plan persisted before provider task creation.'
    }
  }});
  const queued=queuedRows?.[0];
  if(!queued)throw Object.assign(new Error('world_forger_factory_queue_persist_failed'),{status:503,code:'world_forger_factory_queue_persist_failed'});
  return submitQueuedFactoryJob(queued);
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
  const spec=specForJob(job);
  try{
    if(job.stage==='queued')return submitQueuedFactoryJob(job);
    if(job.stage==='generating'){
      const snapshot=summarizeMeshyTask(await getMeshyTask(job.generation_type,job.provider_generation_task_id),job.generation_type);
      if(isFailure(snapshot.status))return failed(job,'meshy_generation_failed',snapshot.status);
      if(!isSuccess(snapshot.status)||!snapshot.glb)return update(job.id,{progress:Math.max(2,Math.min(55,Math.round(Number(snapshot.progress||0)*.55))),provider_credits:snapshot.consumedCredits,error_code:null,error_message:null,evidence:{...(job.evidence||{}),generationStatus:snapshot.status,lastProviderPollAt:new Date().toISOString()}});
      if(!specNeedsRig(spec)){
        const claimed=await claim(job.id,'generating',{
          stage:'publishing',progress:88,generation_glb_url:snapshot.glb,rigged_glb_url:snapshot.glb,provider_credits:snapshot.consumedCredits,
          evidence:{...(job.evidence||{}),generationStatus:snapshot.status,generationCompletedAt:new Date().toISOString(),rigSkipped:true,rigSkipReason:'world-forger-non-humanoid-asset'}
        });
        return claimed||await rowById(job.id);
      }
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
      const folder=publishFolderForSpec(spec);
      const base=`${folder}/${scope}/${version}/${job.filename}`;
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
