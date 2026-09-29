'use strict'

function bearer(req){
  const header=String(req.headers?.authorization||'')
  return header.startsWith('Bearer ')?header.slice(7).trim():''
}

function operatorRole(user){
  const role=String(user?.app_metadata?.role||'').toLowerCase()
  return ['owner','admin','security','ops','release'].includes(role)
}

function providerReadiness(){
  return {
    commerce:{
      requiredForMoneySensitive:true,
      configured:Boolean(process.env.STRIPE_SECRET_KEY),
      provider:'stripe',
    },
    'tryamm-live':{
      requiredForMoneySensitive:false,
      configured:Boolean(process.env.LIVEKIT_API_KEY&&process.env.LIVEKIT_API_SECRET&&process.env.LIVEKIT_URL),
      provider:'livekit',
    },
    'stubbs-ai':{
      requiredForMoneySensitive:false,
      configured:Boolean(process.env.GEMINI_API_KEY),
      provider:process.env.GEMINI_API_KEY?'gemini':'local-fallback',
      fallbackAllowed:true,
    },
    workforce:{configured:true,provider:'internal'},
    'trust-safety':{configured:true,provider:'internal'},
    'living-worlds':{configured:true,provider:'internal'},
  }
}

function classifyRoute(route){
  const capabilities=route?.capabilities&&typeof route.capabilities==='object'?route.capabilities:{}
  const moneySensitive=capabilities.money_sensitive===true
  const humanReview=route?.high_impact===true||capabilities.human_review===true||capabilities.priority_escalation===true||moneySensitive
  const providerRequired=capabilities.provider_required===true||moneySensitive
  return{
    highImpact:route?.high_impact===true,
    moneySensitive,
    humanReview,
    providerRequired,
    capabilities,
  }
}

async function writeAudit(supabase,{user,eventType,severity='info',requestId,metadata={}}){
  try{
    const {error}=await supabase.from('security_audit_events').insert({
      user_id:user?.id||null,
      actor_id:user?.id||null,
      session_id:null,
      event_type:eventType,
      severity,
      request_id:requestId||null,
      metadata:{
        ...metadata,
        raw_authorization_stored:false,
        raw_ip_stored:false,
      },
    })
    if(error)throw error
    return true
  }catch(error){
    console.warn('MiddleWear audit write failed',{eventType,severity})
    return false
  }
}

const MIDDLEWEAR_MAX_MUTATION_BYTES=128*1024

function createMiddleWearSecurityGateway({supabase}){
  if(!supabase)throw new Error('MIDDLEWEAR_SUPABASE_REQUIRED')

  async function authenticate(req,res,next){
    const token=bearer(req)
    if(!token)return res.status(401).json({error:'Authentication required',gate:'middlewear-identity'})
    const {data,error}=await supabase.auth.getUser(token)
    if(error||!data?.user)return res.status(401).json({error:'Invalid session',gate:'middlewear-identity'})

    req.user=data.user
    req.middleWearSecurity={
      identityVerified:true,
      requestId:req.securityContext?.requestId||null,
      redHatRisk:Number(req.redHatSentinel?.riskScore||0),
      swarmClass:req.swarmShield?.pathClass||'unknown',
      routePolicy:null,
      providerGate:null,
      auditReady:false,
    }

    const method=String(req.method||'GET').toUpperCase()
    if(['GET','HEAD','OPTIONS'].includes(method)){
      req.middleWearSecurity.auditReady=true
      return next()
    }

    const auditReady=await writeAudit(supabase,{
      user:req.user,
      eventType:'middlewear.identity_verified',
      severity:'info',
      requestId:req.middleWearSecurity.requestId,
      metadata:{
        method:method.slice(0,12),
        path:String(req.path||'').slice(0,240),
        swarmClass:req.middleWearSecurity.swarmClass,
        redHatRisk:req.middleWearSecurity.redHatRisk,
      },
    })
    req.middleWearSecurity.auditReady=auditReady
    next()
  }

  async function loadRoutePolicy(req,res,next){
    if(req.method!=='POST'||req.path!=='/handoffs')return next()
    const payloadBytes=Buffer.byteLength(JSON.stringify(req.body||{}))
    if(payloadBytes>MIDDLEWEAR_MAX_MUTATION_BYTES){
      return res.status(413).json({
        error:'MiddleWear handoff payload exceeds protected size limit',
        maxBytes:MIDDLEWEAR_MAX_MUTATION_BYTES,
        gate:'middlewear-resource-limit',
      })
    }
    const routeKey=String(req.body?.routeKey||'').trim()
    if(!routeKey)return res.status(400).json({error:'routeKey is required',gate:'middlewear-route-policy'})

    const {data:route,error}=await supabase
      .from('middleverse_routes')
      .select('*')
      .eq('route_key',routeKey)
      .neq('status','disabled')
      .maybeSingle()

    if(error)return res.status(503).json({error:'Middleverse route policy unavailable',gate:'middlewear-route-policy'})
    if(!route)return res.status(404).json({error:'Middleverse route not found',gate:'middlewear-route-policy'})

    const policy=classifyRoute(route)
    const readiness=providerReadiness()
    const target=readiness[String(route.target_system||'')]||{configured:true,provider:'internal-or-unknown'}
    const requestedRisk=String(req.body?.riskBand||'green').toLowerCase()
    const riskBand=['green','yellow','orange','red'].includes(requestedRisk)?requestedRisk:'green'

    if(policy.highImpact&&riskBand==='green'){
      await writeAudit(supabase,{
        user:req.user,
        eventType:'middlewear.handoff_blocked',
        severity:'warning',
        requestId:req.middleWearSecurity?.requestId,
        metadata:{routeKey,reason:'risk-review-required',targetSystem:route.target_system},
      })
      return res.status(409).json({
        error:'High-impact Middleverse routes require explicit risk review before handoff',
        requiresRiskReview:true,
        gate:'middlewear-risk',
      })
    }

    if(policy.providerRequired&&!target.configured&&!target.fallbackAllowed){
      await writeAudit(supabase,{
        user:req.user,
        eventType:'middlewear.handoff_blocked',
        severity:'high',
        requestId:req.middleWearSecurity?.requestId,
        metadata:{routeKey,reason:'provider-not-ready',provider:target.provider,targetSystem:route.target_system},
      })
      return res.status(503).json({
        error:'Required provider is not production-ready for this Middleverse route',
        provider:target.provider,
        gate:'middlewear-provider',
      })
    }

    req.middleWearSecurity.routePolicy={routeKey,riskBand,...policy}
    req.middleWearSecurity.providerGate={
      targetSystem:route.target_system,
      provider:target.provider,
      configured:Boolean(target.configured),
      fallbackAllowed:Boolean(target.fallbackAllowed),
    }
    req.middleWearRoute=route

    const auditReady=await writeAudit(supabase,{
      user:req.user,
      eventType:'middlewear.handoff_authorized',
      severity:policy.highImpact||policy.moneySensitive?'important':'info',
      requestId:req.middleWearSecurity?.requestId,
      metadata:{
        routeKey,
        riskBand,
        highImpact:policy.highImpact,
        moneySensitive:policy.moneySensitive,
        humanReview:policy.humanReview,
        provider:target.provider,
        providerConfigured:Boolean(target.configured),
      },
    })

    if((policy.highImpact||policy.moneySensitive)&&!auditReady){
      return res.status(503).json({
        error:'Security audit persistence is required for high-impact Middleverse handoffs',
        gate:'middlewear-audit',
      })
    }

    next()
  }

  async function guardHighImpactCompletion(req,res,next){
    if(req.method!=='POST'||!/^\/handoffs\/[^/]+\/status$/.test(req.path))return next()
    if(String(req.body?.status||'')!=='completed')return next()

    const id=String(req.params?.id||'')
    const {data:handoff,error}=await supabase
      .from('middleverse_handoffs')
      .select('id,route_key,user_id,status')
      .eq('id',id)
      .eq('user_id',req.user.id)
      .maybeSingle()
    if(error)return res.status(503).json({error:'Could not verify handoff security policy',gate:'middlewear-completion'})
    if(!handoff)return res.status(404).json({error:'Handoff not found',gate:'middlewear-completion'})

    const {data:route,error:routeError}=await supabase
      .from('middleverse_routes')
      .select('route_key,target_system,high_impact,capabilities')
      .eq('route_key',handoff.route_key)
      .maybeSingle()
    if(routeError||!route)return res.status(503).json({error:'Route policy unavailable',gate:'middlewear-completion'})

    const policy=classifyRoute(route)
    if((policy.highImpact||policy.humanReview||policy.moneySensitive)&&!operatorRole(req.user)){
      await writeAudit(supabase,{
        user:req.user,
        eventType:'middlewear.high_impact_completion_blocked',
        severity:'high',
        requestId:req.middleWearSecurity?.requestId,
        metadata:{handoffId:id,routeKey:handoff.route_key,reason:'operator-review-required'},
      })
      return res.status(403).json({
        error:'High-impact handoff completion requires authorized operator review',
        requiresOperatorReview:true,
        gate:'middlewear-human-review',
      })
    }

    const auditReady=await writeAudit(supabase,{
      user:req.user,
      eventType:'middlewear.handoff_completion_authorized',
      severity:policy.highImpact||policy.moneySensitive?'important':'info',
      requestId:req.middleWearSecurity?.requestId,
      metadata:{handoffId:id,routeKey:handoff.route_key,operatorRole:operatorRole(req.user)},
    })
    if((policy.highImpact||policy.moneySensitive)&&!auditReady){
      return res.status(503).json({error:'Security audit persistence is required before completion',gate:'middlewear-audit'})
    }
    next()
  }

  function middleware(){
    return [authenticate,loadRoutePolicy,guardHighImpactCompletion]
  }

  return{
    middleware,
    authenticate,
    loadRoutePolicy,
    guardHighImpactCompletion,
    classifyRoute,
    providerReadiness,
    policy:{
      product:'TRYAMM MiddleWear Security Gateway',
      orderedControls:[
        'Jacobie security headers',
        'Red Hat Sentinel',
        'Jacobie Swarm Shield',
        'Supabase identity verification',
        'Middleverse route risk policy',
        'provider readiness gate',
        'security audit persistence',
        'human/operator review for high-impact completion',
      ],
      rawAuthorizationStored:false,
      rawIpStored:false,
      failClosedHighImpact:true,
    },
  }
}

module.exports={
  createMiddleWearSecurityGateway,
  classifyRoute,
  providerReadiness,
  operatorRole,
  MIDDLEWEAR_MAX_MUTATION_BYTES,
}