import fs from 'node:fs'
import test from 'node:test'
import assert from 'node:assert/strict'

const answer=fs.readFileSync(new URL('../answer.js',import.meta.url),'utf8')
const selftest=fs.readFileSync(new URL('../selftest.js',import.meta.url),'utf8')

test('AI SDK gateway provider label remains consistent',()=>{
  assert.match(answer,/provider:'vercel-ai-gateway-auto'/)
  assert.match(selftest,/provider:'vercel-ai-gateway-auto'/)
})
