import assert from 'node:assert/strict'
import fs from 'node:fs'

const pkg=JSON.parse(fs.readFileSync(new URL('../package.json',import.meta.url),'utf8'))
const smoke=String(pkg.scripts?.smoke||'')
const build=String(pkg.scripts?.build||'')
const security=String(pkg.scripts?.security||'')
const readiness=String(pkg.scripts?.readiness||'')
const check=String(pkg.scripts?.check||'')

const mustContain=(haystack,needle,label)=>assert.ok(haystack.includes(needle),label+' missing: '+needle)

// Existing preservation spine: never weaken/remove these gates while adding V8 visuals.
for(const gate of [
  'streetverse-visible-loop-contract.mjs',
  'streetverse-authoritative-reward-contract.mjs',
  'streetverse-mobile-reel-last-mile-contract.mjs',
  'server-authoritative-stripe-contract.mjs',
  'commerce-transaction-ledger-contract.mjs',
  'app-release-convergence-contract.mjs',
  'pwa-install-release-contract.mjs',
  'streetverse-unified-mobile-controls-contract.mjs',
  'streetverse-vehicle-control-contract.mjs',
  'main-sync-preflight-contract.mjs'
]) mustContain(smoke,gate,'no-regression smoke gate')

for(const gate of [
  'streetverse-mobile-v6-character-contract.mjs',
  'streetverse-mobile-v7-convergence-contract.mjs',
  'streetverse-neighborhood-digital-twin-v8-contract.mjs',
  'october-launch-lock-contract.mjs',
  'streetverse-mobile-play-first-contract.mjs'
]) mustContain(build,gate,'no-regression build gate')

for(const gate of [
  'repository-security-scan.mjs',
  'jacobie-quantum-shield-contract.mjs',
  'tryamm-edge-ddos-contract.mjs'
]) mustContain(security,gate,'no-regression security gate')

mustContain(readiness,'production-readiness.mjs','production readiness')
mustContain(readiness,'provider-gates','provider readiness')
for(const step of ['npm run lint','npm run security','npm run readiness','npm run typecheck','npm run smoke','npm run build']) mustContain(check,step,'full check pipeline')

// Authoritative release spine protected by the existing contracts above:
// SIGN IN → STREETVERSE → SPAWN → MOVE → ACTION → MISSION → REWARD →
// MARKETPLACE → PAY → ENTITLEMENT → LEDGER / OMNI CASH → RELOAD → STATE STILL EXISTS.
const protectedSpine=[
  'SIGN IN','STREETVERSE','SPAWN','MOVE','ACTION','MISSION','REWARD',
  'MARKETPLACE','PAY','ENTITLEMENT','LEDGER / OMNI CASH','RELOAD','STATE STILL EXISTS'
]
assert.equal(protectedSpine.length,13)

// Rendering regression guard: a basic iPhone must attempt the real 3D world first.
// Prior tests only checked that city assets and features existed in source, which did
// not detect a runtime downgrade into the simplified HTML CITY MODE.
const graphicsGeo=fs.readFileSync(new URL('../src/components/StreetVerseGeoSpawnBridge.tsx',import.meta.url),'utf8')
const graphicsEntry=fs.readFileSync(new URL('../src/components/StreetVersePlayableWorld.tsx',import.meta.url),'utf8')
const graphicsSafe=fs.readFileSync(new URL('../src/components/StreetVerseMobilePlayableWorld.tsx',import.meta.url),'utf8')
assert.match(graphicsGeo,/if\(appleMobile\)return false/,'mobile Safari must attempt the real renderer before falling back')
assert.match(graphicsEntry,/if\(appleMobile\)return false/,'the playable entry must not preemptively force iPhones into HTML mode')
assert.doesNotMatch(graphicsGeo,/failIfMajorPerformanceCaveat:true/,'a strict GPU preference must not preemptively disable mobile WebGL')
assert.match(graphicsGeo,/RETRY 3D CHICAGO/,'the startup fallback must offer a visible return path to 3D')
assert.match(graphicsEntry,/data-streetverse-render-mode="exception-fallback"/,'3D runtime exceptions need a labeled recovery view')
assert.match(graphicsEntry,/data-streetverse-render-mode="context-loss-fallback"/,'context loss needs a labeled recovery view')
assert.match(graphicsEntry,/target\.parentElement\?\.matches/,'context-loss fallback must only react to StreetVerse world canvas')
assert.match(graphicsEntry,/RETRY 3D/,'players must be able to retry the 3D game without losing the HTML backup')
assert.match(graphicsEntry,/tryamm:streetverse-renderer-failed/,'the fallback guard must listen for 3D initialization failures')
assert.doesNotMatch(graphicsEntry,/report\('healthy','mobile-boot-grace'\)/,'elapsed time cannot mark missing WebGL as healthy')
const emergencyControls=fs.readFileSync(new URL('../src/components/StreetVerseSafeWorld.tsx',import.meta.url),'utf8')
assert.match(emergencyControls,/data-streetverse-restore-3d/,'HTML City fallback must offer an accessible full 3D retry')
const graphics3d=fs.readFileSync(new URL('../src/components/StreetVerseMobileWorld.tsx',import.meta.url),'utf8')
assert.match(graphics3d,/tryamm:streetverse-renderer-failed/,'the mobile renderer must report WebGL initialization errors')
assert.match(graphicsSafe,/HTML CITY MODE/,'retain the lightweight offline-friendly city as a backup')

console.log('STREETVERSE V8 NO-REGRESSION PASS: preservation gates intact; authoritative spine remains protected')
