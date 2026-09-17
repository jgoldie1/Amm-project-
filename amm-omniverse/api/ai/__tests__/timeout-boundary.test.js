import fs from 'node:fs'
import test from 'node:test'
import assert from 'node:assert/strict'

const source=fs.readFileSync(new URL('../selftest.js',import.meta.url),'utf8')

test('readiness probe keeps bounded configurable timeout',()=>{
  assert.match(source,/Math\.max\(3000,Math\.min\(15000,Number\(process\.env\.HOLOGPT_SELFTEST_TIMEOUT_MS\|\|8000\)\)\)/)
  assert.match(source,/AbortSignal\.timeout\(timeoutMs\(\)\)/)
})
