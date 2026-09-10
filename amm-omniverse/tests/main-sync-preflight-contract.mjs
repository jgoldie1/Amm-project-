import assert from 'node:assert/strict'
import fs from 'node:fs'

const pkg = JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8'))
const bridge = fs.readFileSync(new URL('../src/components/LivingWorldsBridge.tsx', import.meta.url), 'utf8')
const repair = fs.readFileSync(new URL('../scripts/repair-streetverse-entry.mjs', import.meta.url), 'utf8')
const missionCenter = fs.readFileSync(new URL('../src/components/LivingStoryMissionCenter.tsx', import.meta.url), 'utf8')
const missionCatalog = fs.readFileSync(new URL('../src/data/livingStoryMissionCatalog.ts', import.meta.url), 'utf8')

assert.match(pkg.scripts.build, /repair-streetverse-entry\.mjs/, 'build must run the StreetVerse entry repair before smoke/build')
assert.match(pkg.scripts.build, /npm run smoke/, 'build must retain the foundation smoke gate')

assert.match(bridge, /import LivingStoryMissionCenter from '\.\/LivingStoryMissionCenter'/, 'LivingWorldsBridge must retain the reconciled Living Story module')
assert.match(bridge, /import MovieStudioCenter from '\.\/MovieStudioCenter'/, 'LivingWorldsBridge must retain branch Movie Studio functionality during main sync')
assert.match(bridge, /tryamm:open-living-story/, 'Living Story launch event must remain wired after synchronization')
assert.match(bridge, /tryamm:open-movie-studio/, 'Movie Studio launch event must remain wired after synchronization')

assert.match(repair, /StreetVerseMobilePlayableWorld/, 'repair script must keep the mobile StreetVerse fallback')
assert.match(repair, /TRYAMM public realm deep-link routing/, 'repair script must keep public realm deep-link recovery')
assert.match(missionCenter, /livingStoryMissionCatalog/, 'Living Story center must remain backed by the mission catalog')
assert.ok(missionCatalog.length > 0, 'Living Story mission catalog must not be empty')

console.log('main sync preflight contract: GREEN')
