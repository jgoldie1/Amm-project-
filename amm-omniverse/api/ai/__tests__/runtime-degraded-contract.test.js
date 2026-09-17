import fs from 'node:fs'
import test from 'node:test'
import assert from 'node:assert/strict'

const source=fs.readFileSync(new URL('../answer.js',import.meta.url),'utf8')

test('real provider answer is non-degraded while recovery fallback is degraded',()=>{
  assert.match(source,/\.\.\.result,degraded:false/)
  assert.match(source,/\.\.\.fallback,degraded:true/)
})
