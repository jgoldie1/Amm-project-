'use strict'

const DEFAULTS={
  normal:{maxConcurrent:120,timeoutMs:12_000,failureThreshold:8,resetMs:15_000,degradeable:true},
  middleverse:{maxConcurrent:50,timeoutMs:10_000,failureThreshold:6,resetMs:20_000,degradeable:false},
  'ai-expensive':{maxConcurrent:12,timeoutMs:20_000,failureThreshold:5,resetMs:30_000,degradeable:true},
  'asset-expensive':{maxConcurrent:4,timeoutMs:30_000,failureThreshold:4,resetMs:45_000,degradeable:true},
  'edge-compute':{maxConcurrent:20,timeoutMs:8_000,failureThreshold:6,resetMs:20_000,degradeable:true},
  'live-realtime':{maxConcurrent:80,timeoutMs:8_000,failureThreshold:8,resetMs:15_000,degradeable:true},
  'financial-sensitive':{maxConcurrent:24,timeoutMs:8_000,failureThreshold:4,resetMs:30_000,degradeable:false},
  'security-sensitive':{maxConcurrent:30,timeoutMs:8_000,failureThreshold:4,resetMs:30_000,degradeable:false},
}

function classify(req){
  const swarm=String(req.swarmShield?.pathClass||'')
  if(swarm&&swarm!=='unknown'&&swarm!=='normal')return swarm
  const p=String(req.originalUrl||req.url||req.path||'/')
  if(p.startsWith('/api/middleverse'))return'middleverse'
  return'normal'
}

function createState(){return{inFlight:0,consecutiveFailures:0,openUntil:0,lastFailureAt:0,total:0,rejected:0}}

function createMiddleWearResilience({now=()=>Date.now(),policies=DEFAULTS}={}){
  const states=new Map()

  function stateFor(cls){
    if(!states.has(cls))states.set(cls,createState())
    return states.get(cls)
  }

  function snapshot(){
    const out={}
    for(const [key,state] of states){
      out[key]={...state,circuitOpen:state.openUntil>now()}
    }
    return out
  }

  function middleware(req,res,next){
    const ts=now()
    const cls=classify(req)
    const policy=policies[cls]||policies.normal
    const state=stateFor(cls)
    state.total+=1

    req.middleWearResilience={
      class:cls,
      startedAt:ts,
      deadlineAt:ts+policy.timeoutMs,
      timeoutMs:policy.timeoutMs,
      circuitOpen:false,
      bulkheadRemaining:Math.max(0,policy.maxConcurrent-state.inFlight),
    }
    res.setHeader('X-TRYAMM-Resilience-Class',cls)
    res.setHeader('X-TRYAMM-Deadline-Ms',String(policy.timeoutMs))

    if(state.openUntil>ts){
      state.rejected+=1
      req.middleWearResilience.circuitOpen=true
      res.setHeader('Retry-After',String(Math.max(1,Math.ceil((state.openUntil-ts)/1000))))
      return res.status(policy.degradeable?503:529).json({
        error:'Service dependency temporarily isolated by TRYAMM circuit breaker',
        protected:true,
        class:cls,
      })
    }

    if(state.inFlight>=policy.maxConcurrent){
      state.rejected+=1
      res.setHeader('Retry-After','2')
      return res.status(503).json({
        error:'Service temporarily at protected concurrency capacity',
        protected:true,
        class:cls,
      })
    }

    state.inFlight+=1
    let released=false
    const release=()=>{
      if(released)return
      released=true
      state.inFlight=Math.max(0,state.inFlight-1)
      const code=Number(res.statusCode||200)
      if(code>=500){
        state.consecutiveFailures+=1
        state.lastFailureAt=now()
        if(state.consecutiveFailures>=policy.failureThreshold){
          state.openUntil=now()+policy.resetMs
        }
      }else if(code<500){
        state.consecutiveFailures=0
        if(state.openUntil<=now())state.openUntil=0
      }
    }
    res.once('finish',release)
    res.once('close',release)

    const timer=setTimeout(()=>{
      if(res.headersSent||res.writableEnded)return
      state.consecutiveFailures+=1
      state.lastFailureAt=now()
      if(state.consecutiveFailures>=policy.failureThreshold)state.openUntil=now()+policy.resetMs
      res.status(504).json({
        error:'Request exceeded TRYAMM resilience deadline',
        protected:true,
        class:cls,
      })
    },policy.timeoutMs)
    timer.unref?.()
    res.once('finish',()=>clearTimeout(timer))
    res.once('close',()=>clearTimeout(timer))

    next()
  }

  function status(){
    return{
      product:'TRYAMM MiddleWear Resilience',
      policies,
      states:snapshot(),
      principles:{
        bulkheads:true,
        circuitBreakers:true,
        requestDeadlines:true,
        overloadShedding:true,
        gracefulDegradation:true,
        distributedEdgeProtectionStillRequired:true,
      },
    }
  }

  return{middleware,status,classify,policies}
}

module.exports={createMiddleWearResilience,classify,DEFAULTS}