'use strict'

const assert=require('node:assert/strict')
const {inspectRequest,buildSentinelEvent,createRedHatSentinel,safeBodyDigest}=require('../lib/red-hat-sentinel')

function req(path,extra={}){
  return{
    path,
    url:path,
    originalUrl:path,
    method:'GET',
    ip:'203.0.113.5',
    protocol:'https',
    headers:{'user-agent':'curl/8.0',host:'tryamm.online',...extra.headers},
    securityContext:{requestId:'test-request-1234'},
    body:extra.body,
    ...extra,
  }
}

{
  const inspection=inspectRequest(req('/.env'))
  assert.equal(inspection.suspicious,true)
  assert.ok(inspection.signalCodes.includes('canary-route'))
  assert.ok(inspection.signalCodes.includes('secret-file-probe'))
}

{
  const inspection=inspectRequest(req('/search?q=../../etc/passwd',{originalUrl:'/search?q=../../etc/passwd'}))
  assert.equal(inspection.suspicious,true)
  assert.ok(inspection.signalCodes.includes('path-traversal'))
}

{
  const inspection=inspectRequest(req('/api/items?id=1%20UNION%20SELECT%20x',{originalUrl:'/api/items?id=1%20UNION%20SELECT%20x'}))
  assert.ok(inspection.signalCodes.includes('sql-injection-probe'))
}

{
  const event=buildSentinelEvent(req('/.git/config',{headers:{authorization:'Bearer SECRET','cookie':'session=SECRET'}}),inspectRequest(req('/.git/config')),'canary-contact')
  assert.equal(event.metadata.credentials_stored,false)
  assert.equal(event.metadata.authorization_headers_stored,false)
  assert.equal(event.metadata.cookies_stored,false)
  assert.equal(event.metadata.raw_source_address_stored,false)
  assert.equal(event.metadata.raw_payload_stored,false)
  assert.notEqual(event.source_hash,'203.0.113.5')
  assert.equal(event.expires_at>event.occurred_at,true)
}

{
  const digest=safeBodyDigest({password:'do-not-store'})
  assert.equal(typeof digest.payloadSha256,'string')
  assert.equal(Object.prototype.hasOwnProperty.call(digest,'raw'),false)
}

{
  const inserts=[]
  const supabase={
    from(){
      return{
        insert:async value=>{inserts.push(value);return{error:null}},
        delete(){return{lt:async()=>({error:null})}},
      }
    },
  }
  const sentinel=createRedHatSentinel({supabase})
  assert.equal(sentinel.policy.hackBack,false)
  assert.equal(sentinel.policy.rawCredentialsStored,false)
  assert.equal(sentinel.policy.rawPayloadStored,false)
  assert.equal(sentinel.policy.rawIpStored,false)
  assert.equal(sentinel.policy.retentionDays,14)
}

console.log('TRYAMM Red Hat Sentinel contract: PASS')
