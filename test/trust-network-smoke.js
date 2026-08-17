'use strict';
const assert=require('assert');
const {request,result,trustCredential,capabilityDecision,privacyReceipt}=require('../lib/trust-network');
const req=request({subjectId:'supplier1',subjectType:'business',checks:['business','beneficial-owner','supplier','sanctions'],provider:'adapter',purpose:'marketplace supplier onboarding',consentRecorded:true});assert.equal(req.rawSensitiveDataStored,false);
const res=result({requestId:req.id,subjectId:'supplier1',provider:'adapter',status:'verified',checks:[{type:'business',status:'verified'}],providerReference:'ref_123'});assert.equal(res.rawSsn,null);assert.equal(res.rawBankCredentials,null);
const cred=trustCredential({subjectId:'supplier1',subjectType:'business',level:'enhanced',claims:['business-verified','supplier-verified','sanctions-screened']});assert(capabilityDecision({credential:cred,requiredClaims:['business-verified','supplier-verified']}).allowed);assert(!capabilityDecision({credential:cred,requiredClaims:['factory-verified']}).allowed);
const receipt=privacyReceipt({subjectId:'supplier1',purpose:'verification',dataCategories:['business identity'],provider:'adapter',retentionPolicy:'provider-managed',consentBasis:'onboarding consent'});assert(receipt.rule.includes('do not propagate raw SSNs'));
console.log('trust network smoke: PASS');
