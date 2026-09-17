import fs from 'node:fs'
import test from 'node:test'
import assert from 'node:assert/strict'

const source=fs.readFileSync(new URL('../selftest.js',import.meta.url),'utf8')

test('HoloGPT selftest uses current gateway fallback and rejects stale Ling IDs',()=>{
  assert.match(source,/inclusionai\/ling-3\.0-flash-sante-free/)
  assert.doesNotMatch(source,/ling-3\.0-tiny-free/)
  assert.doesNotMatch(source,/ling-3\.0-flash-free/)
})

test('HoloGPT readiness requires the exact readiness token',()=>{
  assert.match(source,/text!==['"]HOLOGPT_READY['"]/)
})
