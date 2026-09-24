import fs from 'node:fs'
import assert from 'node:assert/strict'
const sql=fs.readFileSync('supabase/migrations/20260924200000_release1_trusted_publication_transition.sql','utf8')
assert.match(sql,/security definer/i)
assert.match(sql,/auth\.uid\(\)/i)
assert.match(sql,/owner_id=v_uid/i)
assert.match(sql,/status in \('queued','processing'\)/i)
assert.match(sql,/moderation_status.*approved.*restored/is)
assert.match(sql,/rights_status.*original.*licensed.*cleared/is)
assert.match(sql,/destination_not_in_job/i)
assert.match(sql,/revoke all.*from public/is)
console.log('trusted publication transition contract ok')
