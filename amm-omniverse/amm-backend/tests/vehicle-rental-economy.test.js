'use strict'
const assert=require('node:assert/strict')
const {quoteRental,rentalSplit}=require('../lib/vehicle-rental-economy')
assert.equal(quoteRental('flying-car',1).rentalCents,1299)
assert.equal(quoteRental('flying-car',24).rentalCents,3999)
assert.equal(quoteRental('flying-bike',1).plasmaShield,true)
assert.deepEqual(rentalSplit(10000,'business'),{gross:10000,vehicleOwner:7000,tryamm:2000,reserve:1000})
assert.deepEqual(rentalSplit(10000,'tryamm'),{gross:10000,vehicleOwner:0,tryamm:9000,reserve:1000})
console.log('TRYAMM Mobility Rental economy contract: PASS')
