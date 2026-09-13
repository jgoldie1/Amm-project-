const fs = require('fs')
const path = require('path')
const assert = require('assert')

const root = path.resolve(__dirname, '..')
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'config/faith-world-community-expansion.json'), 'utf8'))
const bible = fs.readFileSync(path.join(root, 'amm-omniverse/src/components/EthiopianBibleMetaverse.tsx'), 'utf8')
const holoLab = fs.readFileSync(path.join(root, 'amm-omniverse/src/components/HoloLabGateway.tsx'), 'utf8')

assert.equal(manifest.name, 'TRYAMM Faith World Community Expansion')
assert.ok(manifest.statusModel.includes('LIVE'))
assert.ok(manifest.statusModel.includes('BUILDING'))

const byId = Object.fromEntries(manifest.capabilities.map(item => [item.id, item]))
assert.equal(byId['ethiopian-bible-metaverse'].status, 'LIVE')
assert.equal(byId['bible-88-corpus'].status, 'BUILDING')
assert.equal(byId['hebrew-learning'].status, 'READY')
assert.equal(byId['holo-lab-faith-chrono'].status, 'LIVE')
assert.equal(byId['reusable-faith-assets'].status, 'BUILDING')
assert.equal(byId['fellowships'].status, 'BUILDING')
assert.equal(byId['steward-the-planet'].status, 'BUILDING')
assert.equal(byId['creator-publishing'].status, 'READY')
assert.equal(byId['faith-chapter-compiler'].status, 'COMING_SOON')

for (const label of ['SCRIPTURE','HISTORICAL_EVIDENCE','RECONSTRUCTION','COMMENTARY','AI_GENERATED_DIALOGUE']) {
  assert.ok(manifest.chapterExperience.truthLabels.includes(label), `missing truth label ${label}`)
}
assert.equal(manifest.chapterExperience.divineCommunicationClaim, false)
assert.equal(manifest.chapterExperience.physicalTimeTravelClaim, false)
assert.equal(manifest.reusableAssetPolicy.sourceRightsRequired, true)
assert.equal(manifest.fellowshipSafety.moderationRequired, true)
assert.equal(manifest.fellowshipSafety.noGeneratedTextPresentedAsDivineSpeech, true)
assert.equal(manifest.stewardThePlanet.realWorldImpactRequiresEvidence, true)
assert.equal(manifest.publishing.rightsRequiredBeforeDistribution, true)

for (const token of ['HEBREW SCHOOL','TRYAMM 88-BOOK CURRICULUM','FAITH CHRONO / TIME MACHINE','KINGDOMS PRESS','STREETVERSE FAITH WORLD']) {
  assert.ok(bible.includes(token), `Bible surface missing ${token}`)
}
for (const token of ['Faith Chrono · Ethiopian Bible Lab','CHRONO RECONSTRUCTION SOURCE-GATED','HIGH-RISK AUTO-PROMOTION BLOCKED']) {
  assert.ok(holoLab.includes(token), `Holo Lab missing ${token}`)
}

console.log('Faith World community expansion smoke passed')
