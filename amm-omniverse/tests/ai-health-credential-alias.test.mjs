import {test} from 'node:test'
import assert from 'node:assert/strict'
import health from '../api/ai/health.js'
import hierarchy from '../api/ai/hierarchy.js'
const keys=['OPENAI_API_KEY','open_ai_keys','TRYAMM_AI_API_KEY','TRYAMM_AI_PROVIDER_KEY']
async function invoke(handler){let body;await handler({method:'GET'},{setHeader(){},status(){return this},json(value){body=value}});return body}
test('every answer-route OpenAI credential alias is recognized without exposing credentials',async()=>{
 const saved=Object.fromEntries(keys.map(k=>[k,process.env[k]]))
 try{
  for(const key of keys){
   for(const k of keys)delete process.env[k]
   process.env[key]='fake-test-credential'
   const status=await invoke(health), structure=await invoke(hierarchy)
   assert.equal(status.providers.openai,true,key)
   assert.equal(structure.providers.openai,true,key)
   assert.equal(status.responseVerified,false)
   assert.equal(status.verification,'configuration-only')
   assert.ok(!JSON.stringify([status,structure]).includes('fake-test-credential'))
  }
  for(const k of keys)delete process.env[k]
  assert.equal((await invoke(health)).providers.openai,false)
 }finally{for(const k of keys){if(saved[k]===undefined)delete process.env[k];else process.env[k]=saved[k]}}
})
