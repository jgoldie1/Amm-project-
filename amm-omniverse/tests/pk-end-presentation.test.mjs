import {test} from 'node:test'
import assert from 'node:assert/strict'
import {pkEndPresentation} from '../src/game/holographic/pkEndPresentation.ts'
test('leaving a PK session is not reported as a zero-score result',()=>{
 assert.deepEqual(pkEndPresentation({reason:'leave',left:8,right:9}),{title:'PK SESSION ENDED',detail:'You left the arena. No match result was recorded.'})
})
test('missing, invalid or negative scores never become invented results',()=>{
 for(const scores of [{},{left:NaN,right:0},{left:Infinity,right:3},{left:-1,right:3},{left:'8',right:3}])assert.equal(pkEndPresentation(scores).title,'PK SESSION ENDED')
})
test('explicit scores, including a real zero, remain visible',()=>{
 assert.deepEqual(pkEndPresentation({left:0,right:12}),{title:'PK RESULT',detail:'TEAM A 0 • 12 TEAM B'})
})
