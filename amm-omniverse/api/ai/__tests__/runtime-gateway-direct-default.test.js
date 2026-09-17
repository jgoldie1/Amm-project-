import fs from 'node:fs'
import test from 'node:test'
import assert from 'node:assert/strict'

const source=fs.readFileSync(new URL('../answer.js',import.meta.url),'utf8')

test('direct Vercel gateway default matches current runtime fallback',()=>{
  assert.match(source,/HOLOGPT_GATEWAY_MODEL\|\|'inclusionai\/ling-3\.0-flash-sante-free'/)
})
