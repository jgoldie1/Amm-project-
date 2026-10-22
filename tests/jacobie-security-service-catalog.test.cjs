'use strict';
const assert=require('node:assert/strict');
const {quote,verifiedRevenue,PLANS}=require('../lib/jacobie-security-service-catalog');
for(const id of Object.keys(PLANS)){
 const q=quote({businessId:'beautyverse-salon',planId:id});
 assert.equal(q.ok,true);
 assert.equal(q.quote.activated,false);
 assert.equal(q.quote.charged,false);
 assert.equal(q.quote.provider,'jacobie-vision');
 assert.equal(verifiedRevenue({quote:q.quote,agreementSigned:false,processorVerified:true,settledAmountCents:7900}).ok,false);
 assert.equal(verifiedRevenue({quote:q.quote,agreementSigned:true,processorVerified:false,settledAmountCents:7900}).ok,false);
}
assert.equal(quote({businessId:'raymond-jarreau',planId:'starter'}).quote.monthlyCents,2900);
assert.equal(quote({businessId:'omnicare360',planId:'shield'}).quote.monthlyCents,7900);
assert.equal(quote({businessId:'middleverse-ai',planId:'ai'}).quote.monthlyCents,14900);
assert.equal(quote({businessId:'bad/path',planId:'starter'}).ok,false);
assert.equal(quote({businessId:'jacobie-vision',planId:'unknown'}).ok,false);
const q=quote({businessId:'logistics-company',planId:'shield'}).quote;
assert.equal(verifiedRevenue({quote:q,agreementSigned:true,processorVerified:true,settledAmountCents:7900}).payoutStatus,'not-initiated');
assert.equal(verifiedRevenue({quote:q,agreementSigned:true,processorVerified:true,settledAmountCents:-1}).ok,false);
console.log('Jacobie Vision quote/settlement validation: PASS');
