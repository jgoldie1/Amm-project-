import fs from 'node:fs'
import assert from 'node:assert/strict'
const source=fs.readFileSync('api/media/process-publish.js','utf8')
assert.match(source,/rpc\/release1_deliver_publication/)
assert.match(source,/p_job_id:job\.id/)
assert.match(source,/p_destination:destination/)
assert.match(source,/trusted_publication_transition_failed/)
assert.doesNotMatch(source,/userRest\(req,'media_publications',\{method:'POST'/)
assert.doesNotMatch(source,/userRest\(req,'media_publications',\{method:'PATCH'/)
console.log('trusted publication processor wiring ok')
