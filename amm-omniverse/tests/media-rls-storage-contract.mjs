import fs from 'node:fs'
import assert from 'node:assert/strict'

const read=path=>fs.readFileSync(new URL(path,import.meta.url),'utf8')
const user=read('../api/_lib/supabase-user.js')
const storage=read('../api/_lib/media-storage.js')
const health=read('../api/media/health.js')
const intent=read('../api/media/upload-intent.js')
const complete=read('../api/media/upload-complete.js')
const publish=read('../api/media/publish.js')

for(const source of [storage,health,intent,complete,publish]){
  assert.doesNotMatch(source,/SUPABASE_SERVICE_ROLE_KEY/,'creator media must not depend on an all-powerful service-role credential')
}

assert.match(user,/authorization:`Bearer \$\{token\}`/,'user REST must forward the validated creator JWT')
assert.match(user,/apikey:publicKey\(\)/,'user REST must pair the JWT with a publishable key')
assert.match(user,/publicDataApiProbe/,'media health must probe the real Supabase Data API')
assert.match(storage,/createSignedUpload\(req,path\)/)
assert.match(storage,/verifyStoredObject\(req,path\)/)
assert.match(storage,/createSignedPlayback\(req,path,expiresIn=3600\)/)
assert.match(storage,/userAccessToken\(req\)/)
assert.match(health,/authMode:'authenticated-user-rls'/)
assert.match(health,/serviceRoleRequired:false/)
assert.match(health,/dataApiReachable:probe\.ok/)
assert.match(intent,/requireUser\(req,res\)/)
assert.match(intent,/userRest\(req,'media_catalog'/)
assert.match(intent,/createSignedUpload\(req,storagePath\)/)
assert.match(complete,/userRest\(req,'media_catalog'/)
assert.match(complete,/verifyStoredObject\(req,storagePath\)/)
assert.match(complete,/createSignedPlayback\(req,storagePath,3600\)/)
assert.match(publish,/userRest\(req,'media_publish_jobs'/)

console.log('Creator media RLS storage contract passed: authenticated creator JWT + publishable key, no service-role dependency')
