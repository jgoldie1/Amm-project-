import fs from 'node:fs'
import test from 'node:test'
import assert from 'node:assert/strict'

for(const file of ['answer.js','selftest.js']){
  const source=fs.readFileSync(new URL(`../${file}`,import.meta.url),'utf8')
  test(`${file} keeps paid gateway fallback after temporary free model`,()=>{
    const free=source.indexOf('inclusionai/ling-3.0-flash-sante-free')
    const paid=source.indexOf('openai/gpt-5.4',free)
    assert.ok(free>=0&&paid>free)
  })
}
