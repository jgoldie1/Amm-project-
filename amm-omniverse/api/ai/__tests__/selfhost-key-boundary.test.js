import fs from 'node:fs'
import test from 'node:test'
import assert from 'node:assert/strict'

const source=fs.readFileSync(new URL('../answer.js',import.meta.url),'utf8')

test('self-host API key remains server environment sourced',()=>{
  assert.match(source,/process\.env\.HOLOGPT_SELFHOST_API_KEY/)
})
