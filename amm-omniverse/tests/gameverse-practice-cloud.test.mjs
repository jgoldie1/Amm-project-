import assert from 'node:assert/strict'
import {test} from 'node:test'
import fs from 'node:fs'
import {cleanGameVersePracticeState} from '../api/_lib/gameverse-practice-state.js'
import {newSpadesPractice} from '../src/runtime/GameVerseSpadesTrick.mjs'
import {newPoolPractice} from '../src/runtime/GameVersePoolPractice.mjs'
test('Only non-monetary practice snapshots pass strict sanitization',()=>{
 const s=newSpadesPractice(14),p=newPoolPractice()
 assert.equal(cleanGameVersePracticeState('spades-practice',s).cashValue,0)
 assert.equal(cleanGameVersePracticeState('pool-practice',p).cashValue,0)
 assert.equal(cleanGameVersePracticeState('spades-practice',{...s,cashValue:100}),null)
 assert.equal(cleanGameVersePracticeState('pool-practice',{...p,cashValue:1}),null)
 assert.equal(cleanGameVersePracticeState('poker',s),null)
 assert.equal(cleanGameVersePracticeState('spades-practice',{...s,tricks:[13,13,0,0]}),null)
 assert.equal(cleanGameVersePracticeState('pool-practice',{...p,shots:999}),null)
 assert.equal(cleanGameVersePracticeState('pool-practice',{...p,extraCreditAward:100}).extraCreditAward,undefined)
})
test('Authenticated server-only storage cannot authorize payouts or ranked games',()=>{
 const api=fs.readFileSync(new URL('../api/gameverse/practice-session.js',import.meta.url),'utf8')
 const sql=fs.readFileSync(new URL('../supabase/migrations/20261117194500_gameverse_practice_sessions.sql',import.meta.url),'utf8')
 const client=fs.readFileSync(new URL('../src/services/gameversePracticeCloud.ts',import.meta.url),'utf8')
 for(const x of ['requireUser','cleanGameVersePracticeState','expectedRevision','409','currencyAwarded:0','transactionCreated:false'])assert.ok(api.includes(x),x)
 for(const x of ['enable row level security','revoke insert,update,delete','using ((select auth.uid())=user_id)','primary key(user_id,game_id)'])assert.ok(sql.includes(x),x)
 assert.match(client,/getAccessToken/)
 assert.match(client,/expectedRevision/)
 assert.doesNotMatch(api,/\/api\/commerce\/checkout|spend_tryamm_credits|transferFunds|releasePayout/)
})
