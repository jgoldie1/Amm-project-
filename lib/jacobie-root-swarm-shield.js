'use strict'

const crypto=require('node:crypto')
const buckets=new Map()
const SALT=crypto.randomBytes(32)

function keyFor(req){
  const ip=String(req.headers['x-forwarded-for']||req.ip||req.socket?.remoteAddress||'unknown').split(',')[0].trim()
  const secret=String(process.env.SWARM_SHIELD_PEPPER||process.env.SESSION_TOKEN_PEPPER||'')
  return crypto.createHmac('sha256',secret||SALT).update(ip).digest('hex')
}
function routeClass(req){
  const p=String(req.path||req.url||'/')
  if(p.startsWith('/api/auth/'))return'auth'
  if(p.startsWith('/api/checkout')||p.startsWith('/api/payments/'))return'commerce'
  if(p.startsWith('/api/rooms')||p.startsWith('/socket.io'))return'realtime'
  if(p.startsWith('/api/admin'))return'admin'
  return'normal'
}
const POLICY={
  auth:{max:30,windowMs:60_000},
  commerce:{max:40,windowMs:60_000},
  realtime:{max:180,windowMs:60_000},
  admin:{max:30,windowMs:60_000},
  normal:{max:240,windowMs:60_000},
}
function rootSwarmShield(req,res,next){
  const cls=routeClass(req),policy=POLICY[cls]||POLICY.normal
  const k=keyFor(req)+':'+cls,now=Date.now()
  let bucket=buckets.get(k)
  if(!bucket||now-bucket.start>=policy.windowMs)bucket={start:now,count:0}
  bucket.count+=1;buckets.set(k,bucket)
  if(buckets.size>20_000){
    for(const [id,item] of buckets)if(now-item.start>5*60_000)buckets.delete(id)
  }
  res.setHeader('X-TRYAMM-Swarm-Shield','root-active')
  if(bucket.count>policy.max){
    res.setHeader('Retry-After','30')
    return res.status(429).json({error:'Request rate temporarily limited'})
  }
  next()
}
module.exports={rootSwarmShield,routeClass,POLICY}
