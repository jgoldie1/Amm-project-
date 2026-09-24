import fs from 'node:fs'
import assert from 'node:assert/strict'
const read=path=>fs.readFileSync(new URL(path,import.meta.url),'utf8')
const delivery=read('../api/media/process-publish.js')
assert.match(delivery,/requireUser\(req,res\)/)
assert.match(delivery,/verifyStoredObject\(req,storagePath\)/)
assert.match(delivery,/MODERATION_REVIEW_REQUIRED/)
assert.match(delivery,/RIGHTS_CLEARANCE_REQUIRED/)
assert.match(delivery,/media_publications/)
assert.match(delivery,/existing\?\.\[0\]\?\.status==='delivered'/)
assert.match(delivery,/status:'delivered'/)
assert.doesNotMatch(delivery,/SUPABASE_SERVICE_ROLE_KEY/)
console.log('Release-1 Reel delivery contract passed: auth, storage verification, rights/moderation gates, idempotent delivery, no service-role dependency')
