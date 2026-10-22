'use strict';
const assert=require('node:assert/strict');
const {createBusinessRegistry}=require('../lib/business-network-registry');
const {createSecurityQuoteRequests}=require('../lib/jacobie-security-quote-requests');
const registry=createBusinessRegistry([
 {id:'raymond-jarreau',name:'Raymond',ownerId:'raymond-owner',category:'financial-education'},
 {id:'jacobie-vision',name:'Jacobie',ownerId:'jacobie-owner',category:'cybersecurity'},
 {id:'omnicare360',name:'OmniCare',ownerId:'tryamm-owner',category:'healthcare-administration'}
]);
const service=createSecurityQuoteRequests({registry,verifyRequester:({actor,business})=>actor?.verified===true&&actor?.id===business.ownerId});
const raymond={id:'raymond-owner',verified:true},jacobie={id:'jacobie-owner',verified:true};
const a=service.request({businessId:'raymond-jarreau',planId:'shield',actor:raymond});
assert.equal(a.ok,true);assert.equal(a.request.status,'requested');assert.equal(a.request.monthlyCents,7900);
assert.equal(service.get({id:a.request.id,actor:jacobie}).ok,false);
assert.equal(service.get({id:a.request.id,actor:raymond}).ok,true);
assert.equal(service.request({businessId:'omnicare360',planId:'ai',actor:raymond}).ok,false);
assert.equal(service.request({businessId:'missing',planId:'starter',actor:raymond}).ok,false);
assert.equal(service.request({businessId:'raymond-jarreau',planId:'invalid',actor:raymond}).ok,false);
assert.equal(service.request({businessId:'raymond-jarreau',planId:'starter',actor:{id:'raymond-owner',verified:false}}).ok,false);
assert.equal(service.get({id:'jq-missing',actor:raymond}).ok,false);
console.log('Jacobie quote request ownership gates: PASS');
