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
