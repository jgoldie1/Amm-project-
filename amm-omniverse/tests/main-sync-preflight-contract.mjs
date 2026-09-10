import assert from 'node:assert/strict'
import fs from 'node:fs'

const pkg = JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8'))
const bridge = fs.readFileSync(new URL('../src/components/LivingWorldsBridge.tsx', import.meta.url), 'utf8')
const repair = fs.readFileSync(new URL('../scripts/repair-streetverse-entry.mjs', import.meta.url), 'utf8')
const missionCenter = fs.readFileSync(new URL('../src/components/LivingStoryMissionCenter.tsx', import.meta.url), 'utf8')
const missionCatalog = fs.readFileSync(new URL('../src/data/livingStoryMissionCatalog.ts', import.meta.url), 'utf8')
const ciWorkflow = fs.readFileSync(new URL('../../.github/workflows/ci.yml', import.meta.url), 'utf8')

assert.equal(pkg.engines?.node, '>=24 <25', 'main sync must preserve the current Node 24 runtime contract')
assert.match(pkg.scripts.build, /repair-streetverse-entry\.mjs/, 'build must run the StreetVerse entry repair before smoke/build')
assert.match(pkg.scripts.build, /npm run smoke/, 'build must retain the foundation smoke gate')
assert.match(pkg.scripts.smoke, /streetverse-journey-qa-contract\.mjs/, 'main sync must retain the current main journey QA smoke gate')
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
