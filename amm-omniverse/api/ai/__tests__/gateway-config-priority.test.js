import fs from 'node:fs'
import test from 'node:test'
import assert from 'node:assert/strict'

for(const file of ['answer.js','selftest.js']){
  const source=fs.readFileSync(new URL(`../${file}`,import.meta.url),'utf8')
  test(`${file} keeps HOLOGPT_GATEWAY_MODEL ahead of fallback models`,()=>{
    const configured=source.indexOf('const models=[configured')
    const fallback=source.indexOf('inclusionai/ling-3.0-flash-sante-free',configured)
    assert.ok(configured>=0&&fallback>configured)
  })
}
