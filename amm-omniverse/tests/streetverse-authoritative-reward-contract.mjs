import assert from 'node:assert/strict'
import fs from 'node:fs'

const bridge=fs.readFileSync(new URL('../src/runtime/StreetVerseMissionLedgerBridge.ts',import.meta.url),'utf8')
const progression=fs.readFileSync(new URL('../src/runtime/StreetVerseUnifiedProgressionRuntime.ts',import.meta.url),'utf8')
const world=fs.readFileSync(new URL('../src/components/StreetVerseMobilePlayableWorld.tsx',import.meta.url),'utf8')

for(const token of [
  "getAccessToken",
  "/api/get-paid-to-play/streetverse/complete",
  "/api/get-paid-to-play/claim",
  "streetverse_first_drop",
  "tryamm:streetverse-authoritative-reward",
  "serverDetermined:true",
]) assert(bridge.includes(token),`Mission ledger bridge missing ${token}`)

assert(!bridge.includes('localStorage.setItem'), 'Authoritative reward bridge must not write balances to local storage')
assert(!bridge.includes('earnCash'), 'Authoritative reward bridge must not credit client-side cash')
assert(progression.includes('installStreetVerseMissionLedgerBridge()'), 'Unified progression runtime must install mission ledger bridge')
assert(progression.includes("tryamm:streetverse-authoritative-reward"), 'Unified progression must sync from authoritative server reward state')
assert(world.includes("tryamm:streetverse-mission-complete"), 'Mobile playable world must emit mission completion')
assert(world.includes("district-01-mobile-safe"), 'Mobile playable world must use the Founder Alpha mission contract')
assert(world.includes("studio")&&world.includes("market")&&world.includes("river")&&world.includes("stage"), 'Founder Alpha mission requires all four Chicago checkpoints')

console.log('StreetVerse authoritative mission → ledger bridge contract: PASS')
