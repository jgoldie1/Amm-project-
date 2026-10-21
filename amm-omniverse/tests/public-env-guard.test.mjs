import test from 'node:test'
import assert from 'node:assert/strict'
import {assertSafePublicEnv,isPrivilegedSupabaseCredential} from '../scripts/public-env-guard.mjs'
const jwt=role=>Buffer.from('{}').toString('base64url')+'.'+Buffer.from(JSON.stringify({role})).toString('base64url')+'.synthetic-test-signature'
test('server credentials in browser-visible variables stop the build without printing values',()=>{
 for(const value of [jwt('service_role'),jwt('supabase_admin'),'sb_secret_synthetic_test_only']){
  assert.equal(isPrivilegedSupabaseCredential(value),true)
  try{assertSafePublicEnv({VITE_SUPABASE_ANON_KEY:value});assert.fail('Expected failure')}catch(error){assert.match(error.message,/VITE_SUPABASE_ANON_KEY/);assert.ok(!error.message.includes(value))}
 }
})
test('publishable and anonymous keys are allowed in public configuration',()=>{
 assert.doesNotThrow(()=>assertSafePublicEnv({VITE_SUPABASE_ANON_KEY:jwt('anon'),VITE_SUPABASE_PUBLISHABLE_KEY:'sb_publishable_synthetic_test_only'}))
})
test('server-only environment variables remain available to server functions',()=>{
 assert.doesNotThrow(()=>assertSafePublicEnv({SUPABASE_SERVICE_ROLE_KEY:jwt('service_role')}))
})
