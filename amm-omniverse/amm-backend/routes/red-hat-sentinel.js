'use strict'

const express=require('express')

function bearer(req){
  const header=String(req.headers.authorization||'')
  return header.startsWith('Bearer ')?header.slice(7).trim():null
}

async function requireSecurityOperator(supabase,req,res,next){
  const token=bearer(req)
  if(!token)return res.status(401).json({error:'Authentication required'})
  const {data,error}=await supabase.auth.getUser(token)
  if(error||!data?.user)return res.status(401).json({error:'Invalid session'})
  const role=String(data.user.app_metadata?.role||'').toLowerCase()
  if(!['owner','admin','security','release'].includes(role))return res.status(403).json({error:'Security operator role required'})
  req.user=data.user
  next()
}

function createRedHatSentinelRouter({supabase,sentinel}){
  const router=express.Router()
  router.use((req,res,next)=>requireSecurityOperator(supabase,req,res,next))

  router.get('/status',(_req,res)=>res.json({
    product:'TRYAMM Red Hat Sentinel',
    enabled:true,
    defensiveOnly:true,
    hackBack:false,
    retentionDays:sentinel.policy.retentionDays,
    dataPolicy:{
      rawIpStored:false,
      rawCredentialsStored:false,
      rawPayloadStored:false,
      authorizationHeadersStored:false,
      cookiesStored:false,
    },
  }))

  router.get('/summary',async(_req,res)=>{
    try{
      const since=new Date(Date.now()-24*60*60*1000).toISOString()
      const {data,error}=await supabase
        .from('security_deception_events')
        .select('event_kind,risk_score,signal_codes,user_agent_class,occurred_at')
        .gte('occurred_at',since)
        .order('occurred_at',{ascending:false})
        .limit(1000)
      if(error)throw error
      const events=data||[]
      const signals={}
      const agents={}
      for(const event of events){
        for(const signal of event.signal_codes||[])signals[signal]=(signals[signal]||0)+1
        agents[event.user_agent_class||'unknown']=(agents[event.user_agent_class||'unknown']||0)+1
      }
      res.json({
        windowHours:24,
        events:events.length,
        highRisk:events.filter(x=>Number(x.risk_score)>=70).length,
        canaryContacts:events.filter(x=>x.event_kind==='canary-contact').length,
        signals,
        userAgentClasses:agents,
        note:'Summary intentionally excludes raw source addresses, credentials and payload contents.',
      })
    }catch{
      res.status(500).json({error:'Could not load Red Hat Sentinel summary'})
    }
  })

  return router
}

module.exports={createRedHatSentinelRouter,requireSecurityOperator}
