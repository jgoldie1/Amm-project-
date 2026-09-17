import fs from 'node:fs'
import test from 'node:test'
import assert from 'node:assert/strict'

const source=fs.readFileSync(new URL('../answer.js',import.meta.url),'utf8')

test('HoloGPT still rejects empty questions before provider execution',()=>{
  assert.match(source,/if\(!question\)return res\.status\(400\)/)
})
