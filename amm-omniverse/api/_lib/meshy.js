const API='https://api.meshy.ai/openapi/v1';

export function meshyKey(){
  return String(process.env.MESHY_API_KEY||'').trim();
}

async function request(path,{method='GET',body}={}){
  const key=meshyKey();
  if(!key){
    const error=new Error('MESHY_API_KEY is not configured in this deployment.');
    error.status=503;error.code='meshy_not_configured';throw error;
  }
  const response=await fetch(`${API}${path}`,{
    method,
    headers:{
      Authorization:`Bearer ${key}`,
      ...(body?{'Content-Type':'application/json'}:{})
    },
    body:body?JSON.stringify(body):undefined,
    cache:'no-store'
  });
  const text=await response.text();
  let data={};
  try{data=text?JSON.parse(text):{}}catch{data={raw:text.slice(0,2000)}}
  if(!response.ok){
    const error=new Error(data?.message||data?.detail||`Meshy request failed (${response.status})`);
    error.status=response.status;error.code='meshy_provider_error';error.provider=data;throw error;
  }
  return {data,headers:response.headers};
}

const ENDPOINTS={
  'image-to-3d':'/image-to-3d',
  'multi-image-to-3d':'/multi-image-to-3d',
  'text-to-3d':'/text-to-3d',
};

const RIGGING_ENDPOINT='/rigging';
const ANIMATION_ENDPOINT='/animations';

export async function listMeshyTasks(type='image-to-3d',pageSize=20){
  const endpoint=ENDPOINTS[type];
  if(!endpoint)throw Object.assign(new Error('Unsupported Meshy task type'),{status:400,code:'unsupported_meshy_type'});
  const {data}=await request(`${endpoint}?page_num=1&page_size=${Math.max(1,Math.min(100,Number(pageSize)||20))}&sort_by=-created_at`);
  return Array.isArray(data)?data:Array.isArray(data?.result)?data.result:Array.isArray(data?.tasks)?data.tasks:[];
}

export async function getMeshyTask(type,id){
  const endpoint=ENDPOINTS[type];
  if(!endpoint)throw Object.assign(new Error('Unsupported Meshy task type'),{status:400,code:'unsupported_meshy_type'});
  if(!/^[A-Za-z0-9_-]{8,120}$/.test(String(id||'')))throw Object.assign(new Error('Invalid Meshy task id'),{status:400,code:'invalid_meshy_task_id'});
  const {data}=await request(`${endpoint}/${encodeURIComponent(id)}`);
  return data;
}

export function summarizeMeshyTask(task,type){
  const modelUrls=task?.model_urls||task?.modelUrls||{};
  return {
    id:String(task?.id||task?.task_id||''),
    type:String(task?.type||type||''),
    status:String(task?.status||'UNKNOWN'),
    progress:Number(task?.progress||0),
    createdAt:task?.created_at||task?.createdAt||null,
    finishedAt:task?.finished_at||task?.finishedAt||null,
    consumedCredits:Number(task?.consumed_credits||task?.consumedCredits||0),
    thumbnailUrl:task?.thumbnail_url||task?.thumbnailUrl||null,
    glb:modelUrls.glb||null,
    fbx:modelUrls.fbx||null,
    obj:modelUrls.obj||null,
    usdz:modelUrls.usdz||null,
  };
}


export async function createMeshyTask(type,payload){
  const endpoint=ENDPOINTS[type];
  if(!endpoint||!['image-to-3d','multi-image-to-3d','text-to-3d'].includes(type)){
    throw Object.assign(new Error('Unsupported Meshy generation type'),{status:400,code:'unsupported_meshy_type'});
  }
  const body={...payload};
  if(type==='image-to-3d'){
    const imageUrl=String(body.image_url||'').trim();
    if(!imageUrl)throw Object.assign(new Error('image_url is required'),{status:400,code:'meshy_image_required'});
    body.image_url=imageUrl;
  }
  if(type==='multi-image-to-3d'){
    const urls=Array.isArray(body.image_urls)?body.image_urls.map(v=>String(v||'').trim()).filter(Boolean):[];
    if(urls.length<2||urls.length>4)throw Object.assign(new Error('image_urls must contain 2 to 4 images'),{status:400,code:'meshy_multi_image_count'});
    body.image_urls=urls;
  }
  if(type==='text-to-3d'){
    const prompt=String(body.prompt||'').trim();
    if(!prompt)throw Object.assign(new Error('prompt is required'),{status:400,code:'meshy_prompt_required'});
    body.prompt=prompt;
  }
  body.target_formats=['glb'];
  body.should_texture=body.should_texture!==false;
  body.enable_pbr=body.enable_pbr!==false;
  if(!body.ai_model)body.ai_model='meshy-7.1';
  const {data}=await request(endpoint,{method:'POST',body});
  const id=String(data?.result||data?.id||'');
  if(!id)throw Object.assign(new Error('Meshy did not return a task id'),{status:502,code:'meshy_missing_task_id',provider:data});
  return {id,type};
}


export async function createMeshyRiggingTask({inputTaskId,modelUrl,heightMeters=1.7}={}){
  const body={height_meters:Math.max(.5,Math.min(2.6,Number(heightMeters)||1.7))};
  if(String(inputTaskId||'').trim())body.input_task_id=String(inputTaskId).trim();
  else if(String(modelUrl||'').trim())body.model_url=String(modelUrl).trim();
  else throw Object.assign(new Error('input_task_id or model_url is required'),{status:400,code:'meshy_rig_source_required'});
  const {data}=await request(RIGGING_ENDPOINT,{method:'POST',body});
  const id=String(data?.result||data?.id||'');
  if(!id)throw Object.assign(new Error('Meshy did not return a rigging task id'),{status:502,code:'meshy_missing_rig_task_id',provider:data});
  return {id,type:'rig'};
}

export async function getMeshyRiggingTask(id){
  if(!/^[A-Za-z0-9_-]{8,120}$/.test(String(id||'')))throw Object.assign(new Error('Invalid Meshy rigging task id'),{status:400,code:'invalid_meshy_rig_task_id'});
  const {data}=await request(`${RIGGING_ENDPOINT}/${encodeURIComponent(id)}`);
  return data;
}

export function summarizeMeshyRiggingTask(task){
  const result=task?.result||{};
  const basic=result?.basic_animations||{};
  return {
    id:String(task?.id||''),
    type:'rig',
    status:String(task?.status||'UNKNOWN'),
    progress:Number(task?.progress||0),
    createdAt:task?.created_at||null,
    finishedAt:task?.finished_at||null,
    expiresAt:task?.expires_at||null,
    consumedCredits:Number(task?.consumed_credits||0),
    error:task?.task_error?.message||null,
    riggedGlb:result?.rigged_character_glb_url||null,
    riggedFbx:result?.rigged_character_fbx_url||null,
    walkingGlb:basic?.walking_glb_url||null,
    runningGlb:basic?.running_glb_url||null,
    precedingTasks:Number(task?.preceding_tasks||0),
  };
}

export async function createMeshyAnimationTask({rigTaskId,actionId,actionIds,motionTaskId,fps}={}){
  const rig=String(rigTaskId||'').trim();
  if(!rig)throw Object.assign(new Error('rig_task_id is required'),{status:400,code:'meshy_animation_rig_required'});
  const body={rig_task_id:rig};
  const many=Array.isArray(actionIds)?actionIds.map(Number).filter(Number.isFinite):[];
  if(many.length)body.action_ids=many.slice(0,10);
  else if(Number.isFinite(Number(actionId)))body.action_id=Number(actionId);
  else if(String(motionTaskId||'').trim())body.motion_task_id=String(motionTaskId).trim();
  else throw Object.assign(new Error('action_id, action_ids or motion_task_id is required'),{status:400,code:'meshy_animation_action_required'});
  if([24,25,30,60].includes(Number(fps)))body.post_process={operation_type:'change_fps',fps:Number(fps)};
  const {data}=await request(ANIMATION_ENDPOINT,{method:'POST',body});
  const id=String(data?.result||data?.id||'');
  if(!id)throw Object.assign(new Error('Meshy did not return an animation task id'),{status:502,code:'meshy_missing_animation_task_id',provider:data});
  return {id,type:'animation'};
}

export async function getMeshyAnimationTask(id){
  if(!/^[A-Za-z0-9_-]{8,120}$/.test(String(id||'')))throw Object.assign(new Error('Invalid Meshy animation task id'),{status:400,code:'invalid_meshy_animation_task_id'});
  const {data}=await request(`${ANIMATION_ENDPOINT}/${encodeURIComponent(id)}`);
  return data;
}

export function summarizeMeshyAnimationTask(task){
  const result=task?.result||{};
  return {
    id:String(task?.id||''),
    type:'animation',
    status:String(task?.status||'UNKNOWN'),
    progress:Number(task?.progress||0),
    createdAt:task?.created_at||null,
    finishedAt:task?.finished_at||null,
    expiresAt:task?.expires_at||null,
    consumedCredits:Number(task?.consumed_credits||0),
    error:task?.task_error?.message||null,
    animationGlb:result?.animation_glb_url||null,
    animationFbx:result?.animation_fbx_url||null,
    precedingTasks:Number(task?.preceding_tasks||0),
  };
}
