import assert from 'node:assert/strict'
import {test} from 'node:test'
import fs from 'node:fs'
import {deck,deal,newSpadesPractice,legal,playCard,autoPlayToHuman,practiceReceipt,SPADE_TRICK_RULES} from '../src/runtime/GameVerseSpadesTrick.mjs'
test('Spades has 52 unique cards dealt to four seats deterministically',()=>{
 assert.equal(new Set(deck().map(c=>c.suit+c.rank)).size,52)
 assert.deepEqual(deal(42),deal(42))
 assert.deepEqual(deal(42).map(x=>x.length),[13,13,13,13])
})
test('Spades follow-suit and lead restrictions enforced',()=>{
 assert.deepEqual(legal([{suit:'H',rank:'A'},{suit:'S',rank:'A'}],undefined,false),[{suit:'H',rank:'A'}])
 assert.deepEqual(legal([{suit:'H',rank:'A'},{suit:'S',rank:'A'}],'H'),[{suit:'H',rank:'A'}])
 let state=newSpadesPractice(5)
 const illegal=state.hands[0].find(c=>c.suit==='S')
 if(illegal&&state.hands[0].some(c=>c.suit!=='S'))assert.equal(playCard(state,0,illegal).ok,false)
 assert.equal(playCard(state,3,state.hands[3][0]).ok,false)
})
test('One player and three bots complete 13 tricks with exactly 13 total victories and no money',()=>{
 let state=autoPlayToHuman(newSpadesPractice(14)),guard=0
 while(!state.finished&&guard++<15){
  assert.equal(state.turn,0)
  const choices=legal(state.hands[0],state.plays[0]?.card.suit,state.spadesBroken)
  assert.ok(choices.length>0)
  const result=playCard(state,0,choices[0])
  assert.equal(result.ok,true)
  state=autoPlayToHuman(result.state)
 }
 assert.equal(state.finished,true)
 assert.equal(state.completed,13)
 assert.equal(state.tricks.reduce((a,b)=>a+b,0),13)
 assert.ok(state.hands.every(x=>x.length===0))
 assert.equal(state.history.length,13)
 assert.equal(practiceReceipt(state).cashValue,0)
 assert.equal(practiceReceipt(state).payoutAllowed,false)
 for(const [k,v] of Object.entries(SPADE_TRICK_RULES))if(k!=='mode')assert.equal(v,false,k)
})
test('UI includes one-hand controls, save reload, local export and no payment hooks',()=>{
 const hub=fs.readFileSync(new URL('../src/components/GameVerseHub.tsx',import.meta.url),'utf8')
 const ui=fs.readFileSync(new URL('../src/components/GameVerseSpadesPractice.tsx',import.meta.url),'utf8')
 assert.match(hub,/PLAY SPADES PRACTICE/)
 for(const x of ['minHeight:48','localStorage.setItem','EXPORT JSON RECEIPT','ONE PUSH','autoPlayToHuman'])assert.ok(ui.includes(x),x)
 assert.doesNotMatch(ui,/\/api\/commerce\/checkout|\/api\/credits\/spend|\/api\/payments\/route/)
})
