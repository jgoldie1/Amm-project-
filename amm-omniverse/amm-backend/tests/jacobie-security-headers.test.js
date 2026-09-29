'use strict'

const assert=require('node:assert/strict')
const {jacobieSecurityHeaders,noStoreSensitive}=require('../lib/jacobie-security-headers')

function fake(){
  const headers={}
  const req={headers:{}}
  const res={setHeader:(k,v)=>{headers[k]=v}}
  return{req,res,headers}
}

{
  const {req,res,headers}=fake()
  let next=false
  jacobieSecurityHeaders(req,res,()=>{next=true})
  assert.equal(next,true)
  assert.match(headers['X-Request-ID'],/^[0-9a-f-]{36}$/i)
  assert.equal(headers['X-Content-Type-Options'],'nosniff')
  assert.equal(headers['X-Frame-Options'],'SAMEORIGIN')
  assert.equal(headers['Referrer-Policy'],'strict-origin-when-cross-origin')
  assert.equal(headers['Cross-Origin-Opener-Policy'],'same-origin-allow-popups')
  assert.equal(headers['Cross-Origin-Resource-Policy'],'same-site')
  assert.match(headers['Permissions-Policy'],/camera=\(self\)/)
  assert.match(headers['Strict-Transport-Security'],/max-age=31536000/)
  assert.equal(headers['X-TRYAMM-Security'],'Jacobie-Quantum-Shield')
  assert.ok(req.securityContext.requestId)
}

{
  const {req,res,headers}=fake()
  let next=false
  noStoreSensitive(req,res,()=>{next=true})
  assert.equal(next,true)
  assert.equal(headers['Cache-Control'],'no-store, private')
  assert.equal(headers['Pragma'],'no-cache')
}

console.log('Jacobie security headers contract: PASS')
