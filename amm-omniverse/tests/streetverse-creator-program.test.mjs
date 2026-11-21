import assert from 'node:assert/strict'
import {CREATOR_ACADEMY,reviewCreatorMod,submitCreatorMod,decideCreatorMod,canDistributeRealMoney,proposeCommunityFundAllocation,createAccessibleModDraft} from '../src/runtime/StreetVerseCreatorProgram.ts'
assert.deepEqual(new Set(CREATOR_ACADEMY.map(l=>l.category)),new Set(['clothing','hair','building','mission','animation']))
const preset={id:'jacket',category:'clothing',label:'StreetVerse Jacket',palette:['#ff69b4','#000000']}
const draft={...createAccessibleModDraft('creator',preset,'#ff69b4'),rightsConfirmed:true}
assert.equal(reviewCreatorMod(draft).approved,true)
const pending=submitCreatorMod(draft)
assert.equal(pending.status,'pending')
assert.throws(()=>decideCreatorMod(pending,'creator',true,'self-review'),/cannot approve/)
const approved=decideCreatorMod(pending,'moderator',true,'Original preset reviewed')
assert.equal(approved.status,'approved')
assert.throws(()=>decideCreatorMod(approved,'moderator',true,'again'),/Independent review/)
assert.equal(reviewCreatorMod({...draft,assetPath:'https://evil.example/mod.js'}).approved,false)
assert.equal(reviewCreatorMod({...draft,triangleCount:30001}).approved,false)
assert.equal(reviewCreatorMod({...draft,rightsConfirmed:false}).approved,false)
assert.equal(reviewCreatorMod({...draft,rewardCredits:251}).approved,false)
assert.equal(canDistributeRealMoney({customerRevenueVerified:true,creatorContractSigned:true,paymentProcessorReady:true,taxAndIdentityChecksReady:true,fraudReviewPassed:true,legalApproval:true}),false)
assert.deepEqual(proposeCommunityFundAllocation(100000,{percentageBasisPoints:500,approvedBy:'board',effectiveDate:'2026-11-15'}),{proposedCents:5000,disbursementAuthorized:false})
console.log('Creator Academy, mod review, accessible presets, and payout safeguards PASS')
