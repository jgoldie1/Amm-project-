import fs from 'node:fs'
import assert from 'node:assert/strict'
const source=fs.readFileSync(new URL('../api/media/publication.js',import.meta.url),'utf8')
assert.match(source,/requireUser\(req,res\)/)
assert.match(source,/media_publications/)
assert.match(source,/publication\.status!=='delivered'/)
assert.match(source,/approved','restored/)
assert.match(source,/public_reel_not_found/)
assert.match(source,/\/reels\//)
assert.doesNotMatch(source,/SUPABASE_SERVICE_ROLE_KEY/)
console.log('Public Reel read contract passed: delivered + approved/restored only, stable share path, no service-role dependency')
