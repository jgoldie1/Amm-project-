import {getAccessToken} from './supabaseClient'

export type MeshyWorldKind='character'|'vehicle'|'building'|'interior'|'environment'|'prop'|'animal'|'road'
export type MeshyWorldQuality='mobile'|'premium'|'hero'

export type MeshyWorldArtifact={
 provider:'meshy.ai'
 taskId:string
 status:string
 glb:string
 thumbnailUrl?:string|null
 consumedCredits?:number
 progress?:number
 assetKind:MeshyWorldKind
 qualityTier:MeshyWorldQuality
 pbr:true
 textured:true
 generatedAt:string
}

const TERMINAL_SUCCESS=new Set(['SUCCEEDED','SUCCESS','COMPLETED','DONE'])
const TERMINAL_FAILURE=new Set(['FAILED','CANCELED','CANCELLED','EXPIRED','ERROR'])
const wait=(ms:number)=>new Promise(resolve=>setTimeout(resolve,ms))

function targetPolycount(tier:MeshyWorldQuality){
 if(tier==='mobile')return 18000
 if(tier==='hero')return 70000
 return 42000
}

async function authHeaders(){
 const token=await getAccessToken()
 if(!token)throw new Error('meshy-auth-required')
 return {'content-type':'application/json',Authorization:`Bearer ${token}`}
}

async function readJson(response:Response){
 const text=await response.text()
 try{return text?JSON.parse(text):{}}catch{return {error:text||`API ${response.status}`}}
}

export async function getMeshyWorldProviderHealth(){
 try{
  const r=await fetch('/api/meshy/health',{cache:'no-store'})
  const d=await readJson(r)
  return{ok:r.ok&&Boolean(d?.configured),configured:Boolean(d?.configured),provider:'meshy.ai'}
 }catch{return{ok:false,configured:false,provider:'meshy.ai'}}
}

export async function generateMeshyWorldArtifact(input:{
 assetKind:MeshyWorldKind
 prompt:string
 qualityTier:MeshyWorldQuality
 pollIntervalMs?:number
 timeoutMs?:number
}):Promise<MeshyWorldArtifact>{
 const prompt=String(input.prompt||'').trim()
 if(!prompt)throw new Error('meshy-world-prompt-required')

 const health=await getMeshyWorldProviderHealth()
 if(!health.configured)throw new Error('meshy-not-configured')

 const headers=await authHeaders()
 const generation=await fetch('/api/meshy/generate',{
  method:'POST',
  headers,
  body:JSON.stringify({
   type:'text-to-3d',
   prompt,
   ai_model:'meshy-7.1',
   should_texture:true,
   enable_pbr:true,
   should_remesh:true,
   target_polycount:targetPolycount(input.qualityTier),
   geometry_resolution:input.qualityTier==='hero'?'4k':'2k',
  }),
 })
 const created=await readJson(generation)
 if(!generation.ok||!created?.task?.id)throw new Error(String(created?.message||created?.error||'meshy-generation-submit-failed'))

 const taskId=String(created.task.id)
 const interval=Math.max(2000,Math.min(10000,Number(input.pollIntervalMs)||4000))
 const timeout=Math.max(30000,Math.min(300000,Number(input.timeoutMs)||180000))
 const started=Date.now()

 while(Date.now()-started<timeout){
  await wait(interval)
  const poll=await fetch(`/api/meshy/task?type=text-to-3d&id=${encodeURIComponent(taskId)}`,{headers:{Authorization:headers.Authorization},cache:'no-store'})
  const data=await readJson(poll)
  if(!poll.ok)throw new Error(String(data?.message||data?.error||'meshy-task-poll-failed'))
  const task=data?.task||{}
  const status=String(task.status||'').toUpperCase()
  if(TERMINAL_FAILURE.has(status))throw new Error('meshy-task-'+status.toLowerCase())
  if(TERMINAL_SUCCESS.has(status)){
   const glb=String(task.glb||'').trim()
   if(!glb)throw new Error('meshy-task-complete-without-glb')
   return{
    provider:'meshy.ai',
    taskId,
    status,
    glb,
    thumbnailUrl:task.thumbnailUrl||null,
    consumedCredits:Number(task.consumedCredits||0),
    progress:Number(task.progress||100),
    assetKind:input.assetKind,
    qualityTier:input.qualityTier,
    pbr:true,
    textured:true,
    generatedAt:new Date().toISOString(),
   }
  }
 }
 throw new Error('meshy-task-timeout')
}
