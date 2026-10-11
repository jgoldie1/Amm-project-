import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {stripTypeScriptTypes} from 'node:module'

const source=readFileSync(new URL('../src/utils/canvasRoundedRect.ts',import.meta.url),'utf8')
const {canvasRoundedRect}=await import(`data:text/javascript;base64,${Buffer.from(stripTypeScriptTypes(source)).toString('base64')}`)
const calls=[]
const ctx=Object.fromEntries(['beginPath','moveTo','lineTo','quadraticCurveTo','closePath'].map(name=>[name,(...args)=>calls.push([name,...args])]))
// Simulate Safari 15: roundRect is absent. Startup must still draw rounded labels.
canvasRoundedRect(ctx,4,4,376,88,18)
assert.deepEqual(calls[0],['beginPath'])
assert.deepEqual(calls[1],['moveTo',22,4])
assert.equal(calls.filter(([name])=>name==='quadraticCurveTo').length,4)
assert.deepEqual(calls.at(-1),['closePath'])
calls.length=0
canvasRoundedRect(ctx,0,0,10,8,100)
assert.deepEqual(calls[1],['moveTo',4,0])
calls.length=0
ctx.roundRect=(...args)=>calls.push(['roundRect',...args])
canvasRoundedRect(ctx,0,0,256,56,8)
assert.deepEqual(calls,[['beginPath'],['roundRect',0,0,256,56,8]])
console.log('PASS: Safari 15 fallback, radius bounds, and native rounded labels')
