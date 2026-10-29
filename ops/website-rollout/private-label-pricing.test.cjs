'use strict';
const assert=require('node:assert/strict');
const {quote}=require('./private-label-pricing.cjs');
const x=quote({product:30,privateLabel:4,packaging:7,freightDuty:12,fulfillment:5,paymentFees:4,returnsReserve:5,affiliate:3,supportReserve:3,targetMargin:.4});
assert.equal(x.totalVariableCost,73);
assert.equal(x.estimatedSalePrice,121.67);
assert.ok(x.achievedContributionMargin>=.4);
assert.throws(()=>quote({...{product:30,privateLabel:4,packaging:7,freightDuty:12,fulfillment:5,paymentFees:4,returnsReserve:5,affiliate:3,supportReserve:3},targetMargin:1}),/Margin/);
console.log('Private label pricing tests passed');
