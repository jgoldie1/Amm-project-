import fs from 'node:fs'
import test from 'node:test'
import assert from 'node:assert/strict'

const source=fs.readFileSync(new URL('../answer.js',import.meta.url),'utf8')

test('HoloGPT keeps recent history bounded',()=>{
  assert.match(source,/history\.slice\(-10\)/)
  assert.match(source,/\.slice\(-10\):\[\]/)
})
