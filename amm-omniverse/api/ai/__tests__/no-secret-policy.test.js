import fs from 'node:fs'
import test from 'node:test'
import assert from 'node:assert/strict'

for(const file of ['answer.js','selftest.js']){
  const source=fs.readFileSync(new URL(`../${file}`,import.meta.url),'utf8')
  test(`${file} contains no obvious embedded provider secret`,()=>{
    assert.doesNotMatch(source,/sk-[A-Za-z0-9_-]{20,}/)
    assert.doesNotMatch(source,/Bearer\s+[A-Za-z0-9_-]{20,}/)
  })
}
