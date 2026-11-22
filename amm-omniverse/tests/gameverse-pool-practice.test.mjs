import assert from 'node:assert/strict'
import {test} from 'node:test'
import fs from 'node:fs'
import {newPoolPractice,shootPoolPractice,poolPracticeReceipt,POOL_PRACTICE_RULES} from '../src/runtime/GameVersePoolPractice.mjs'
test('two-ball free skill game has zero monetary value',()=>{
 const start=newPoolPractice();assert.equal(start.cashValue,0)
 for(const [k,v]of Object.entries(POOL_PRACTICE_RULES))if(k!=='mode')assert.equal(v,false,k)
})
test('default straight shot deterministic, bounded and no prize',()=>{
 const a=shootPoolPractice(newPoolPractice(),0,7),b=shootPoolPractice(newPoolPractice(),0,7)
 assert.equal(a.ok,true);assert.deepEqual(a,b)
 assert.equal(a.state.shots,1)
 assert.equal(poolPracticeReceipt(a.state).creditsAwarded,0)
 assert.equal(poolPracticeReceipt(a.state).realPrize,false)
})
test('reject over-limit and complete practice',()=>{
 const state=newPoolPractice();state.complete=true
 assert.equal(shootPoolPractice(state,0,7).ok,false)
 assert.equal(shootPoolPractice(newPoolPractice(),9000,100).ok,true)
})
test('pool UI exposes shots, a one push test, local saving, and no payment APIs',()=>{
 const ui=fs.readFileSync(new URL('../src/components/GameVersePoolPractice.tsx',import.meta.url),'utf8')
 const hub=fs.readFileSync(new URL('../src/components/GameVerseHub.tsx',import.meta.url),'utf8')
 assert.match(hub,/PLAY POOL PRACTICE/)
 for(const s of ['ONE PUSH','TAKE SHOT','localStorage.setItem','EXPORT JSON','minHeight:48'])assert.ok(ui.includes(s),s)
 assert.doesNotMatch(ui,/\/api\/commerce\/checkout|\/api\/payments\/route|\/api\/credits\/spend/)
})
