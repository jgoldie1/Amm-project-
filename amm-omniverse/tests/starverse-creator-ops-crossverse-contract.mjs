import assert from 'node:assert/strict'
import fs from 'node:fs'
import{
 STAR_COMPETITION_TRACKS,STAR_RIGHTS_ASSETS,STAR_SPONSOR_PLACEMENTS,
 newStarCreatorOps,normalizedStarCreatorOps,prepareCompetitionRunOfShow,starRightsReleaseGate,starLocalAnalytics,
} from '../src/runtime/StarVerseCreatorOperations.ts'

const read=(p)=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8')
const runtime=read('src/runtime/StarVerseCreatorOperations.ts')
const ui=read('src/components/StarVerseCreatorOperationsPanel.tsx')
const studio=read('src/components/StarVerseNetworkStudio.tsx')
const network=read('src/components/AllAmericanNetworkHub.tsx')
const route=read('src/main.tsx')
const tv=read('src/components/OTTIsaiahTV.tsx')
const pk=read('src/components/PKLivingWorldsArena.tsx')
const video=read('src/components/MediaStudioLauncher.tsx')
const broadcast=read('src/components/AllAmericanNetworkControlRoom.tsx')
const draft=newStarCreatorOps()
assert.equal(draft.passport.visibility,'private-local')
assert.equal(draft.competition.status,'LOCAL_PREVIEW')
assert.equal(draft.competition.realVotes,0)
assert.equal(draft.competition.realAuditions,0)
assert.equal(draft.captions.humanReviewed,false)
assert.equal(prepareCompetitionRunOfShow(draft).onlineCompetitionActive,false)
assert.equal(prepareCompetitionRunOfShow(draft).serverAntiFraudRequired,true)
assert.equal(prepareCompetitionRunOfShow(draft).youthEntryRequiresGuardianApproval,true)
assert(STAR_COMPETITION_TRACKS.length>=6)
assert(STAR_RIGHTS_ASSETS.includes('music'))
assert(STAR_SPONSOR_PLACEMENTS.includes('virtual-billboard'))
const tampered={
 ...draft,passport:{...draft.passport,stageName:'S'.repeat(200),visibility:'public-verified',skills:['singing','fake'],languages:['en','not-a-language']},
 competition:{...draft.competition,status:'LIVE',realVotes:10000,realAuditions:100,winnerSelected:true},
 rights:[{id:'r1',assetLabel:'Sample track',assetType:'music',claim:'creator-claims-ownership',verified:true,commercialUseAuthorized:true}],
 sponsor:[{id:'s1',brandLabel:'Demo Sponsor',placement:'virtual-billboard',concept:'A concept',budgetCents:500000,contractSigned:true,inventoryReserved:true,moneyMoved:true,status:'SIGNED'}],
 captions:{...draft.captions,humanReviewed:true,mediaCaptionFileAttached:true,translationLanguages:['es','fr','zz']},
 milestones:['draft','audition-plan','fake']
}
const safe=normalizedStarCreatorOps(tampered)
assert.equal(safe.passport.stageName.length,90)
assert.equal(safe.passport.visibility,'private-local')
assert.deepEqual(safe.passport.skills,['singing'])
assert.deepEqual(safe.passport.languages,['en'])
assert.equal(safe.competition.status,'LOCAL_PREVIEW')
assert.equal(safe.competition.realVotes,0)
assert.equal(safe.competition.realAuditions,0)
assert.equal(safe.competition.finalistsSelected,false)
assert.equal(safe.rights[0].verified,false)
assert.equal(safe.rights[0].commercialUseAuthorized,false)
assert.equal(safe.sponsor[0].budgetCents,0)
assert.equal(safe.sponsor[0].contractSigned,false)
assert.equal(safe.sponsor[0].inventoryReserved,false)
assert.equal(safe.sponsor[0].moneyMoved,false)
assert.equal(safe.captions.humanReviewed,false)
assert.equal(safe.captions.mediaCaptionFileAttached,false)
assert.deepEqual(safe.captions.translationLanguages,['es','fr'])
assert.deepEqual(safe.milestones,['draft','audition-plan'])
const metrics=starLocalAnalytics(safe)
assert.equal(metrics.localProductionProgress,2)
for(const field of ['audienceReach','verifiedViews','verifiedAuditions','paidImpressions','creatorEarningsCents'])assert.equal(metrics[field],null,field+' must not be fabricated')
const gates=starRightsReleaseGate(safe)
assert.equal(gates.eligibleForCommercialPublish,false)
assert.equal(gates.verifiedLicenses,0)
assert.equal(gates.creatorClaims,1)
assert.equal(gates.unverified,1)
assert.equal(normalizedStarCreatorOps(null).passport.visibility,'private-local')
assert.equal(normalizedStarCreatorOps({schema:'old'}).rights.length,0)
for(const token of ['saveStarCreatorOps','clearStarCreatorOps','starLocalAnalytics','prepareCompetitionRunOfShow','STAR_RIGHTS_ASSETS','STAR_SPONSOR_PLACEMENTS'])assert(ui.includes(token))
for(const token of ['Talent Passport','Who Wants to Be a Star?','Rights Vault','Sponsorships','Captions + Translation','Analytics','Use stage name in audition draft','Export local creator planning file','Confirm clear this browser'])assert(ui.includes(token))
assert.match(studio,/StarVerseCreatorOperationsPanel/)
assert.match(studio,/onApplyStageName=\{stageName=>patch\(\{creatorCredit:stageName\}\)\}/)
assert.match(network,/StarVerseNetworkStudio/)
assert.match(route,/\/network\/talent-studio/)
assert.match(tv,/Isaiah AI TV/)
assert.match(pk,/Turn PK story into a StarVerse TV special/)
assert.match(video,/getAccessToken/)
assert.match(broadcast,/tryamm.starverse.broadcast-handoff.v1/)
assert.doesNotMatch(runtime,/\bfetch\s*\(/,'Creator operations local draft cannot trigger remote work')
console.log('STARVERSE CREATOR OPERATIONS: PASS (local passport, free competition, rights vault, captions, sponsor drafts, truthful analytics, routes and safety)')
