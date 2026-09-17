import fs from 'node:fs'
import test from 'node:test'
import assert from 'node:assert/strict'

const source=fs.readFileSync(new URL('../answer.js',import.meta.url),'utf8')

test('bearer requests continue through server-side requireUser validation',()=>{
  assert.match(source,/authorization\.startsWith\('Bearer '\)/)
  assert.match(source,/requireUser\(req,res\)/)
})
