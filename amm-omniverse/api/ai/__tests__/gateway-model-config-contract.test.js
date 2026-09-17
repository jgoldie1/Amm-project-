import fs from 'node:fs'
import test from 'node:test'
import assert from 'node:assert/strict'

for(const file of ['answer.js','selftest.js']){
  const source=fs.readFileSync(new URL(`../${file}`,import.meta.url),'utf8')
  test(`${file} reads HOLOGPT_GATEWAY_MODEL from server environment`,()=>{
    assert.match(source,/process\.env\.HOLOGPT_GATEWAY_MODEL/)
  })
}
