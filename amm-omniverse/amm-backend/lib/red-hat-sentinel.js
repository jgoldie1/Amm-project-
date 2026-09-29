'use strict'

const crypto=require('node:crypto')

const EPHEMERAL_SALT=crypto.randomBytes(32)

const CANARY_PATHS=[
  '/.env','/.env.local','/.git/config','/.git/HEAD',
  '/wp-admin','/wp-login.php','/phpmyadmin','/server-status',
  '/actuator/env','/actuator/heapdump','/api/debug','/api/internal/config',
  '/vendor/phpunit/phpunit/src/Util/PHP/eval-stdin.php',
]

const SIGNALS=[
  ['secret-file-probe',/(?:^|\/)(?:\.env(?:\.|$)|\.git\/|id_rsa|credentials(?:\.json)?|secrets?(?:\.json|\.ya?ml)?)/i,35],
  ['path-traversal',/(?:\.\.\/|\.\.\\|%2e%2e%2f|%252e%252e)/i,45],
  ['sql-injection-probe',/(?:union(?:\s|%20)+select|sleep\s*\(|benchmark\s*\(|information_schema|or(?:\s|%20)+1=1)/i,40],
  ['xss-probe',/(?:<script|%3cscript|javascript:|onerror\s*=|onload\s*=)/i,35],
  ['shell-probe',/(?:\/bin\/sh|\/bin\/bash|cmd\.exe|powershell|%2fbin%2fsh|\$\(|;\s*(?:curl|wget|nc)\b)/i,45],
  ['framework-admin-scan',/(?:wp-admin|wp-login\.php|phpmyadmin|actuator|server-status|phpunit)/i,30],
]

function pepper(){
  const configured=String(process.env.RED_HAT_TELEMETRY_PEPPER||process.env.SESSION_TOKEN_PEPPER||process.env.STEP_UP_TOKEN_PEPPER||'').trim()
  return configured?{key:Buffer.from(configured),persistent:true}:{key:EPHEMERAL_SALT,persistent:false}
}

function hmac(value){
  return crypto.createHmac('sha256',pepper().key).update(String(value||'')).digest('hex')
}

function safeDecode(value){try{return decodeURIComponent(value)}catch{return value}}
function normalizePath(req){return String(req.path||req.url||'/').split('?')[0].slice(0,240)}
function sourceAddress(req){
  const forwarded=String(req.headers?.['x-forwarded-for']||'').split(',')[0].trim()
  return forwarded||String(req.ip||req.socket?.remoteAddress||'unknown')
}

function classifyUserAgent(value){
  const ua=String(value||'')
  if(/curl/i.test(ua))return'cli-curl'
  if(/wget/i.test(ua))return'cli-wget'
  if(/python-requests|aiohttp|httpx/i.test(ua))return'python-http'
  if(/go-http-client/i.test(ua))return'go-http'
  if(/bot|crawler|spider|scanner|nikto|nmap|sqlmap|nuclei/i.test(ua))return'automation-scanner'
  if(/mozilla/i.test(ua))return'browser-like'
  return ua?'other':'missing'
}

function safeBodyDigest(body){
  if(body==null)return{payloadSha256:null,payloadBytes:0}
  let serialized=''
  try{
    serialized=Buffer.isBuffer(body)?body.toString('utf8'):typeof body==='string'?body:JSON.stringify(body)
  }catch{serialized='[unserializable]'}
  const buf=Buffer.from(serialized)
  return{
    payloadSha256:crypto.createHash('sha256').update(buf).digest('hex'),
    payloadBytes:buf.length,
  }
}

function inspectRequest(req){
  const path=normalizePath(req)
  const query=String(req.originalUrl||req.url||path).split('?').slice(1).join('?').slice(0,800)
  const inspectText=safeDecode(query?path+'?'+query:path)
  const signalCodes=[]
  let riskScore=0

  if(CANARY_PATHS.includes(path)){signalCodes.push('canary-route');riskScore+=55}
  for(const [code,re,points] of SIGNALS){
    if(re.test(inspectText)){signalCodes.push(code);riskScore+=points}
  }
  if(['TRACE','CONNECT'].includes(String(req.method||'GET').toUpperCase())){signalCodes.push('unusual-http-method');riskScore+=35}
  if(Number(req.headers?.['content-length']||0)>2_000_000){signalCodes.push('oversized-request');riskScore+=20}

  return{suspicious:signalCodes.length>0,riskScore:Math.min(100,riskScore),signalCodes:[...new Set(signalCodes)],path}
}

function buildSentinelEvent(req,inspection,kind='suspicious-probe'){
  const ua=String(req.headers?.['user-agent']||'')
  const body=safeBodyDigest(req.body)
  const occurredAt=new Date().toISOString()
  const fingerprint=hmac([
    String(req.method||'GET').toUpperCase(),
    inspection.path,
    classifyUserAgent(ua),
    [...inspection.signalCodes].sort().join(','),
  ].join('|'))

  return{
    event_kind:kind,
    occurred_at:occurredAt,
    risk_score:inspection.riskScore,
    signal_codes:inspection.signalCodes,
    method:String(req.method||'GET').toUpperCase().slice(0,12),
    path_class:inspection.path,
    source_hash:hmac(sourceAddress(req)),
    user_agent_hash:hmac(ua),
    user_agent_class:classifyUserAgent(ua),
    request_fingerprint:fingerprint,
    request_id:String(req.securityContext?.requestId||req.headers?.['x-request-id']||'').slice(0,128)||null,
    payload_sha256:body.payloadSha256,
    payload_bytes:body.payloadBytes,
    telemetry_hash_persistent:pepper().persistent,
    expires_at:new Date(Date.now()+14*24*60*60*1000).toISOString(),
    metadata:{
      raw_source_address_stored:false,
      raw_payload_stored:false,
      authorization_headers_stored:false,
      cookies_stored:false,
      credentials_stored:false,
    },
  }
}

function createRedHatSentinel({supabase,now=()=>Date.now()}={}){
  if(!supabase)throw new Error('RED_HAT_SENTINEL_SUPABASE_REQUIRED')
  const buckets=new Map()
  let lastPurge=0

  async function store(event){
    try{
      await supabase.from('security_deception_events').insert(event)
      if(now()-lastPurge>60*60*1000){
        lastPurge=now()
        Promise.resolve(
          supabase.from('security_deception_events').delete().lt('expires_at',new Date(now()).toISOString())
        ).catch(()=>{})
      }
    }catch{
      console.warn('Red Hat Sentinel telemetry write failed',{kind:event.event_kind,risk:event.risk_score})
    }
  }

  function velocity(req){
    const key=hmac(sourceAddress(req))
    const ts=now()
    const current=buckets.get(key)||{start:ts,count:0}
    if(ts-current.start>60_000){current.start=ts;current.count=0}
    current.count+=1
    buckets.set(key,current)
    return current.count
  }

  function middleware(req,res,next){
    const inspection=inspectRequest(req)
    const count=velocity(req)
    if(count>240){
      inspection.signalCodes.push('high-velocity')
      inspection.riskScore=Math.min(100,inspection.riskScore+30)
      inspection.suspicious=true
    }
    if(!inspection.suspicious)return next()

    const kind=CANARY_PATHS.includes(inspection.path)?'canary-contact':'suspicious-probe'
    const event=buildSentinelEvent(req,inspection,kind)
    void store(event)
    req.redHatSentinel={fingerprint:event.request_fingerprint,riskScore:event.risk_score,signals:event.signal_codes}

    if(event.risk_score>=90){
      res.setHeader('Retry-After','60')
      return res.status(429).json({error:'Request temporarily blocked'})
    }
    next()
  }

  function decoyHandler(req,res){
    const inspection=inspectRequest(req)
    if(!inspection.signalCodes.includes('canary-route'))inspection.signalCodes.push('canary-route')
    inspection.riskScore=Math.max(inspection.riskScore,55)
    void store(buildSentinelEvent(req,inspection,'canary-contact'))
    res.setHeader('Cache-Control','no-store')
    return res.status(404).json({error:'Not found'})
  }

  return{
    middleware,
    decoyHandler,
    canaryPaths:[...CANARY_PATHS],
    inspectRequest,
    buildSentinelEvent,
    policy:{
      product:'TRYAMM Red Hat Sentinel',
      defensiveOnly:true,
      hackBack:false,
      rawCredentialsStored:false,
      rawPayloadStored:false,
      rawIpStored:false,
      retentionDays:14,
    },
  }
}

module.exports={
  CANARY_PATHS,
  inspectRequest,
  buildSentinelEvent,
  createRedHatSentinel,
  classifyUserAgent,
  safeBodyDigest,
}