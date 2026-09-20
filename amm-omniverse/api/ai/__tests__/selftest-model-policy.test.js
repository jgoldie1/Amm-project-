import fs from 'node:fs'
import test from 'node:test'
import assert from 'node:assert/strict'

const source=fs.readFileSync(new URL('../selftest.js',import.meta.url),'utf8')
const answerSource=fs.readFileSync(new URL('../answer.js',import.meta.url),'utf8')

test('HoloGPT selftest uses current free gateway fallbacks and rejects stale paid fallback',()=>{
  assert.match(source,/inclusionai\/ling-3\.0-flash-sante-free/)
  assert.match(source,/inclusionai\/ling-3\.0-flash-vl-free/)
  assert.doesNotMatch(source,/openai\/gpt-5\.4/)
  assert.doesNotMatch(source,/ling-3\.0-tiny-free/)
  assert.doesNotMatch(source,/ling-3\.0-flash-free/)
})

test('HoloGPT readiness probe has enough output budget and still requires the readiness token',()=>{
  assert.match(source,/maxOutputTokens:128/)
  assert.match(source,/text\.includes\(['"]HOLOGPT_READY['"]\)/)
})

test('HoloGPT full answer gateway avoids the paid-only gateway fallback',()=>{
  assert.match(answerSource,/inclusionai\/ling-3\.0-flash-sante-free/)
  assert.match(answerSource,/inclusionai\/ling-3\.0-flash-vl-free/)
  assert.doesNotMatch(answerSource,/models=\[configured[^\n]*openai\/gpt-5\.4/)
})
