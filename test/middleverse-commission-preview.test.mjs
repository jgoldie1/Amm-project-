import test from 'node:test';import assert from 'node:assert/strict';
import {allocation,releaseEligible} from '../lib/middleverse-commission-preview.mjs';
test('499 sale split',()=>assert.deepEqual(allocation({grossMinor:49900}),{eligibleMinor:49900,commissionMinor:7485,reserveMinor:5000,remainingMinor:37415}));
test('49 sale no reserve',()=>assert.equal(allocation({grossMinor:4900}).reserveMinor,0));
test('full refund removes commission',()=>assert.equal(allocation({grossMinor:49900,refundedMinor:49900}).commissionMinor,0));
test('invalid amounts rejected',()=>assert.throws(()=>allocation({grossMinor:10,refundedMinor:11})));
test('held settlement not paid',()=>assert.equal(releaseEligible({paid:true,fulfilled:true,reviewed:true,refundHoldElapsed:false,marketCleared:true}),false));
