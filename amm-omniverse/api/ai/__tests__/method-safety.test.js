import fs from 'node:fs'
import test from 'node:test'
import assert from 'node:assert/strict'

const answer=fs.readFileSync(new URL('../answer.js',import.meta.url),'utf8')
const selftest=fs.readFileSync(new URL('../selftest.js',import.meta.url),'utf8')

test('HoloGPT answer remains POST-only',()=>assert.match(answer,/req\.method!=='POST'.*405/))
test('HoloGPT readiness remains GET-only',()=>assert.match(selftest,/req\.method!=='GET'.*405/))
