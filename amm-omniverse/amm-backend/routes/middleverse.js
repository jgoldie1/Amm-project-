const express=require('express')

function createMiddleverseRouter({supabase}){
  const router=express.Router()

  async function requireUser(req,res,next){
    const auth=req.headers.authorization||''
    const token=auth.startsWith('Bearer ')?auth.slice(7):''
    if(!token)return res.status(401).json({error:'Authentication required'})
    const {data,error}=await supabase.auth.getUser(token)
    if(error||!data?.user)return res.status(401).json({error:'Invalid session'})
    req.user=data.user
    next()
  }

  router.get('/status',requireUser,async(_req,res)=>{
    try{
      const {data,error}=await supabase.from('middleverse_routes').select('route_key,name,source_system,target_system,intent,status,high_impact,capabilities').neq('status','disabled').order('route_key')
      if(error)throw error
      res.json({
        ok:true,
        service:'TRYAMM Middleverse',
        purpose:'Context-preserving orchestration between Holoverse, Stubbs AI, Workforce, Commerce, LIVE, Safety and Living Worlds.',
        routes:data||[],
      })
    }catch(err){res.status(500).json({error:err.message||'Could not load Middleverse status'})}
  })

  router.get('/handoffs',requireUser,async(req,res)=>{
    try{
      const limit=Math.min(Number(req.query.limit||50),100)
      const {data,error}=await supabase.from('middleverse_handoffs').select('id,route_key,task_summary,status,risk_band,target_ref,result,created_at,updated_at,completed_at').eq('user_id',req.user.id).order('created_at',{ascending:false}).limit(limit)
      if(error)throw error
      res.json({handoffs:data||[]})
    }catch(err){res.status(500).json({error:err.message||'Could not load handoffs'})}
  })

  router.post('/handoffs',requireUser,async(req,res)=>{
    try{
      const routeKey=String(req.body?.routeKey||'').trim()
      const taskSummary=String(req.body?.taskSummary||'').trim().slice(0,4000)
      if(!routeKey||!taskSummary)return res.status(400).json({error:'routeKey and taskSummary are required'})
      const {data:route,error:routeError}=await supabase.from('middleverse_routes').select('*').eq('route_key',routeKey).neq('status','disabled').maybeSingle()
      if(routeError)throw routeError
      if(!route)return res.status(404).json({error:'Middleverse route not found'})
      const requestedRisk=String(req.body?.riskBand||'green').toLowerCase()
      const riskBand=['green','yellow','orange','red'].includes(requestedRisk)?requestedRisk:'green'
      if(route.high_impact&&riskBand==='green'){
        return res.status(409).json({error:'High-impact Middleverse routes require explicit risk review before handoff',requiresRiskReview:true})
      }
      const context=req.body?.sourceContext&&typeof req.body.sourceContext==='object'?req.body.sourceContext:{}
      const {data,error}=await supabase.from('middleverse_handoffs').insert({
        user_id:req.user.id,
        route_key:routeKey,
        source_context:context,
        task_summary:taskSummary,
        status:'created',
        risk_band:riskBand,
        target_ref:req.body?.targetRef?String(req.body.targetRef).slice(0,500):null,
      }).select('*').single()
      if(error)throw error
      res.status(201).json({handoff:data,route})
    }catch(err){res.status(500).json({error:err.message||'Could not create handoff'})}
  })

  router.post('/handoffs/:id/status',requireUser,async(req,res)=>{
    try{
      const status=String(req.body?.status||'')
      const allowed=['accepted','in_progress','completed','blocked','cancelled']
      if(!allowed.includes(status))return res.status(400).json({error:'Invalid status'})
      const patch={status,updated_at:new Date().toISOString()}
      if(status==='completed')patch.completed_at=new Date().toISOString()
      if(req.body?.result&&typeof req.body.result==='object')patch.result=req.body.result
      const {data,error}=await supabase.from('middleverse_handoffs').update(patch).eq('id',req.params.id).eq('user_id',req.user.id).select('*').maybeSingle()
      if(error)throw error
      if(!data)return res.status(404).json({error:'Handoff not found'})
      res.json({handoff:data})
    }catch(err){res.status(500).json({error:err.message||'Could not update handoff'})}
  })

  return router
}

module.exports={createMiddleverseRouter}
