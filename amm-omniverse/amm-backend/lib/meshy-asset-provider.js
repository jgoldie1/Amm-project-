'use strict'

const {createProviderResilience}=require('./provider-resilience')

const DEFAULT_BASE_URL='https://api.meshy.ai'
const ALLOWED_TEXTURE_RESOLUTIONS=new Set(['2k','4k','8k'])

function cleanPrompt(value,label='prompt'){
  const text=String(value||'').trim()
  if(!text)throw new Error(`${label.toUpperCase()}_REQUIRED`)
  if(text.length>800)throw new Error(`${label.toUpperCase()}_TOO_LONG`)
  return text
}

function safeTaskId(value){
  const id=String(value||'').trim()
  if(!id||id.length>160||!/^[A-Za-z0-9_-]+$/.test(id))throw new Error('INVALID_MESHY_TASK_ID')
  return id
}

function createMeshyAssetProvider({apiKey=process.env.MESHY_API_KEY,fetchImpl=global.fetch,baseUrl=DEFAULT_BASE_URL}={}){
  if(typeof fetchImpl!=='function')throw new Error('MESHY_FETCH_UNAVAILABLE')
  const configured=Boolean(String(apiKey||'').trim())
  const root=String(baseUrl||DEFAULT_BASE_URL).replace(/\/$/,'')
  const resilience=createProviderResilience({provider:'meshy',fetchImpl,timeoutMs:20_000,maxConcurrent:4,failureThreshold:4,resetMs:45_000,maxRetries:1})

  async function request(path,{method='GET',body}={}){
    if(!configured)throw Object.assign(new Error('MESHY_NOT_CONFIGURED'),{statusCode:503})
    const response=await resilience.fetch(root+path,{
      method,
      headers:{
        Authorization:`Bearer ${apiKey}`,
        ...(body?{'Content-Type':'application/json'}:{}),
      },
      ...(body?{body:JSON.stringify(body)}:{}),
    },{retrySafe:method==='GET',maxRetries:method==='GET'?1:0})
    let data=null
    try{data=await response.json()}catch{}
    if(!response.ok){
      const message=String(data?.message||data?.error?.message||data?.error||`Meshy HTTP ${response.status}`).slice(0,500)
      const error=Object.assign(new Error(message),{statusCode:response.status,provider:'meshy'})
      throw error
    }
    return data
  }

  async function createPreview({prompt,targetPolycount=60000,poseMode}={}){
    const payload={
      mode:'preview',
      prompt:cleanPrompt(prompt),
      ai_model:'latest',
      should_remesh:true,
      target_polycount:Math.max(10000,Math.min(150000,Number(targetPolycount)||60000)),
      target_formats:['glb'],
    }
    if(poseMode==='a-pose'||poseMode==='t-pose')payload.pose_mode=poseMode
    const data=await request('/openapi/v2/text-to-3d',{method:'POST',body:payload})
    if(!data?.result)throw new Error('MESHY_PREVIEW_TASK_ID_MISSING')
    return {provider:'meshy',stage:'preview',taskId:String(data.result)}
  }

  async function createRefine({previewTaskId,texturePrompt,textureResolution='4k'}={}){
    const resolution=ALLOWED_TEXTURE_RESOLUTIONS.has(textureResolution)?textureResolution:'4k'
    const payload={
      mode:'refine',
      preview_task_id:safeTaskId(previewTaskId),
      enable_pbr:true,
      texture_resolution:resolution,
      target_formats:['glb'],
      auto_size:true,
    }
    if(texturePrompt)payload.texture_prompt=cleanPrompt(texturePrompt,'texture_prompt')
    const data=await request('/openapi/v2/text-to-3d',{method:'POST',body:payload})
    if(!data?.result)throw new Error('MESHY_REFINE_TASK_ID_MISSING')
    return {provider:'meshy',stage:'refine',taskId:String(data.result)}
  }

  async function getTask(taskId){
    const id=safeTaskId(taskId)
    const data=await request(`/openapi/v2/text-to-3d/${encodeURIComponent(id)}`)
    return {
      provider:'meshy',
      id:String(data?.id||id),
      type:data?.type||null,
      status:data?.status||null,
      progress:Number.isFinite(Number(data?.progress))?Number(data.progress):null,
      modelUrls:data?.model_urls||{},
      thumbnailUrl:data?.thumbnail_url||null,
      taskError:data?.task_error?.message||null,
    }
  }

  return{
    id:'meshy',
    configured,
    capabilities:['text-to-3d-preview','text-to-3d-refine','pbr','glb'],
    createPreview,
    createRefine,
    getTask,
    resilienceStatus:resilience.status,
  }
}

module.exports={createMeshyAssetProvider,cleanPrompt,safeTaskId,DEFAULT_BASE_URL}