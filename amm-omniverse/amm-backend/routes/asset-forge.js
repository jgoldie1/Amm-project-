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

function createAssetForgeRouter({supabase,provider=createMeshyAssetProvider()}){
  const router=express.Router()

  router.get('/health',(_req,res)=>res.json({
    ok:true,
    provider:'meshy',
    configured:provider.configured,
    capabilities:provider.capabilities,
    publishAuthority:false,
    truth:'Generation output remains uncertified until Asset Passport + rights + performance + human visual review pass.',
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
