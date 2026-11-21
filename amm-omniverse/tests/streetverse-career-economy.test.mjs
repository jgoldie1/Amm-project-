import assert from 'node:assert/strict'
import {createCareerState,completeCareerMission,careerLevel,unlockedOpportunities,purchaseApprovedMod} from '../src/runtime/StreetVerseCareerEconomy.ts'
for(const [career,skill] of [['student','learning'],['delivery','logistics'],['mechanic','repair'],['business','enterprise']]){
 const initial=createCareerState('player-'+career,career)
 const receipt={id:'job-'+career,career,skill,xp:500,credits:100,reputation:25}
 const completed=completeCareerMission(initial,receipt)
 assert.equal(completed.credits,100)
 assert.equal(completed.skills[skill],500)
 assert.equal(completed.reputation[career],25)
 assert.equal(careerLevel(completed),2)
 assert.ok(unlockedOpportunities(completed).includes('advanced contracts'))
 assert.strictEqual(completeCareerMission(completed,receipt),completed,'duplicate missions cannot mint rewards')
 assert.throws(()=>completeCareerMission(initial,{...receipt,id:'bad',credits:251}),/cap/)
}
let buyer=createCareerState('buyer','delivery')
buyer=completeCareerMission(buyer,{id:'delivery-1',career:'delivery',skill:'logistics',xp:100,credits:100,reputation:10})
const creator=createCareerState('creator','business')
const mod={id:'jacket-001',creatorId:'creator',title:'StreetVerse Jacket',priceCredits:100,approved:true,version:'1.0'}
const sale=purchaseApprovedMod(buyer,creator,mod)
assert.equal(sale.buyer.credits,0)
assert.equal(sale.creator.credits,70)
assert.equal(sale.platformSink,30)
assert.equal(sale.buyer.credits+sale.creator.credits+sale.platformSink,100)
assert.throws(()=>purchaseApprovedMod(sale.buyer,sale.creator,mod),/already owned/)
assert.throws(()=>purchaseApprovedMod(buyer,creator,{...mod,approved:false}),/not approved/)
assert.throws(()=>purchaseApprovedMod(buyer,buyer,{...mod,creatorId:'buyer'}),/Self-purchase/)
console.log('StreetVerse career, reputation and fictional creator economy PASS')
