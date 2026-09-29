'use strict'
const assert=require('node:assert/strict')
const {OPERATOR_ROLES,VALIDATOR_ROLES}=require('../routes/edge-grid')
assert.equal(OPERATOR_ROLES.has('owner'),true)
assert.equal(OPERATOR_ROLES.has('member'),false)
assert.equal(VALIDATOR_ROLES.has('security'),true)
console.log('TRYAMM Edge Grid funded-work marketplace contract: PASS')
