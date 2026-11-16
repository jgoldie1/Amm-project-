import test from 'node:test';
import assert from 'node:assert/strict';
import {PILOT_HUBS,validateScenario,estimateQuote,compareQuotes,assessFulfillmentReadiness} from '../src/commerce/threePlQuotePilot.mjs';
const scenario={monthlyOrders:100,monthlyInboundPallets:2,averageStoragePallets:4,monthlyReturns:5,storageClass:'ambient',category:'music_merch'};
const base={id:'verified-demo-quote',hubId:'memphis-tn',quoteVerified:true,currency:'USD',monthlyMinimumCents:10000,onboardingCents:25000,receivingPalletCents:2000,storagePalletCents:2500,pickPackOrderCents:200,shippingPerOrderCents:600,packagingPerOrderCents:100,returnHandlingCents:300,insurancePerMonthCents:1000,otherMonthlyCents:0};
test('hub candidates are Memphis TN, Atlanta GA, Savannah GA and Chicago IL',()=>assert.deepEqual(PILOT_HUBS.map(h=>h.id),['memphis-tn','atlanta-ga','savannah-ga','chicago-il']));
test('quote must originate from verified vendor input',()=>assert.equal(estimateQuote({...base,quoteVerified:false},scenario).eligible,false));
test('full monthly quote including freight, packaging, returns and minimum is computed',()=>{
 const x=estimateQuote(base,scenario);
 assert.equal(x.eligible,true);assert.equal(x.recurringCents,106500);
 assert.equal(x.costPerOrderCents,1065);assert.equal(x.onboardingCents,25000);
});
test('lower-cost eligible quote sorts first, no asserted carrier transit estimates',()=>{
 const x=compareQuotes([base,{...base,id:'alternate',hubId:'atlanta-ga',shippingPerOrderCents:500}],scenario);
 assert.equal(x.eligible[0].id,'alternate');assert.equal(x.notAContract,true);assert.equal('deliveryDays' in x.eligible[0],false);
});
test('food handling and cold-chain certifications are enforced',()=>{
 const food={...scenario,category:'grocery',storageClass:'refrigerated',foodColdChainRequired:true};
 assert.equal(estimateQuote(base,food).eligible,false);
 const yes={...base,coldChainCertified:true,temperatureMonitoring:true,recallSupport:true,foodHandlingApproved:true};
 assert.equal(estimateQuote(yes,food).eligible,true);
 assert.equal(estimateQuote({...yes,temperatureMonitoring:false},food).eligible,false);
});
test('negative fees and invalid return assumptions rejected',()=>{
 assert.equal(estimateQuote({...base,storagePalletCents:-3},scenario).eligible,false);
 assert.ok(validateScenario({...scenario,monthlyReturns:101}).includes('returns_exceed_orders'));
});
test('unsigned agreement and unverified inventory block a shipping order',()=>{
 const attempt=assessFulfillmentReadiness({agreementSigned:false,warehouseReceiptVerified:false});
 assert.equal(attempt.ready,false);assert.ok(attempt.errors.includes('warehouse_agreement_unsigned'));
});
test('food shipment requires separately verified handling and cold chain',()=>{
 const ready={agreementSigned:true,warehouseReceiptVerified:true,inventoryAuthoritative:true,stockReserved:true,paymentAuthorized:true,carrierServiceApproved:true,storageClass:'ambient'};
 assert.equal(assessFulfillmentReadiness(ready).ready,true);
 assert.equal(assessFulfillmentReadiness({...ready,category:'grocery',storageClass:'frozen'}).ready,false);
 assert.equal(assessFulfillmentReadiness({...ready,category:'grocery',storageClass:'frozen',foodHandlingApproved:true,coldChainVerified:true}).ready,true);
});
