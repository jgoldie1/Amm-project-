import fs from 'node:fs'
import test from 'node:test'
import assert from 'node:assert/strict'

const source=fs.readFileSync(new URL('../answer.js',import.meta.url),'utf8')

test('HoloGPT system prompt preserves verified-live truth boundary',()=>{
  assert.match(source,/Always distinguish BUILT, DEMO\/BETA, PLANNED, CONFIGURED and VERIFIED LIVE/)
  assert.match(source,/Never claim a payment, deployment, accreditation, partnership, employment outcome/)
})
