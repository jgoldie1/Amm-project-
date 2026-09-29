'use strict'
const assert=require('node:assert/strict')
const {OPERATOR_ROLES,RECOVERY_CREDENTIAL,TRANSITIONS}=require('../routes/vehicle-recovery')
assert.equal(RECOVERY_CREDENTIAL,'vehicle-recovery-agent')
assert.equal(OPERATOR_ROLES.has('owner'),true)
assert.deepEqual(TRANSITIONS.reported,['locating','cancelled'])
assert.deepEqual(TRANSITIONS.impounded,['returned'])
assert.equal(TRANSITIONS.returned.length,0)
console.log('TRYAMM Vehicle Recovery route contract: PASS')
