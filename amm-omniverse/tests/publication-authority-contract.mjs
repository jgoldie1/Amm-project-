import fs from 'node:fs'
import assert from 'node:assert/strict'

const file='supabase/migrations/20260924190000_release1_publication_authority_hardening.sql'
const sql=fs.readFileSync(file,'utf8')

assert.match(sql,/drop policy if exists media_publications_owner_insert/i)
assert.match(sql,/drop policy if exists media_publications_owner_update/i)
assert.doesNotMatch(sql,/create policy media_publications_owner_insert/i)
assert.doesNotMatch(sql,/create policy media_publications_owner_update/i)
assert.match(sql,/status = 'delivered'/i)
assert.match(sql,/moderation_status in \('approved','restored'\)/i)
console.log('publication authority hardening contract ok')
