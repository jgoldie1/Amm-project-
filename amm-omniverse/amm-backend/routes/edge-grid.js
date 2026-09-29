'use strict'

const express=require('express')
const crypto=require('node:crypto')
const {verifyEdgeEarnings,reverseEdgeEarnings}=require('../lib/edge-earnings-ledger')

const JOB_CLASSES=new Set(['cache-sync','world-state-sync','light-ai','media-thumbnail','asset-optimize','offline-reconcile','telemetry-aggregate'])
const OPERATOR_ROLES=new Set(['owner','admin','ops','finance','release'])
const VALIDATOR_ROLES=new Set(['owner','admin','ops','finance','security','release'])

function bearer(req){
  const h=String(req.headers.authorization||'')
  return h.startsWith('Bearer ')?h.slice(7).trim():''
}
function role(user){return String(user?.app_metadata?.role||'').trim().toLowerCase()}
function cleanText(v,max=300){return String(v||'').trim().slice(0,max)}
function sha256(v){return crypto.createHash('sha256').update(String(v||'')).digest('hex')}

function createEdgeGridRouter({supabase}){
  const router=express.Router()

  router.use(async(req,res,next)=>{
    const token=bearer(req)
    if(!token)return res.status(401).json({error:'Authentication required'})
    const {data,error}=await supabase.auth.getUser(token)
    if(error||!data?.user)return res.status(401).json({error:'Invalid session'})
    req.user=data.user
    next()
  })

  function requireRole(allowed){
    return(req,res,next)=>allowed.has(role(req.user))?next():res.status(403).json({error:'Edge Grid operator role required'})
  }

  router.get('/rate-cards',requireRole(OPERATOR_ROLES),async(_req,res)=>{
    try{
      const {data,error}=await supabase.from('tryamm_edge_rate_cards')
        .select('id,job_class,node_class,unit_name,customer_rate_cents,node_share_bps,platform_share_bps,reserve_share_bps,enabled,version,updated_at')
        .order('job_class').order('node_class').order('version',{ascending:false})
      if(error)throw error
      res.json({rateCards:data||[],customerFacing:false})
    }catch(error){res.status(500).json({error:'Could not load Edge rate cards'})}
  })

  router.post('/work-orders',requireRole(OPERATOR_ROLES),async(req,res)=>{
    try{
      const jobClass=cleanText(req.body?.jobClass,64)
      if(!JOB_CLASSES.has(jobClass))return res.status(400).json({error:'Unsupported Edge work class'})
      const gross=Math.max(0,Math.trunc(Number(req.body?.grossBudgetCents)||0))
      const nodeShare=Math.max(0,Math.min(10000,Math.trunc(Number(req.body?.nodeShareBps)||0)))
      const platformShare=Math.max(0,Math.min(10000,Math.trunc(Number(req.body?.platformShareBps)||0)))
      const reserveShare=10000-nodeShare-platformShare
      if(gross<=0||reserveShare<0)return res.status(400).json({error:'Invalid work-order budget or split'})
      const expiresAt=new Date(req.body?.expiresAt||Date.now()+24*60*60*1000)
      if(!Number.isFinite(expiresAt.getTime())||expiresAt.getTime()<=Date.now())return res.status(400).json({error:'Future expiresAt required'})
      const sourceSystem=cleanText(req.body?.sourceSystem||'edge-grid',80)
      const sourceRef=cleanText(req.body?.sourceRef,180)
      if(!sourceRef)return res.status(400).json({error:'sourceRef required'})
      const {data,error}=await supabase.from('tryamm_edge_work_orders').insert({
        source_system:sourceSystem,
        source_ref:sourceRef,
        customer_ref:cleanText(req.body?.customerRef,180)||null,
        job_class:jobClass,
        unit_name:cleanText(req.body?.unitName||'job',64),
        unit_count:Math.max(.000001,Number(req.body?.unitCount)||1),
        gross_budget_cents:gross,
        node_share_bps:nodeShare,
        platform_share_bps:platformShare,
        reserve_share_bps:reserveShare,
        currency:'USD',
        status:'draft',
        requirements:req.body?.requirements&&typeof req.body.requirements==='object'?req.body.requirements:{},
        expires_at:expiresAt.toISOString(),
      }).select('*').single()
      if(error)throw error
      res.status(201).json({workOrder:data,funded:false,payable:false})
    }catch(error){res.status(500).json({error:'Could not create Edge work order'})}
  })

  router.post('/work-orders/:id/fund',requireRole(OPERATOR_ROLES),async(req,res)=>{
    try{
      const transactionId=cleanText(req.body?.commerceTransactionId,80)
      if(!transactionId)return res.status(400).json({error:'commerceTransactionId required'})
      const {data:order,error:orderError}=await supabase.from('tryamm_edge_work_orders')
        .select('*').eq('id',req.params.id).maybeSingle()
      if(orderError)throw orderError
      if(!order)return res.status(404).json({error:'Work order not found'})
      if(order.status!=='draft')return res.status(409).json({error:'Only draft work orders can be funded'})
      const {data:tx,error:txError}=await supabase.from('commerce_payment_transactions')
        .select('id,amount_cents,currency,status,buyer_id,metadata').eq('id',transactionId).maybeSingle()
      if(txError)throw txError
      if(!tx||tx.status!=='paid')return res.status(409).json({error:'Verified paid commerce transaction required'})
      if(Number(tx.amount_cents)<Number(order.gross_budget_cents))return res.status(409).json({error:'Funding transaction does not cover work-order budget'})
      if(String(tx.currency||'').toUpperCase()!==String(order.currency||'USD').toUpperCase())return res.status(409).json({error:'Funding currency mismatch'})
      const {data,error}=await supabase.from('tryamm_edge_work_orders').update({
        status:'funded',funding_transaction_id:tx.id,funded_at:new Date().toISOString(),updated_at:new Date().toISOString(),
      }).eq('id',order.id).eq('status','draft').select('*').maybeSingle()
      if(error)throw error
      if(!data)return res.status(409).json({error:'Work order funding race detected'})
      res.json({workOrder:data,funded:true})
    }catch(error){res.status(500).json({error:'Could not fund Edge work order'})}
  })

  router.post('/work-orders/:id/dispatch',requireRole(OPERATOR_ROLES),async(req,res)=>{
    try{
      const {data:order,error:orderError}=await supabase.from('tryamm_edge_work_orders').select('*').eq('id',req.params.id).maybeSingle()
      if(orderError)throw orderError
      if(!order)return res.status(404).json({error:'Work order not found'})
      if(!['funded','dispatching'].includes(order.status))return res.status(409).json({error:'Funded work order required'})
      if(order.dispatched_job_id)return res.status(409).json({error:'Work order already dispatched',jobId:order.dispatched_job_id})
      const preferred=Array.isArray(order.requirements?.nodeClasses)?order.requirements.nodeClasses.map(String):['workstation','business','cafe','tablet','pocket']
      const {data:nodes,error:nodesError}=await supabase.from('tryamm_edge_nodes')
        .select('id,owner_user_id,node_class,status,trust_state,capabilities,last_seen_at')
        .eq('status','online').neq('trust_state','disabled').order('last_seen_at',{ascending:false}).limit(250)
      if(nodesError)throw nodesError
      const eligible=(nodes||[]).filter(node=>{
        const work=Array.isArray(node.capabilities?.safeWork)?node.capabilities.safeWork:[]
        const battery=node.capabilities?.batteryLevel
        const charging=node.capabilities?.charging
        const batteryOk=!(Number.isFinite(Number(battery))&&!charging&&Number(battery)<.25)
        return preferred.includes(node.node_class)&&work.includes(order.job_class)&&batteryOk
      }).sort((a,b)=>preferred.indexOf(a.node_class)-preferred.indexOf(b.node_class))
      const node=eligible[0]
      if(!node)return res.status(503).json({error:'No eligible Edge Node is currently available'})
      const payloadRef=cleanText(order.requirements?.payloadRef,500)||null
      const payloadHash=cleanText(order.requirements?.payloadHash,64)||null
      if(payloadHash&&!/^[a-f0-9]{64}$/i.test(payloadHash))return res.status(400).json({error:'Work-order payloadHash must be SHA-256 hex'})
      const {data:job,error:jobError}=await supabase.from('tryamm_edge_jobs').insert({
        owner_user_id:node.owner_user_id,
        job_class:order.job_class,
        required_capability:order.job_class,
        payload_ref:payloadRef,
        payload_hash:payloadHash,
        work_order_id:order.id,
        status:'queued',
      }).select('*').single()
      if(jobError)throw jobError
      const {error:updateError}=await supabase.from('tryamm_edge_work_orders').update({
        status:'dispatching',dispatched_job_id:job.id,updated_at:new Date().toISOString(),
      }).eq('id',order.id)
      if(updateError)throw updateError
      res.status(201).json({
        workOrderId:order.id,
        job:{id:job.id,jobClass:job.job_class,status:job.status},
        node:{nodeClass:node.node_class,trustState:node.trust_state},
        ownerIdentityExposed:false,
      })
    }catch(error){res.status(500).json({error:'Could not dispatch Edge work order'})}
  })

  router.post('/work-orders/:id/verify',requireRole(VALIDATOR_ROLES),async(req,res)=>{
    try{
      const evidence={
        validatorUserId:req.user.id,
        validatorRole:role(req.user),
        evidenceRef:cleanText(req.body?.evidenceRef,500)||null,
        evidenceHash:req.body?.evidenceHash&&/^[a-f0-9]{64}$/i.test(String(req.body.evidenceHash))?String(req.body.evidenceHash).toLowerCase():null,
        note:cleanText(req.body?.note,500)||null,
        verifiedAt:new Date().toISOString(),
      }
      const result=await verifyEdgeEarnings({supabase,workOrderId:req.params.id,evidence})
      res.json({ok:true,...result})
    }catch(error){res.status(409).json({error:String(error?.message||'Could not verify Edge work')})}
  })

  router.post('/work-orders/:id/reverse',requireRole(VALIDATOR_ROLES),async(req,res)=>{
    try{
      const reason=cleanText(req.body?.reason,500)
      if(!reason)return res.status(400).json({error:'Reversal reason required'})
      const result=await reverseEdgeEarnings({supabase,workOrderId:req.params.id,reason,actorUserId:req.user.id})
      res.json({ok:true,...result})
    }catch(error){res.status(409).json({error:String(error?.message||'Could not reverse Edge work')})}
  })

  router.get('/stats',requireRole(OPERATOR_ROLES),async(_req,res)=>{
    try{
      const [{data:nodes},{data:orders},{data:ledger}]=await Promise.all([
        supabase.from('tryamm_edge_nodes').select('id,status,node_class,trust_state'),
        supabase.from('tryamm_edge_work_orders').select('id,status,gross_budget_cents'),
        supabase.from('tryamm_edge_earnings_ledger').select('node_earnings_cents,platform_revenue_cents,reserve_cents,verification_status,payout_status'),
      ])
      const total=(rows,key)=>Number((rows||[]).reduce((sum,row)=>sum+Number(row[key]||0),0))
      res.json({
        nodes:{registered:(nodes||[]).length,online:(nodes||[]).filter(x=>x.status==='online').length},
        workOrders:{total:(orders||[]).length,funded:(orders||[]).filter(x=>['funded','dispatching','completed'].includes(x.status)).length},
        money:{
          grossBudgetCents:total(orders,'gross_budget_cents'),
          nodeEarningsCents:total(ledger,'node_earnings_cents'),
          platformRevenueCents:total(ledger,'platform_revenue_cents'),
          reserveCents:total(ledger,'reserve_cents'),
          verifiedPayableCents:total((ledger||[]).filter(x=>x.verification_status==='verified'&&x.payout_status==='payable'),'node_earnings_cents'),
        },
        forecast:false,
        source:'server-authoritative-ledgers',
      })
    }catch(error){res.status(500).json({error:'Could not load Edge Grid stats'})}
  })

  return router
}

module.exports={createEdgeGridRouter,OPERATOR_ROLES,VALIDATOR_ROLES}
