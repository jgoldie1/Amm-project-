import fs from 'node:fs'
import test from 'node:test'
import assert from 'node:assert/strict'

const source=fs.readFileSync(new URL('../selftest.js',import.meta.url),'utf8')

test('readiness success occurs only after exact model token validation',()=>{
  const validation=source.indexOf("if(text!=='HOLOGPT_READY')")
  const success=source.indexOf('ok:true,degraded:false',validation)
  const degraded=source.indexOf("ok:false,degraded:true,provider:'diagnostic'")
  assert.ok(validation>=0&&success>validation&&degraded>success)
})
