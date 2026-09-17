import fs from 'node:fs'
import test from 'node:test'
import assert from 'node:assert/strict'

const source=fs.readFileSync(new URL('../answer.js',import.meta.url),'utf8')

test('HoloGPT runtime uses the current gateway fallback and rejects stale Ling IDs',()=>{
  assert.match(source,/inclusionai\/ling-3\.0-flash-sante-free/)
  assert.doesNotMatch(source,/ling-3\.0-tiny-free/)
  assert.doesNotMatch(source,/ling-3\.0-flash-free/)
})
