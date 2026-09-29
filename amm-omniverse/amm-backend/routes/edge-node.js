'use strict'

const express=require('express')
const crypto=require('node:crypto')
const {createPendingEdgeEarnings,getEdgeEarningsSummary}=require('../lib/edge-earnings-ledger')

const JOB_CLASSES=new Set(['cache-sync','world-state-sync','light-ai','media-thumbnail','asset-optimize','offline-reconcile','telemetry-aggregate'])
const BROWSER_NODE_CLASSES=new Set(['pocket','tablet','workstation'])
const SAFE_CAPABILITIES=new Set([...JOB_CLASSES])

function bearer(req){
  const h=String(req.headers.authorization||'')
  return h.startsWith('Bearer ')?h.slice(7).trim():''
}
function hashInstall(value){
  const pepper=String(process.env.EDGE_NODE_INSTALL_PEPPER||process.env.SESSION_TOKEN_PEPPER||'tryamm-edge-dev-pepper')
  return crypto.createHmac('sha256',pepper).update(String(value||'')).digest('hex')
}
function cleanRef(value){
  if(value==null||value==='')return null
  const v=String(value).trim().slice(0,500)
  if(!/^(local|cache|world-state|storage|artifact):/i.test(v))throw new Error('UNSAFE_EDGE_PAYLOAD_REFERENCE')
  return v
}
function sanitizeCapabilities(input={}){
  const nodeClass=BROWSER_NODE_CLASSES.has(String(input.nodeClass))?String(input.nodeClass):'pocket'
  const safeWork=Array.isArray(input.safeWork)?input.safeWork.map(String).filter(x=>SAFE_CAPABILITIES.has(x)).slice(0,10):[]
  const maxParallel=Math.max(1,Math.min(nodeClass==='workstation'?6:2,Number(input.maxParallel)||1))
  return{
    nodeClass,
    online:input.online!==false,
    hardwareConcurrency:Math.max(1,Math.min(128,Number(input.hardwareConcurrency)||2)),
    deviceMemoryGB:Number.isFinite(Number(input.deviceMemoryGB))?Math.max(0,Math.min(256,Number(input.deviceMemoryGB))):null,
    webGPU:Boolean(input.webGPU),
    webCodecs:Boolean(input.webCodecs),
    batteryLevel:Number.isFinite(Number(input.batteryLevel))?Math.max(0,Math.min(1,Number(input.batteryLevel))):null,
    charging:typeof input.charging==='boolean'?input.charging:null,
    thermalState:'unknown',
    safeWork,
    maxParallel,
  }
}
function leaseLimit(cap){return cap.nodeClass==='workstation'?Math.min(4,cap.maxParallel):1}

async function edgeHousekeeping(supabase,userId){
  const nowIso=new Date().toISOString()
  const staleIso=new Date(Date.now()-5*60*1000).toISOString()
  try{
    await supabase.from('tryamm_edge_jobs').update({
      status:'queued',leased_node_id:null,lease_expires_at:null,updated_at:nowIso,
    }).eq('owner_user_id',userId).eq('status','leased').lt('lease_expires_at',nowIso).gt('expires_at',nowIso)
  }catch(_){}
  try{
    await supabase.from('tryamm_edge_jobs').delete().eq('owner_user_id',userId).lt('expires_at',nowIso)
  }catch(_){}
  try{
    await supabase.from('tryamm_edge_nodes').update({status:'offline',updated_at:nowIso})
      .eq('owner_user_id',userId).eq('status','online').lt('last_seen_at',staleIso)
  }catch(_){}
}

function createEdgeNodeRouter({supabase}){
  const router=express.Router()

  router.use(async(req,res,next)=>{
    const token=bearer(req)
    if(!token)return res.status(401).json({error:'Authentication required'})
    const {data,error}=await supabase.auth.getUser(token)
    if(error||!data?.user)return res.status(401).json({error:'Invalid session'})
    req.user=data.user
    next()
  })

  router.get('/capabilities',(_req,res)=>res.json({
    ok:true,
    service:'TRYAMM Pocket Edge Coordinator',
    trustModel:'same-owner browser nodes only in v1',
    hardwareAttestation:false,
    allowedJobClasses:[...JOB_CLASSES],
    forbiddenOnPocket:['payment secrets','auth tokens','private keys','raw health/biometric data','unrestricted customer data'],
  }))

  router.post('/register',async(req,res)=>{
    try{
      await edgeHousekeeping(supabase,req.user.id)
      const installId=String(req.body?.installId||'').trim()
      if(!/^[A-Za-z0-9._:-]{12,128}$/.test(installId))return res.status(400).json({error:'Valid installId required'})
      const capabilities=sanitizeCapabilities(req.body?.capabilities||{})
      const installHash=hashInstall(installId)
      const row={
        owner_user_id:req.user.id,
        install_hash:installHash,
        node_class:capabilities.nodeClass,
        status:capabilities.online?'online':'offline',
        trust_state:'registered',
        capabilities,
        lease_limit:leaseLimit(capabilities),
        last_seen_at:new Date().toISOString(),
        updated_at:new Date().toISOString(),
      }
      const {data,error}=await supabase.from('tryamm_edge_nodes').upsert(row,{onConflict:'owner_user_id,install_hash'}).select('id,node_class,status,trust_state,lease_limit,last_seen_at').single()
      if(error)throw error
      res.status(201).json({node:data,rawInstallIdStored:false,hardwareAttested:false})
    }catch(error){res.status(500).json({error:'Could not register Edge Node'})}
  })

  router.post('/heartbeat',async(req,res)=>{
    try{
      await edgeHousekeeping(supabase,req.user.id)
      const nodeId=String(req.body?.nodeId||'')
      const capabilities=sanitizeCapabilities(req.body?.capabilities||{})
      const {data,error}=await supabase.from('tryamm_edge_nodes').update({
        node_class:capabilities.nodeClass,
        status:capabilities.online?'online':'offline',
        capabilities,
        lease_limit:leaseLimit(capabilities),
        last_seen_at:new Date().toISOString(),
        updated_at:new Date().toISOString(),
      }).eq('id',nodeId).eq('owner_user_id',req.user.id).neq('status','disabled').select('id,node_class,status,trust_state,lease_limit,last_seen_at').maybeSingle()
      if(error)throw error
      if(!data)return res.status(404).json({error:'Edge Node not found'})
      res.json({node:data})
    }catch(error){res.status(500).json({error:'Could not update Edge Node heartbeat'})}
  })

  router.post('/jobs',async(req,res)=>{
    try{
      const jobClass=String(req.body?.jobClass||'')
      if(!JOB_CLASSES.has(jobClass))return res.status(400).json({error:'Unsupported edge job class'})
      const requiredCapability=String(req.body?.requiredCapability||jobClass)
      if(!SAFE_CAPABILITIES.has(requiredCapability))return res.status(400).json({error:'Unsupported edge capability'})
      const payloadRef=cleanRef(req.body?.payloadRef)
      const payloadHash=req.body?.payloadHash?String(req.body.payloadHash):null
      if(payloadHash&&!/^[a-f0-9]{64}$/i.test(payloadHash))return res.status(400).json({error:'payloadHash must be SHA-256 hex'})
      const {data,error}=await supabase.from('tryamm_edge_jobs').insert({
        owner_user_id:req.user.id,
        job_class:jobClass,
        required_capability:requiredCapability,
        payload_ref:payloadRef,
        payload_hash:payloadHash,
        status:'queued',
      }).select('id,job_class,required_capability,payload_ref,status,expires_at,created_at').single()
      if(error)throw error
      res.status(201).json({job:data,rawSensitivePayloadStored:false})
    }catch(error){
      const code=String(error?.message||'').includes('UNSAFE_EDGE_PAYLOAD_REFERENCE')?400:500
      res.status(code).json({error:code===400?'Unsafe edge payload reference':'Could not queue Edge Node job'})
    }
  })

  router.post('/lease',async(req,res)=>{
    try{
      await edgeHousekeeping(supabase,req.user.id)
      const nodeId=String(req.body?.nodeId||'')
      const current=sanitizeCapabilities(req.body?.capabilities||{})
      const {data:node,error:nodeError}=await supabase.from('tryamm_edge_nodes')
        .select('id,owner_user_id,node_class,status,trust_state,capabilities,lease_limit,last_seen_at')
        .eq('id',nodeId).eq('owner_user_id',req.user.id).maybeSingle()
      if(nodeError)throw nodeError
      if(!node||node.status==='disabled'||node.trust_state==='disabled')return res.status(403).json({error:'Edge Node unavailable'})
      if(current.batteryLevel!==null&&!current.charging&&current.batteryLevel<.25)return res.json({jobs:[],mode:'battery-save'})
      const safe=new Set(current.safeWork||[])
      if(!safe.size)return res.json({jobs:[],mode:'no-safe-capability'})

      const {data:candidates,error}=await supabase.from('tryamm_edge_jobs')
        .select('id,job_class,required_capability,payload_ref,payload_hash,status,expires_at,created_at,work_order_id')
        .eq('owner_user_id',req.user.id).eq('status','queued')
        .gt('expires_at',new Date().toISOString()).order('created_at',{ascending:true}).limit(Math.max(1,Number(node.lease_limit||1)*3))
      if(error)throw error
      const jobs=[]
      for(const candidate of candidates||[]){
        if(jobs.length>=Number(node.lease_limit||1))break
        if(!safe.has(candidate.required_capability))continue
        const leaseExpiresAt=new Date(Date.now()+2*60*1000).toISOString()
        const {data:leased,error:leaseError}=await supabase.from('tryamm_edge_jobs').update({
          status:'leased',leased_node_id:node.id,lease_expires_at:leaseExpiresAt,updated_at:new Date().toISOString(),
        }).eq('id',candidate.id).eq('owner_user_id',req.user.id).eq('status','queued').select('id,job_class,required_capability,payload_ref,payload_hash,status,lease_expires_at,work_order_id').maybeSingle()
        if(leaseError)throw leaseError
        if(leased)jobs.push(leased)
      }
      res.json({jobs,nodeId:node.id,leaseSeconds:120,hardwareAttested:false,sameOwnerOnly:true})
    }catch(error){res.status(500).json({error:'Could not lease Edge Node jobs'})}
  })

  router.post('/jobs/:id/complete',async(req,res)=>{
    try{
      const nodeId=String(req.body?.nodeId||'')
      const resultRef=cleanRef(req.body?.resultRef)
      const {data:node}=await supabase.from('tryamm_edge_nodes').select('id').eq('id',nodeId).eq('owner_user_id',req.user.id).maybeSingle()
      if(!node)return res.status(403).json({error:'Edge Node ownership verification failed'})
      const {data,error}=await supabase.from('tryamm_edge_jobs').update({
        status:'completed',result_ref:resultRef,completed_at:new Date().toISOString(),updated_at:new Date().toISOString(),
      }).eq('id',req.params.id).eq('owner_user_id',req.user.id).eq('leased_node_id',node.id).eq('status','leased').gt('lease_expires_at',new Date().toISOString())
        .select('id,status,result_ref,completed_at,work_order_id').maybeSingle()
      if(error)throw error
      if(!data)return res.status(409).json({error:'Edge job lease expired or ownership mismatch'})
      const earnings=await createPendingEdgeEarnings({supabase,job:data,nodeId:node.id,userId:req.user.id})
      res.json({job:data,earnings})
    }catch(error){
      const code=String(error?.message||'').includes('UNSAFE_EDGE_PAYLOAD_REFERENCE')?400:500
      res.status(code).json({error:code===400?'Unsafe edge result reference':'Could not complete Edge Node job'})
    }
  })

  router.get('/earnings',async(req,res)=>{
    try{
      const summary=await getEdgeEarningsSummary({supabase,userId:req.user.id})
      res.json({ok:true,summary})
    }catch(error){
      res.status(500).json({error:'Could not load Edge earnings summary'})
    }
  })

  return router
}

module.exports={createEdgeNodeRouter,sanitizeCapabilities,hashInstall,edgeHousekeeping,JOB_CLASSES,SAFE_CAPABILITIES}