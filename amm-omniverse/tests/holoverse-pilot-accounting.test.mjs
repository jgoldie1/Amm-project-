import test from 'node:test';
import assert from 'node:assert/strict';
import {assessRelease,simulateAllocation,qualifyPlay} from '../src/runtime/holoversePilotAccounting.mjs';
const r={id:'original-001',artistId:'artist-001',title:'Original Chicago Song',rightsStatus:'cleared',ownerConsent:true,masterPermission:true,compositionPermission:true,sampleStatus:'none',masterSplits:[{partyId:'artist-001',basisPoints:10000}],compositionSplits:[{partyId:'writer-001',basisPoints:10000}]};
test('original cleared release can pass pilot',()=>assert.equal(assessRelease(r).eligible,true));
test('uncleared sample, expired rights and missing master permission block release',()=>{
 for(const x of [{...r,sampleStatus:'requested'},{...r,rightsStatus:'revoked'},{...r,masterPermission:false}])assert.equal(assessRelease(x).eligible,false);
});
test('video sync and AI voice permission are independent opt-ins',()=>{
 assert.equal(assessRelease({...r,audiovisual:true}).eligible,false);
 assert.equal(assessRelease({...r,aiVoiceConsentRequired:true}).eligible,false);
});
test('split sheets must total 100% and prevent duplicate parties',()=>{
 assert.equal(assessRelease({...r,masterSplits:[{partyId:'artist-001',basisPoints:9999}]}).eligible,false);
 assert.equal(assessRelease({...r,compositionSplits:[{partyId:'writer-001',basisPoints:5000},{partyId:'writer-001',basisPoints:5000}]}).eligible,false);
});
test('managed label receives 25% of only recording component; publishing is separate',()=>{
 const x=simulateAllocation({receiptCents:10000,masterSplits:r.masterSplits,compositionSplits:r.compositionSplits,managedLabel:true});
 assert.deepEqual([x.recordingCents,x.compositionCents,x.platformCents,x.labelCents,x.recordingOwners[0].cents,x.compositionOwners[0].cents],[5000,2000,3000,1250,3750,2000]);
 assert.equal(x.simulationOnly,true);
});
test('distribution-only does not impose label share',()=>{
 const x=simulateAllocation({receiptCents:100,masterSplits:r.masterSplits,compositionSplits:r.compositionSplits});assert.equal(x.labelCents,0);
});
test('rounding conserves cash',()=>{
 const x=simulateAllocation({receiptCents:101,masterSplits:[{partyId:'a1',basisPoints:3333},{partyId:'a2',basisPoints:6667}],compositionSplits:r.compositionSplits,managedLabel:true});
 assert.equal(x.recordingOwners.reduce((n,s)=>n+s.cents,0)+x.labelCents,x.recordingCents);
 assert.equal(x.recordingCents+x.compositionCents+x.platformCents,101);
});
test('negative receipts and oversized pools fail',()=>{
 assert.throws(()=>simulateAllocation({receiptCents:-1,masterSplits:r.masterSplits,compositionSplits:r.compositionSplits}));
 assert.throws(()=>simulateAllocation({receiptCents:100,recordingPoolBasisPoints:8000,compositionPoolBasisPoints:4000,masterSplits:r.masterSplits,compositionSplits:r.compositionSplits}));
});
test('unqualified, duplicate and self-streams are excluded',()=>{
 const p={playedSeconds:30,durationSeconds:180,authorized:true};
 assert.equal(qualifyPlay(p),true);
 for(const x of [{...p,duplicate:true},{...p,isSelfPlay:true},{...p,authorized:false},{...p,playedSeconds:29}])assert.equal(qualifyPlay(x),false);
});
