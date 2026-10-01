'use strict'

const express=require('express')
const {createMeshyAssetProvider}=require('../lib/meshy-asset-provider')

function bearer(req){
  const header=String(req.headers.authorization||'')
  return header.startsWith('Bearer ')?header.slice(7):null
}

function hasAssetForgeRole(user){
  const role=String(user?.app_metadata?.role||'').toLowerCase()
  return ['owner','admin','ops','release','asset'].includes(role)
}


const CIRCLE_PARK_PRODUCTION_WAVE=Object.freeze([
  {id:'sv-black-man-adult-01',kind:'character',prompt:'Game-ready realistic Black Chicago adult man, everyday contemporary streetwear, neutral A-pose, full body, clean silhouette, mobile game NPC, no logos',poseMode:'a-pose',targetPolycount:45000},
  {id:'sv-black-woman-adult-01',kind:'character',prompt:'Game-ready realistic Black Chicago adult woman, everyday contemporary streetwear, neutral A-pose, full body, clean silhouette, mobile game NPC, no logos',poseMode:'a-pose',targetPolycount:45000},
  {id:'sv-black-man-senior-01',kind:'character',prompt:'Game-ready realistic Black Chicago senior man, casual neighborhood clothing, neutral A-pose, full body, clean silhouette, mobile game NPC, no logos',poseMode:'a-pose',targetPolycount:45000},
  {id:'sv-black-woman-senior-01',kind:'character',prompt:'Game-ready realistic Black Chicago senior woman, casual neighborhood clothing, neutral A-pose, full body, clean silhouette, mobile game NPC, no logos',poseMode:'a-pose',targetPolycount:45000},
  {id:'sv-chicago-sedan-01',kind:'vehicle',prompt:'Realistic unbranded modern four-door Chicago street sedan, game-ready exterior, closed doors, clean topology, neutral materials, mobile open-world game asset',targetPolycount:50000},
  {id:'sv-chicago-suv-01',kind:'vehicle',prompt:'Realistic unbranded modern midsize SUV for a Chicago neighborhood, game-ready exterior, closed doors, clean topology, neutral materials, mobile open-world game asset',targetPolycount:50000},
])

function createAssetForgeRouter({supabase,provider=createMeshyAssetProvider()}){
  const router=express.Router()

  router.get('/health',(_req,res)=>res.json({
    ok:true,
    nativeProvider:{
      id:'tryamm-native',
      configured:true,
      externalApiRequired:false,
      creditsRequired:false,
      mode:'build-time/CI procedural GLB foundry',
    },
    optionalProvider:{
      id:'meshy',
      configured:provider.configured,
      capabilities:provider.capabilities,
    },
    providerPriority:['tryamm-native','meshy','manual-artist'],
    publishAuthority:false,
    truth:'Native or external generation output remains uncertified until Asset Passport + rights + performance + human visual review pass.',
  }))

  async function requireAssetOperator(req,res,next){
    const token=bearer(req)
    if(!token)return res.status(401).json({error:'Authentication required'})
    const {data,error}=await supabase.auth.getUser(token)
    if(error||!data?.user)return res.status(401).json({error:'Invalid session'})
    if(!hasAssetForgeRole(data.user))return res.status(403).json({error:'Asset Forge operator role required'})
    req.user=data.user
    next()
  }

  router.use(requireAssetOperator)

  router.get('/production-wave',(_req,res)=>res.json({
    schema:'tryamm.circle-park-production-wave.v1',
    mode:'credit-guarded',
    jobs:CIRCLE_PARK_PRODUCTION_WAVE,
    count:CIRCLE_PARK_PRODUCTION_WAVE.length,
    bjV6:{mode:'image-reference-only',publishPath:'/tryamm-assets/meshy/characters/SV_HERO_BJ_STUBBS_V6.glb'},
    nativeFirst:['buildings','roads','sidewalks','trees','grass','benches','lights','repeatable-props'],
  }))

  router.post('/production-wave/start',async(req,res)=>{
    const requested=Array.isArray(req.body?.ids)?new Set(req.body.ids.map(String)):null
    const jobs=CIRCLE_PARK_PRODUCTION_WAVE.filter(job=>!requested||requested.has(job.id))
    if(!jobs.length)return res.status(400).json({error:'No approved production-wave jobs selected'})
    if(jobs.length>6)return res.status(400).json({error:'Production-wave hard cap exceeded'})
    const submitted=[]
    for(const job of jobs){
      try{
        const task=await provider.createPreview({prompt:job.prompt,targetPolycount:job.targetPolycount,poseMode:job.poseMode})
        submitted.push({...job,taskId:task.taskId,status:'submitted'})
      }catch(error){
        submitted.push({...job,status:'failed',error:String(error.message||error)})
        break
      }
    }
    res.status(202).json({schema:'tryamm.circle-park-production-wave-start.v1',submitted,creditGuard:{maxJobs:6,noAutomaticRefine:true},certified:false,publishAllowed:false})
  })

  router.post('/text-to-3d/preview',async(req,res)=>{
    try{
      const result=await provider.createPreview({
        prompt:req.body?.prompt,
        targetPolycount:req.body?.targetPolycount,
        poseMode:req.body?.poseMode,
      })
      res.status(202).json({...result,certified:false,publishAllowed:false})
    }catch(error){
      res.status(error.statusCode||400).json({error:String(error.message||error)})
    }
  })

  router.post('/text-to-3d/refine',async(req,res)=>{
    try{
      const result=await provider.createRefine({
        previewTaskId:req.body?.previewTaskId,
        texturePrompt:req.body?.texturePrompt,
        textureResolution:req.body?.textureResolution,
      })
      res.status(202).json({...result,certified:false,publishAllowed:false})
    }catch(error){
      res.status(error.statusCode||400).json({error:String(error.message||error)})
    }
  })

  router.get('/tasks/:id',async(req,res)=>{
    try{
      const task=await provider.getTask(req.params.id)
      res.json({...task,certified:false,publishAllowed:false})
    }catch(error){
      res.status(error.statusCode||400).json({error:String(error.message||error)})
    }
  })

  return router
}

module.exports={createAssetForgeRouter,hasAssetForgeRole}