'use strict'

const crypto=require('node:crypto')

const PROTECTED_PATHS=[
  '/api/checkout',
  '/api/payments/status',
  '/api/payments/verify-checkout',
  '/api/creator/earnings',
  '/api/stripe/webhook',
]

function bodyHash(req){
  const raw=Buffer.isBuffer(req.rawBody)?req.rawBody:Buffer.alloc(0)
  return crypto.createHash('sha256').update(raw).digest('hex')
}

function signingSecret(){
  return String(process.env.TRYAMM_EDGE_ORIGIN_SECRET||'').trim()
}

function constantEqual(a,b){
  try{
    const aa=Buffer.from(String(a||''),'hex'),bb=Buffer.from(String(b||''),'hex')
    return aa.length===bb.length&&aa.length>0&&crypto.timingSafeEqual(aa,bb)
  }catch{return false}
}

function protectedPath(path){
  return PROTECTED_PATHS.some(item=>path===item||path.startsWith(item+'/'))
}

function verifyOriginShield(req){
  if(!protectedPath(req.path))return{required:false,ok:true,reason:'not-protected'}
  const secret=signingSecret()
  if(!secret)return{required:true,ok:false,reason:'origin-shield-not-configured'}
  const ts=Number(req.headers['x-tryamm-edge-timestamp']||0)
  const requestId=String(req.headers['x-tryamm-edge-request-id']||'')
  const signature=String(req.headers['x-tryamm-edge-signature']||'')
  if(!Number.isFinite(ts)||Math.abs(Date.now()-ts)>60_000)return{required:true,ok:false,reason:'stale-or-invalid-timestamp'}
  if(!/^[A-Za-z0-9._:-]{12,128}$/.test(requestId))return{required:true,ok:false,reason:'invalid-request-id'}
  const canonical=[
    String(req.method||'GET').toUpperCase(),
    String(req.path||'/'),
    String(ts),
    requestId,
    bodyHash(req),
  ].join('\n')
  const expected=crypto.createHmac('sha256',secret).update(canonical).digest('hex')
  return constantEqual(signature,expected)
    ?{required:true,ok:true,reason:'signed-edge-request'}
    :{required:true,ok:false,reason:'bad-signature'}
}

function requireTryammEdge(req,res,next){
  const result=verifyOriginShield(req)
  req.originShield=result
  if(!result.required||result.ok)return next()
  res.setHeader('Cache-Control','no-store')
  return res.status(403).json({error:'Protected origin route requires TRYAMM edge authorization'})
}

module.exports={PROTECTED_PATHS,verifyOriginShield,requireTryammEdge,bodyHash}
