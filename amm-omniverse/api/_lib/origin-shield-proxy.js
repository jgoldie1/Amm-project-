import crypto from 'node:crypto'

const ORIGIN=(process.env.TRYAMM_RENDER_ORIGIN||'https://amm-project-1-rpz9.onrender.com').replace(/\/$/,'')
const SECRET=()=>String(process.env.TRYAMM_EDGE_ORIGIN_SECRET||'').trim()

function rawBody(req){
  if(Buffer.isBuffer(req.body))return req.body
  if(typeof req.body==='string')return Buffer.from(req.body)
  if(req.body==null)return Buffer.alloc(0)
  return Buffer.from(JSON.stringify(req.body))
}

export async function proxyProtectedOrigin(req,res,targetPath,{raw=false}={}){
  const secret=SECRET()
  const body=rawBody(req)
  const ts=Date.now()
  const requestId=crypto.randomUUID()
  const hash=crypto.createHash('sha256').update(body).digest('hex')
  const canonical=[String(req.method||'GET').toUpperCase(),targetPath,String(ts),requestId,hash].join('\n')
  const signature=secret?crypto.createHmac('sha256',secret).update(canonical).digest('hex'):''

  const headers={}
  for(const [key,value] of Object.entries(req.headers||{})){
    const lower=key.toLowerCase()
    if(['host','content-length','x-forwarded-for','x-real-ip','cf-connecting-ip'].includes(lower))continue
    if(lower.startsWith('x-tryamm-edge-'))continue
    if(value!=null)headers[key]=Array.isArray(value)?value.join(','):String(value)
  }
  headers['x-tryamm-edge-timestamp']=String(ts)
  headers['x-tryamm-edge-request-id']=requestId
  if(signature)headers['x-tryamm-edge-signature']=signature

  const controller=new AbortController()
  const timeout=setTimeout(()=>controller.abort(),12_000)
  try{
    const response=await fetch(ORIGIN+targetPath,{
      method:req.method,
      headers,
      body:['GET','HEAD'].includes(String(req.method||'GET').toUpperCase())?undefined:body,
      redirect:'manual',
      signal:controller.signal,
    })
    res.status(response.status)
    for(const [key,value] of response.headers){
      const lower=key.toLowerCase()
      if(['connection','transfer-encoding','content-encoding','content-length'].includes(lower))continue
      res.setHeader(key,value)
    }
    res.setHeader('X-TRYAMM-Origin-Shield',secret?'vercel-signed':'vercel-monitor-unconfigured')
    const out=Buffer.from(await response.arrayBuffer())
    return res.send(out)
  }catch(error){
    const timedOut=error?.name==='AbortError'
    return res.status(timedOut?504:502).json({error:timedOut?'Protected origin timeout':'Protected origin unavailable'})
  }finally{clearTimeout(timeout)}
}

export const config={api:{bodyParser:false}}