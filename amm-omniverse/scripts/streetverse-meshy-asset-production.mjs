import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'

const ROOT=process.cwd()
const args=Object.fromEntries(process.argv.slice(2).filter(x=>x.startsWith('--')).map(item=>{
  const [key,...rest]=item.slice(2).split('=')
  return [key,rest.join('=')||'true']
}))
const profileArg=String(args.profile||'').trim()
const outputRoot=path.resolve(String(args.output||'../release-evidence/streetverse-meshy-production'))
const confirm=String(args['confirm-paid-generation']||process.env.CONFIRM_PAID_GENERATION||'').toUpperCase()
const apiKey=String(process.env.MESHY_API_KEY||'').trim()
const textureResolution=String(args['texture-resolution']||'2k')
const geometryResolution=String(args['geometry-resolution']||'2k')
const pollMs=Math.max(5000,Number(args['poll-ms']||10000))
const maxPolls=Math.max(30,Number(args['max-polls']||180))
const API='https://api.meshy.ai/openapi/v2/text-to-3d'

if(confirm!=='YES')throw new Error('PAID_GENERATION_NOT_CONFIRMED: pass --confirm-paid-generation=YES only after approving Meshy credit use.')
if(!apiKey)throw new Error('MESHY_API_KEY_REQUIRED')
if(!['2k','4k'].includes(geometryResolution))throw new Error('geometry-resolution must be 2k or 4k')
if(!['2k','4k','8k'].includes(textureResolution))throw new Error('texture-resolution must be 2k, 4k, or 8k')

const config=JSON.parse(fs.readFileSync(path.join(ROOT,'config/streetverse-meshy-production-profiles.json'),'utf8'))
const allProfiles=config.profiles||[]
const requested=profileArg==='all-first-wave'
  ? allProfiles.filter(p=>['hero-player','premium-resident-a','sport-sedan','city-transit-train'].includes(p.id))
  : allProfiles.filter(p=>p.id===profileArg)
if(!requested.length)throw new Error('UNKNOWN_PROFILE: '+profileArg)

const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms))
const headers={Authorization:`Bearer ${apiKey}`,'Content-Type':'application/json'}

async function meshy(pathname,{method='GET',body}={}){
  const response=await fetch(pathname.startsWith('http')?pathname:API+pathname,{
    method,
    headers,
    ...(body?{body:JSON.stringify(body)}:{})
  })
  const text=await response.text()
  let data={}
  try{data=text?JSON.parse(text):{}}catch{data={message:text}}
  if(!response.ok){
    const error=new Error(String(data?.message||data?.error?.message||data?.error||`Meshy HTTP ${response.status}`))
    error.statusCode=response.status
    throw error
  }
  return data
}

async function waitForTask(id,stage){
  for(let i=0;i<maxPolls;i++){
    const task=await meshy('/'+encodeURIComponent(id))
    const status=String(task.status||'').toUpperCase()
    process.stdout.write(JSON.stringify({stage,id,status,progress:task.progress??null,consumedCredits:task.consumed_credits??null})+'\n')
    if(status==='SUCCEEDED')return task
    if(['FAILED','CANCELED','CANCELLED'].includes(status))throw new Error(`${stage.toUpperCase()}_FAILED: ${task.task_error?.message||status}`)
    await wait(pollMs)
  }
  throw new Error(`${stage.toUpperCase()}_POLL_TIMEOUT`)
}

async function download(url,target){
  const response=await fetch(url)
  if(!response.ok)throw new Error(`DOWNLOAD_FAILED ${response.status}: ${target}`)
  const bytes=Buffer.from(await response.arrayBuffer())
  fs.mkdirSync(path.dirname(target),{recursive:true})
  fs.writeFileSync(target,bytes)
  return bytes
}

function sha256(bytes){return crypto.createHash('sha256').update(bytes).digest('hex')}

async function produce(profile){
  const folder=path.join(outputRoot,profile.id)
  fs.mkdirSync(folder,{recursive:true})
  const previewPayload={
    mode:'preview',
    prompt:profile.prompt,
    ai_model:config.model||'meshy-7.1',
    geometry_resolution:geometryResolution,
    should_remesh:true,
    target_polycount:Number(profile.targetPolycount||60000),
    target_formats:['glb'],
    auto_size:true,
    origin_at:'bottom',
    moderation:true,
    ...(profile.poseMode?{pose_mode:profile.poseMode}:{})
  }
  const previewCreate=await meshy('',{method:'POST',body:previewPayload})
  const previewId=String(previewCreate.result||'')
  if(!previewId)throw new Error('MESHY_PREVIEW_TASK_ID_MISSING')
  const preview=await waitForTask(previewId,'preview')

  const refineCreate=await meshy('',{method:'POST',body:{
    mode:'refine',
    preview_task_id:previewId,
    enable_pbr:true,
    texture_resolution:textureResolution,
    texture_prompt:profile.texturePrompt,
    target_formats:['glb'],
    auto_size:true,
    origin_at:'bottom',
    moderation:true,
  }})
  const refineId=String(refineCreate.result||'')
  if(!refineId)throw new Error('MESHY_REFINE_TASK_ID_MISSING')
  const refine=await waitForTask(refineId,'refine')
  const glbUrl=String(refine.model_urls?.glb||'')
  if(!glbUrl)throw new Error('MESHY_REFINED_GLB_MISSING')

  const glbPath=path.join(folder,`${profile.id}.glb`)
  const glb=await download(glbUrl,glbPath)
  if(glb.subarray(0,4).toString('ascii')!=='glTF')throw new Error('DOWNLOADED_FILE_IS_NOT_GLB: '+profile.id)

  let thumbnail=null
  if(refine.thumbnail_url){
    const ext=/\.png(?:\?|$)/i.test(refine.thumbnail_url)?'.png':'.jpg'
    thumbnail=path.join(folder,`thumbnail${ext}`)
    await download(refine.thumbnail_url,thumbnail)
  }

  const manifest={
    schema:'tryamm.streetverse.meshy-production-evidence.v1',
    generatedAt:new Date().toISOString(),
    provider:'meshy',
    profileId:profile.id,
    kind:profile.kind,
    model:config.model||'meshy-7.1',
    geometryResolution,
    textureResolution,
    targetPolycount:profile.targetPolycount,
    targetRuntimePath:profile.targetPath,
    previewTaskId:previewId,
    refineTaskId:refineId,
    consumedCredits:{
      preview:Number(preview.consumed_credits||0),
      refine:Number(refine.consumed_credits||0),
      total:Number(preview.consumed_credits||0)+Number(refine.consumed_credits||0),
    },
    artifact:{
      file:path.relative(outputRoot,glbPath),
      bytes:glb.length,
      sha256:sha256(glb),
      thumbnail:thumbnail?path.relative(outputRoot,thumbnail):null,
    },
    gates:{
      humanVisualReview:false,
      assetPassportCertified:false,
      runtimePerformanceEvidence:false,
      collisionInteractionValidated:false,
      productionPublishAllowed:false,
    },
    promotionRule:'Do not copy this artifact into a live StreetVerse asset path until human visual review, Asset Passport/provenance, runtime budget, collision/interaction, and target-device checks pass.',
  }
  fs.writeFileSync(path.join(folder,'manifest.json'),JSON.stringify(manifest,null,2))
  return manifest
}

fs.mkdirSync(outputRoot,{recursive:true})
const results=[]
for(const profile of requested)results.push(await produce(profile))
const batch={
  schema:'tryamm.streetverse.meshy-production-batch.v1',
  generatedAt:new Date().toISOString(),
  paidGenerationConfirmed:true,
  productionPublishAllowed:false,
  profiles:results,
  totalCredits:results.reduce((sum,item)=>sum+item.consumedCredits.total,0),
}
fs.writeFileSync(path.join(outputRoot,'batch-manifest.json'),JSON.stringify(batch,null,2))
console.log(JSON.stringify(batch,null,2))
