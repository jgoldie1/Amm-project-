import assert from 'node:assert/strict'
import fs from 'node:fs'

const pkg = JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8'))
const bridge = fs.readFileSync(new URL('../src/components/LivingWorldsBridge.tsx', import.meta.url), 'utf8')
const repair = fs.readFileSync(new URL('../scripts/repair-streetverse-entry.mjs', import.meta.url), 'utf8')
const missionCenter = fs.readFileSync(new URL('../src/components/LivingStoryMissionCenter.tsx', import.meta.url), 'utf8')
const missionCatalog = fs.readFileSync(new URL('../src/data/livingStoryMissionCatalog.ts', import.meta.url), 'utf8')
const ciWorkflow = fs.readFileSync(new URL('../../.github/workflows/ci.yml', import.meta.url), 'utf8')

const currentMainSmokeContracts = [
  'smoke-contracts.mjs',
  'living-world-recovery-contract.mjs',
  'streetverse-economy-contract.mjs',
  'streetverse-visible-loop-contract.mjs',
  'streetverse-control-deck-contract.mjs',
  'asset-rights-contract.mjs',
  'network-fast-xr-contract.mjs',
  'aniyah-pay-contract.mjs',
  'secs-construct-contract.mjs',
  'mobility-blockchain-contract.mjs',
  'omniverse-event-fabric-contract.mjs',
  'performance-release-contract.mjs',
  'biometric-avatar-privacy-contract.mjs',
  'streetverse-vehicle-control-contract.mjs',
  'streetverse-mobile-resident-conversation-contract.mjs',
  'holo-forge-contract.mjs',
  'streetverse-mobile-living-city-contract.mjs',
  'poyo-holosocial-lazy-contract.mjs',
  'streetverse-self-healing-contract.mjs',
  'streetverse-journey-qa-contract.mjs',
]

assert.equal(pkg.engines?.node, '>=24 <25', 'main sync must preserve the current Node 24 runtime contract')
assert.match(pkg.scripts.build, /repair-streetverse-entry\.mjs/, 'build must run the StreetVerse entry repair before smoke/build')
assert.match(pkg.scripts.build, /npm run smoke/, 'build must retain the foundation smoke gate')
for (const contract of currentMainSmokeContracts) {
  assert.match(pkg.scripts.smoke, new RegExp(contract.replaceAll('.', '\\.')), `main sync must retain current main smoke coverage: ${contract}`)
}
assert.match(pkg.scripts.smoke, /command-nexus-accessibility-contract\.mjs/, 'main sync must retain branch accessibility regression coverage')
assert.match(pkg.scripts.smoke, /main-sync-preflight-contract\.mjs/, 'main sync preflight must remain attached to the aggregate smoke gate')

assert.match(ciWorkflow, /pull_request:\s*\n\s*branches:\s*\[main, developer-vic\]/, 'main sync must preserve PR validation against main')
assert.match(ciWorkflow, /push:\s*\n\s*branches:\s*\[main, developer-vic, foundation\/aaa-golden-order-world-rollout\]/, 'foundation branch pushes must continue attaching CI while reconciliation is in progress')
assert.match(ciWorkflow, /node test\/ci-release-boundary-contract\.mjs/, 'CI must preserve the release-boundary contract during main synchronization')
assert.match(ciWorkflow, /github\.event_name == 'push' && github\.ref == 'refs\/heads\/main'/, 'production deploy must remain main-push-only during reconciliation')

assert.match(bridge, /import LivingStoryMissionCenter from '\.\/LivingStoryMissionCenter'/, 'LivingWorldsBridge must retain the reconciled Living Story module')
assert.match(bridge, /import MovieStudioCenter from '\.\/MovieStudioCenter'/, 'LivingWorldsBridge must retain branch Movie Studio functionality during main sync')
assert.match(bridge, /aria-label="Open Living Story Missions"/, 'main sync must preserve the accessible Living Story launcher label')
assert.match(bridge, /tryamm:open-living-story/, 'Living Story launch event must remain wired after synchronization')
assert.match(bridge, /tryamm:open-movie-studio/, 'Movie Studio launch event must remain wired after synchronization')
assert.match(bridge, /showLivingStory&&<LivingStoryMissionCenter/, 'Living Story component render must remain wired after synchronization')
assert.match(bridge, /showMovieStudio&&<MovieStudioCenter/, 'Movie Studio component render must remain wired after synchronization')

assert.match(repair, /StreetVerseMobilePlayableWorld/, 'repair script must keep the mobile StreetVerse fallback')
assert.match(repair, /TRYAMM public realm deep-link routing/, 'repair script must keep public realm deep-link recovery')
assert.match(missionCenter, /livingStoryMissionCatalog/, 'Living Story center must remain backed by the mission catalog')
assert.ok(missionCatalog.length > 0, 'Living Story mission catalog must not be empty')

console.log('main sync preflight contract: GREEN')
