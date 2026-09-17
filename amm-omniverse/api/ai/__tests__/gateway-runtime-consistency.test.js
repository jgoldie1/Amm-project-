import fs from 'node:fs'
import test from 'node:test'
import assert from 'node:assert/strict'

const answer=fs.readFileSync(new URL('../answer.js',import.meta.url),'utf8')
const selftest=fs.readFileSync(new URL('../selftest.js',import.meta.url),'utf8')
const fallback='inclusionai/ling-3.0-flash-sante-free'

test('runtime answer and readiness probe share the same current free fallback',()=>{
  assert.ok(answer.includes(fallback))
  assert.ok(selftest.includes(fallback))
})
