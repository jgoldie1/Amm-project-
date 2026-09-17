import fs from 'node:fs'
import test from 'node:test'
import assert from 'node:assert/strict'

const answer=fs.readFileSync(new URL('../answer.js',import.meta.url),'utf8')
const selftest=fs.readFileSync(new URL('../selftest.js',import.meta.url),'utf8')

test('diagnostic fallback remains degraded and cannot certify HoloGPT',()=>{
  assert.match(answer,/provider:'diagnostic',model:null/)
  assert.match(answer,/degraded:true/)
  assert.match(selftest,/ok:false,degraded:true,provider:'diagnostic',model:null/)
})
