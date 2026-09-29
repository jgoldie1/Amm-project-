'use strict'

const crypto=require('node:crypto')

const EPHEMERAL=crypto.randomBytes(32)

function shieldKey(){
  const configured=String(process.env.SWARM_SHIELD_PEPPER||process.env.RED_HAT_TELEMETRY_PEPPER||process.env.SESSION_TOKEN_PEPPER||'').trim()
  return configured?Buffer.from(configured):EPHEMERAL
}

function hash(value){return crypto.createHmac('sha256',shieldKey()).update(String(value||'')).digest('hex')}
function sourceAddress(req){
  const forwarded=String(req.headers?.['x-forwarded-for']||'').split(',')[0].trim()
  return forwarded||String(req.ip||req.socket?.remoteAddress||'unknown')
}
function authIdentity(req){
  const auth=String(req.headers?.authorization||'').trim()
  return auth?hash(auth):'anonymous'
}
function pathClass(req){
  const p=String(req.path||req.url||'/').split('?')[0]
  if(p.startsWith('/api/ai'))return'ai-expensive'
  if(p.startsWith('/api/asset-forge'))return'asset-expensive'
  if(p.startsWith('/api/accessibility/sign/recognize'))return'media-expensive'
  if(p.startsWith('/api/live'))return'live-realtime'
  if(p.startsWith('/api/security'))return'security-sensitive'
  if(p.startsWith('/api/privacy'))return'privacy-sensitive'
  if(p.startsWith('/api/treasury')||p.startsWith('/api/financial-truth'))return'financial-sensitive'
  if(p.startsWith('/api/checkout')||p.startsWith('/api/payments'))return'commerce-sensitive'
  if(p.startsWith('/api/stripe/webhook'))return'provider-webhook'
  if(p.startsWith('/api/health')||p==='/')return'health'
  return'normal'
}

const POLICIES={
  'ai-expensive':{capacity:12,refillPerSec:.2,cost:3,degradeable:true},
  'asset-expensive':{capacity:8,refillPerSec:.1,cost:4,degradeable:true},
  'media-expensive':{capacity:10,refillPerSec:.16,cost:3,degradeable:true},
  'live-realtime':{capacity:60,refillPerSec:1,cost:1,degradeable:true},
  'security-sensitive':{capacity:20,refillPerSec:.33,cost:2,degradeable:false},
  'privacy-sensitive':{capacity:12,refillPerSec:.2,cost:2,degradeable:false},
  'financial-sensitive':{capacity:18,refillPerSec:.3,cost:2,degradeable:false},
  'commerce-sensitive':{capacity:24,refillPerSec:.4,cost:2,degradeable:false},
  'provider-webhook':{capacity:120,refillPerSec:2,cost:1,degradeable:false},
  'health':{capacity:120,refillPerSec:2,cost:1,degradeable:false},
  normal:{capacity:90,refillPerSec:1.5,cost:1,degradeable:true},
}

function createBucket(capacity,now){return{tokens:capacity,last:now}}
function take(bucket,policy,now){
  const elapsed=Math.max(0,(now-bucket.last)/1000)
  bucket.tokens=Math.min(policy.capacity,bucket.tokens+elapsed*policy.refillPerSec)
  bucket.last=now
  if(bucket.tokens<policy.cost)return false
  bucket.tokens-=policy.cost
  return true
}

function createJacobieSwarmShield({now=()=>Date.now()}={}){
  const routeBuckets=new Map()
  const sourceBuckets=new Map()
  const globalWindows=[]
  const MAX_BUCKETS=25000
  let requestsSeen=0

  function prune(ts){
    if(++requestsSeen%500!==0)return
    const cutoff=ts-15*60*1000
    for(const [k,v] of routeBuckets)if(v.last<cutoff)routeBuckets.delete(k)
    for(const [k,v] of sourceBuckets)if(v.last<cutoff)sourceBuckets.delete(k)
    if(routeBuckets.size>MAX_BUCKETS){
      const entries=[...routeBuckets.entries()].sort((a,b)=>a[1].last-b[1].last).slice(0,routeBuckets.size-MAX_BUCKETS)
      for(const [k] of entries)routeBuckets.delete(k)
    }
    if(sourceBuckets.size>MAX_BUCKETS){
      const entries=[...sourceBuckets.entries()].sort((a,b)=>a[1].last-b[1].last).slice(0,sourceBuckets.size-MAX_BUCKETS)
      for(const [k] of entries)sourceBuckets.delete(k)
    }
  }

  function globalPressure(ts){
    while(globalWindows.length&&globalWindows[0]<ts-10_000)globalWindows.shift()
    return globalWindows.length
  }

  function middleware(req,res,next){
    const ts=now()
    prune(ts)
    globalWindows.push(ts)

    const cls=pathClass(req)
    const policy=POLICIES[cls]||POLICIES.normal
    const source=hash(sourceAddress(req))
    const principal=authIdentity(req)
    const routeKey=`${source}:${principal}:${cls}`
    const sourceKey=source

    const routeBucket=routeBuckets.get(routeKey)||createBucket(policy.capacity,ts)
    const sourcePolicy={capacity:240,refillPerSec:4,cost:1}
    const sourceBucket=sourceBuckets.get(sourceKey)||createBucket(sourcePolicy.capacity,ts)
    routeBuckets.set(routeKey,routeBucket)
    sourceBuckets.set(sourceKey,sourceBucket)

    const routeAllowed=take(routeBucket,policy,ts)
    const sourceAllowed=take(sourceBucket,sourcePolicy,ts)
    const pressure=globalPressure(ts)

    req.swarmShield={
      pathClass:cls,
      sourceHash:source,
      principalHash:principal==='anonymous'?null:principal,
      globalRequests10s:pressure,
      routeRemaining:Math.max(0,Math.floor(routeBucket.tokens)),
    }

    res.setHeader('X-TRYAMM-Swarm-Shield','active')
    res.setHeader('X-RateLimit-Remaining',String(Math.max(0,Math.floor(routeBucket.tokens))))

    const declared=Number(req.headers?.['content-length']||0)
    if(declared>2_000_000){
      res.setHeader('Retry-After','60')
      return res.status(413).json({error:'Request payload exceeds protected resource limit'})
    }

    if(!routeAllowed||!sourceAllowed){
      res.setHeader('Retry-After','30')
      return res.status(429).json({error:'Request rate temporarily limited by Jacobie Swarm Shield'})
    }

    // Instance-level backpressure. Provider/CDN/WAF edge protection remains required
    // for network-scale distributed attacks spanning many app instances.
    if(pressure>1500&&policy.degradeable){
      res.setHeader('Retry-After','15')
      return res.status(503).json({
        error:'Nonessential service temporarily degraded to protect core TRYAMM systems',
        protected:true,
      })
    }

    next()
  }

  return{
    middleware,
    pathClass,
    policies:POLICIES,
    policy:{
      product:'Jacobie Swarm Shield',
      defensiveOnly:true,
      distributedAttackAware:true,
      perSource:true,
      perPrincipal:true,
      perResourceClass:true,
      expensiveProviderProtection:true,
      gracefulDegradation:true,
      instanceLevelOnly:true,
      edgeDdosProviderStillRequired:true,
      rawIpStored:false,
      rawAuthorizationStored:false,
    },
  }
}

module.exports={createJacobieSwarmShield,pathClass,POLICIES}
