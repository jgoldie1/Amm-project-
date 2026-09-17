import fs from 'node:fs'
import test from 'node:test'
import assert from 'node:assert/strict'

for(const file of ['answer.js','selftest.js']){
  const source=fs.readFileSync(new URL(`../${file}`,import.meta.url),'utf8')
  test(`${file} deduplicates configured and fallback model IDs`,()=>{
    assert.match(source,/filter\(\([^)]*\)=>[^\n]*indexOf\([^)]*\)===/)
  })
}
