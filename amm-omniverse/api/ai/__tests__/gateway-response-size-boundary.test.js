import fs from 'node:fs'
import test from 'node:test'
import assert from 'node:assert/strict'

const answer=fs.readFileSync(new URL('../answer.js',import.meta.url),'utf8')
const selftest=fs.readFileSync(new URL('../selftest.js',import.meta.url),'utf8')

test('runtime and readiness keep bounded generation sizes',()=>{
  assert.match(answer,/maxOutputTokens:2200/)
  assert.match(selftest,/maxOutputTokens:12/)
})
