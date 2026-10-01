const API='https://api.meshy.ai/openapi/v1';

function validImageInput(value){
  const raw=String(value||'').trim();
  if(!raw)return '';
  if(/^https:\/\//i.test(raw))return raw.slice(0,12000);
  if(/^data:image\/(png|jpe?g);base64,/i.test(raw)&&raw.length<=8_000_000)return raw;
  return '';
}

function normalizeModel(value){
  const model=String(value||'').trim();
  return ['latest','meshy-7.1','meshy-6','meshy-6-lite'].includes(model)?model:'meshy-7.1';
}

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
  if(!endpoint||!['image-to-3d','multi-image-to-3d'].includes(type)){
    throw Object.assign(new Error('Unsupported Meshy generation type'),{status:400,code:'unsupported_meshy_type'});
  }
  const body={...payload};
  if(type==='image-to-3d'){
    const imageUrl=validImageInput(body.image_url);
    if(!imageUrl)throw Object.assign(new Error('image_url must be an HTTPS URL or PNG/JPEG data URI'),{status:400,code:'meshy_image_required'});
    body.image_url=imageUrl;
    body.geometry_resolution=['standard','2k','4k'].includes(String(body.geometry_resolution||''))?String(body.geometry_resolution):'4k';
    body.pose_mode=['a-pose','t-pose'].includes(String(body.pose_mode||''))?String(body.pose_mode):'a-pose';
    body.should_remesh=body.should_remesh!==false;
    body.target_polycount=Math.max(10_000,Math.min(100_000,Number(body.target_polycount)||60_000));
  }
  if(type==='multi-image-to-3d'){
    const urls=Array.isArray(body.image_urls)?body.image_urls.map(validImageInput).filter(Boolean):[];
    if(urls.length<2||urls.length>4)throw Object.assign(new Error('image_urls must contain 2 to 4 valid HTTPS URLs or PNG/JPEG data URIs'),{status:400,code:'meshy_multi_image_count'});
    body.image_urls=urls;
    body.geometry_resolution=['standard','2k'].includes(String(body.geometry_resolution||''))?String(body.geometry_resolution):'2k';
    delete body.pose_mode;
    delete body.should_remesh;
    delete body.target_polycount;
  }
  body.target_formats=['glb'];
  body.should_texture=body.should_texture!==false;
  body.enable_pbr=body.enable_pbr!==false;
  body.ai_model=normalizeModel(body.ai_model);
  const {data}=await request(endpoint,{method:'POST',body});
  const id=String(data?.result||data?.id||'');
  if(!id)throw Object.assign(new Error('Meshy did not return a task id'),{status:502,code:'meshy_missing_task_id',provider:data});
  return {id,type};
}
