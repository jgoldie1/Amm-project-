import fs from 'node:fs'
import test from 'node:test'
import assert from 'node:assert/strict'

const source=fs.readFileSync(new URL('../answer.js',import.meta.url),'utf8')

test('owned OpenAI-compatible HoloGPT path remains available',()=>{
  assert.match(source,/HOLOGPT_SELFHOST_BASE/)
  assert.match(source,/HOLOGPT_SELFHOST_MODEL/)
  assert.match(source,/HOLOGPT_SELFHOST_PREFERRED/)
  assert.match(source,/provider:'hologpt-selfhost'/)
})
