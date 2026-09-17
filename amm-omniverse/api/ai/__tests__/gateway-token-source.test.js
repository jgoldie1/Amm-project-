import fs from 'node:fs'
import test from 'node:test'
import assert from 'node:assert/strict'

const source=fs.readFileSync(new URL('../answer.js',import.meta.url),'utf8')

test('direct gateway token remains server-side environment sourced',()=>{
  assert.match(source,/process\.env\.AI_GATEWAY_API_KEY\|\|process\.env\.VERCEL_OIDC_TOKEN/)
})
