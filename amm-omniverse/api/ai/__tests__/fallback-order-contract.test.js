import fs from 'node:fs'
import test from 'node:test'
import assert from 'node:assert/strict'

for(const file of ['answer.js','selftest.js']){
  const source=fs.readFileSync(new URL(`../${file}`,import.meta.url),'utf8')
  test(`${file} fallback order is configured then current free then paid`,()=>{
    assert.match(source,/models=\[configured,'inclusionai\/ling-3\.0-flash-sante-free','openai\/gpt-5\.4'\]/)
  })
}
