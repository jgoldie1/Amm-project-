import fs from 'node:fs'
import test from 'node:test'
import assert from 'node:assert/strict'

const answer=fs.readFileSync(new URL('../answer.js',import.meta.url),'utf8')
const selftest=fs.readFileSync(new URL('../selftest.js',import.meta.url),'utf8')

test('provider diagnostic messages remain bounded',()=>{
  assert.match(answer,/clean\(error\?\.message,300\)/)
  assert.match(selftest,/slice\(0,240\)/)
})
