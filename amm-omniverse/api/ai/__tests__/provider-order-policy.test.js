import fs from 'node:fs'
import test from 'node:test'
import assert from 'node:assert/strict'

const source=fs.readFileSync(new URL('../answer.js',import.meta.url),'utf8')

test('HoloGPT keeps configured gateway model first and owned self-host preference available',()=>{
  assert.match(source,/const models=\[configured,'inclusionai\/ling-3\.0-flash-sante-free','openai\/gpt-5\.4'\]/)
  assert.match(source,/HOLOGPT_SELFHOST_PREFERRED/)
  assert.match(source,/\?\[\(\)=>selfHosted\(question,history\),\.\.\.cloudRunners/)
})
