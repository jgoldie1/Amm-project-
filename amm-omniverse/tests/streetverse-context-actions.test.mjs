import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import {CONTEXTS,BUTTON_LABELS,makeControlIntent,normalizeStick,resolveAction} from '../src/foundation/streetverseControllerProtocol.js'
const read=p=>fs.readFileSync(new URL(p,import.meta.url),'utf8')
const controls=read('../src/components/StreetVerseContextActions.tsx')
const arcade=read('../src/components/StreetVerseMissionArcade.tsx')
test('controller handles every activity as a contextual career',()=>{
 assert.equal(Object.keys(CONTEXTS).length,12)
 for(const name of ['street','home','workplace','range','sports','grocery','trucking','housing','health','parkour','rescue','missions'])assert.ok(CONTEXTS[name].length>=3)
 assert.equal(resolveAction('home',0),'cook')
 assert.equal(resolveAction('trucking',2),'drive')
 assert.match(arcade,/StreetVerseContextActions/)
})
test('all familiar controller buttons and accessible touch buttons are exposed',()=>{
 for(const button of ['A','B','X','Y','LB','RB','LT','RT','L3','R3','START','SELECT','UP','DOWN','LEFT','RIGHT']) assert.ok(BUTTON_LABELS[button])
 assert.match(controls,/getGamepads/)
 assert.match(controls,/requestAnimationFrame/)
 assert.match(controls,/keydown/)
 assert.match(controls,/minHeight:60/)
 assert.match(controls,/aria-live="polite"/)
 assert.match(controls,/A — /)
 assert.match(controls,/B — /)
 assert.match(controls,/gamepad/)
})
test('deadzone prevents stick drift and caps magnitude',()=>{
 assert.deepEqual(normalizeStick(0.05,0.05),{x:0,y:0})
 const n=normalizeStick(2,0)
 assert.equal(n.x,1);assert.equal(n.y,0)
})
test('input events are non-authoritative and no cash or real weapons are controlled',()=>{
 const intent=makeControlIntent({button:'RT',context:'range'})
 assert.equal(intent.authoritative,false)
 assert.equal(Object.isFrozen(intent),true)
 assert.throws(()=>makeControlIntent({button:'INVALID',context:'street'}))
 assert.match(controls,/authoritative:false/)
 assert.match(controls,/ctx!=='range'/)
 assert.match(controls,/No real weapons/)
 assert.doesNotMatch(controls,/fetch\(/)
})
