'use strict'
const assert=require('node:assert/strict')
const {splitBudget,verifyEdgeEarnings,reverseEdgeEarnings}=require('../lib/edge-earnings-ledger')

const a=splitBudget(1000,7000,2500)
assert.equal(a.node,700)
assert.equal(a.platform,250)
assert.equal(a.reserve,50)
assert.equal(a.node+a.platform+a.reserve,a.gross)

const b=splitBudget(1,6500,3000)
assert.equal(b.node+b.platform+b.reserve,1)
assert.ok(b.reserve>=0)

console.log('TRYAMM Edge earnings ledger contract: PASS')
assert.equal(typeof verifyEdgeEarnings,'function')
assert.equal(typeof reverseEdgeEarnings,'function')
