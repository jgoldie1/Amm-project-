import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import handler from '../api/holo/authorization-preflight.js'
const invoke=async(req)=>{const res={headers:{},setHeader(key,value){this.headers[key]=value;return this},status(code){this.code=code;return this},json(data){this.payload=data;return this}};await handler(req,res);return res}
test('rejects GET and invalid/empty actions',async()=>{
 const get=await invoke({method:'GET',body:{}})
 assert.equal(get.code,405)
 const invalid=await invoke({method:'POST',body:{action:'custom-magic',passportId:'00000000-0000-4000-8000-000000000001',region:'Chicago, IL'}})
 assert.equal(invalid.code,400)
})
test('rejects malformed passport identifiers and unsafe region filters',async()=>{
 const bad=await invoke({method:'POST',headers:{},body:{action:'dispatch-ride',passportId:'id.or.(status.eq.approved)',region:'Chicago, IL'}})
 assert.equal(bad.code,400)
 const badRegion=await invoke({method:'POST',headers:{},body:{action:'dispatch-ride',passportId:'00000000-0000-4000-8000-000000000001',region:'Chicago, IL);drop table x;--'}})
 assert.equal(badRegion.code,400)
})
test('Passport IDs must be structurally valid RFC UUIDs before authentication or privileged queries',async()=>{
 const candidates=[
  'not-a-uuid',
  '00000000-0000-0000-8000-000000000001',
  '00000000-0000-4000-0000-000000000001',
  '00000000-0000-4000-8000-000000000001.or.status.eq.approved',
  '00000000-0000-4000-8000-000000000001'.padEnd(81,'x'),
  1234,
  null
 ]
 for(const passportId of candidates){
  const result=await invoke({method:'POST',headers:{},body:{action:'dispatch-ride',passportId,region:'Chicago, IL'}})
  assert.equal(result.code,400,String(passportId))
 }
})
test('requires bearer JWT, not client-provided approval flags',async()=>{
 const result=await invoke({method:'POST',body:{action:'dispatch-drone',passportId:'00000000-0000-4000-8000-000000000001',region:'Chicago, IL',approved:true,providerVerified:true},headers:{}})
 assert.equal(result.code,401)
 assert.equal(result.headers['Cache-Control'],'no-store')
})
test('rejects unverified tokens and does not call privileged registry',async()=>{
 const old=globalThis.fetch
 const oldUrl=process.env.SUPABASE_URL,oldKey=process.env.SUPABASE_ANON_KEY
 process.env.SUPABASE_URL='https://example.supabase.co'
 process.env.SUPABASE_ANON_KEY='public-key'
 let calls=0
 globalThis.fetch=async()=>{calls++;return {ok:false,status:401}}
 try{
  const res=await invoke({method:'POST',headers:{authorization:'Bearer header.payload.signature'},body:{action:'charge-payment',passportId:'00000000-0000-4000-8000-000000000001',region:'Chicago, IL',simulation:false,approved:true}})
  assert.equal(res.code,401)
  assert.equal(calls,1)
 }finally{
  globalThis.fetch=old
  if(oldUrl===undefined)delete process.env.SUPABASE_URL;else process.env.SUPABASE_URL=oldUrl
  if(oldKey===undefined)delete process.env.SUPABASE_ANON_KEY;else process.env.SUPABASE_ANON_KEY=oldKey
 }
})
test('never creates a payment/dispatch/advertising side effect',()=>{
 const source=fs.readFileSync(new URL('../api/holo/authorization-preflight.js',import.meta.url),'utf8')
 assert.doesNotMatch(source,/ready:\s*true/)
 assert.doesNotMatch(source,/method:\s*['"](?:PATCH|PUT|DELETE)['"]/)
 assert.match(source,/dispatchAuthorized:false,paymentAuthorized:false/)
 assert.match(source,/owner_user_id:'eq.'\+userId/)
 assert.match(source,/provider_and_covenant_evidence_required/)
})
