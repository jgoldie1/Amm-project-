import fs from 'node:fs'
import test from 'node:test'
import assert from 'node:assert/strict'

const source=fs.readFileSync(new URL('../selftest.js',import.meta.url),'utf8')

test('successful readiness response reports provider and selected model',()=>{
  assert.match(source,/provider:'vercel-ai-gateway-auto',model,response:text/)
})

test('failed readiness response reports diagnostic errors',()=>{
  assert.match(source,/provider:'diagnostic',model:null,errors/)
})
