import fs from 'node:fs'
import test from 'node:test'
import assert from 'node:assert/strict'

const source=fs.readFileSync(new URL('../selftest.js',import.meta.url),'utf8')

test('readiness prompt asks for one deterministic token',()=>{
  assert.match(source,/Reply with exactly HOLOGPT_READY/)
  assert.match(source,/Return the readiness token/)
})
