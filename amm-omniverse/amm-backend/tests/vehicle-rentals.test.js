'use strict'
const assert=require('node:assert/strict')
const {FOUNDER_ROLES,OPERATOR_ROLES}=require('../routes/vehicle-rentals')
assert.equal(FOUNDER_ROLES.has('owner'),true)
assert.equal(FOUNDER_ROLES.has('admin'),false)
assert.equal(OPERATOR_ROLES.has('fleet'),true)
console.log('TRYAMM Mobility Rental route contract: PASS')
