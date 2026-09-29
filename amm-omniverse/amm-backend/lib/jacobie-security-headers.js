'use strict'

const crypto=require('node:crypto')

function jacobieSecurityHeaders(req,res,next){
  const requestId=String(req.headers['x-request-id']||'').match(/^[A-Za-z0-9._:-]{8,128}$/)
    ?String(req.headers['x-request-id'])
    :crypto.randomUUID()

  res.setHeader('X-Request-ID',requestId)
  res.setHeader('X-Content-Type-Options','nosniff')
  res.setHeader('X-Frame-Options','SAMEORIGIN')
  res.setHeader('Referrer-Policy','strict-origin-when-cross-origin')
  res.setHeader('Cross-Origin-Opener-Policy','same-origin-allow-popups')
  res.setHeader('Cross-Origin-Resource-Policy','same-site')
  res.setHeader('Permissions-Policy','camera=(self), microphone=(self), geolocation=(self), payment=(self)')
  res.setHeader('Strict-Transport-Security','max-age=31536000; includeSubDomains')
  res.setHeader('X-TRYAMM-Security','Jacobie-Quantum-Shield')

  req.securityContext={
    ...(req.securityContext||{}),
    requestId,
    receivedAt:Date.now(),
  }
  next()
}

function noStoreSensitive(req,res,next){
  res.setHeader('Cache-Control','no-store, private')
  res.setHeader('Pragma','no-cache')
  next()
}

module.exports={jacobieSecurityHeaders,noStoreSensitive}
