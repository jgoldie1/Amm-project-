import fs from 'node:fs'
import test from 'node:test'
import assert from 'node:assert/strict'

for(const file of ['answer.js','selftest.js']){
  const source=fs.readFileSync(new URL(`../${file}`,import.meta.url),'utf8')
  test(`${file} filters empty configured model before trying fallbacks`,()=>{
    assert.match(source,/\.filter\([^\n]*&&[^\n]*indexOf/)
  })
}
