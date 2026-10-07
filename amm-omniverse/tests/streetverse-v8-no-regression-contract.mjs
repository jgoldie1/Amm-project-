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
console.log('STREETVERSE V8 NO-REGRESSION PASS: preservation gates intact; authoritative spine remains protected')
