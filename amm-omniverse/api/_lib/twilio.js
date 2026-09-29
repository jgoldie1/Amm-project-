import crypto from 'node:crypto'

export function twilioConfigured(){
  return Boolean(process.env.TWILIO_ACCOUNT_SID&&process.env.TWILIO_AUTH_TOKEN&&process.env.TWILIO_PHONE_NUMBER)
}

export function appBaseUrl(req){
  const configured=process.env.VITE_APP_URL||process.env.NEXT_PUBLIC_APP_URL
  if(configured)return configured.replace(/\/$/,'')
  const proto=String(req.headers['x-forwarded-proto']||'https').split(',')[0]
  const host=String(req.headers['x-forwarded-host']||req.headers.host||'tryamm.online').split(',')[0]
  return `${proto}://${host}`
}

export function requestUrl(req){
  return `${appBaseUrl(req)}${req.url}`
}

export function formBody(req){
  if(req.body&&typeof req.body==='object'&&!Buffer.isBuffer(req.body))return req.body
  if(typeof req.body==='string')return Object.fromEntries(new URLSearchParams(req.body).entries())
  return {}
}

// TWILIO_LEGACY_HMAC_SHA1_COMPAT:
 // Twilio's legacy/default X-Twilio-Signature scheme requires HMAC-SHA1.
 // This path verifies an external provider signature only; TRYAMM does not use SHA-1
 // for its own hashes, tokens, storage integrity, signing, or key derivation.
 // Prefer TWILIO_WEBHOOK_SIGNATURE_ALGORITHM=sha256 with a Twilio SharedKey when configured.
export function validateTwilio(req,params=formBody(req)){
  const authToken=process.env.TWILIO_AUTH_TOKEN
  const signature=String(req.headers['x-twilio-signature']||'')
  if(!signature)return false

  const requested=String(process.env.TWILIO_WEBHOOK_SIGNATURE_ALGORITHM||'sha1').trim().toLowerCase()
  const algorithm=requested==='sha256'?'sha256':'sha1'
  const sharedKeySid=String(process.env.TWILIO_WEBHOOK_SHARED_KEY_SID||'').trim()
  const sharedKeySecret=String(process.env.TWILIO_WEBHOOK_SHARED_KEY_SECRET||'')
  const signatureKeySid=String(req.headers['x-twilio-signature-key-sid']||'').trim()

  let secret=authToken
  if(algorithm==='sha256'){
    if(!sharedKeySid||!sharedKeySecret||signatureKeySid!==sharedKeySid)return false
    secret=sharedKeySecret
  }
  if(!secret)return false

  const ordered=Object.keys(params).sort().map(k=>`${k}${params[k]??''}`).join('')
  const expected=crypto.createHmac(algorithm,secret).update(`${requestUrl(req)}${ordered}`,'utf8').digest('base64')
  try{
    const expectedBuffer=Buffer.from(expected)
    const signatureBuffer=Buffer.from(signature)
    return expectedBuffer.length===signatureBuffer.length&&crypto.timingSafeEqual(expectedBuffer,signatureBuffer)
  }catch{return false}
}

export function xmlEscape(v=''){
  return String(v).replace(/[<>&'\"]/g,c=>({ '<':'&lt;','>':'&gt;','&':'&amp;',"'":'&apos;','\"':'&quot;' }[c]))
}

export function twiml(res,inner,status=200){
  res.status(status).setHeader('Content-Type','text/xml; charset=utf-8')
  res.setHeader('Cache-Control','no-store')
  return res.send(`<?xml version="1.0" encoding="UTF-8"?><Response>${inner}</Response>`)
}

export async function twilioApi(path,body){
  if(!twilioConfigured())throw new Error('twilio_not_configured')
  const sid=process.env.TWILIO_ACCOUNT_SID
  const auth='Basic '+Buffer.from(`${sid}:${process.env.TWILIO_AUTH_TOKEN}`).toString('base64')
  const response=await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}${path}`,{
    method:'POST',headers:{Authorization:auth,'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams(body)
  })
  let data={};try{data=await response.json()}catch{}
  if(!response.ok)throw new Error(data.message||`twilio_${response.status}`)
  return data
}