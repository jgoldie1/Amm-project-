import assert from 'node:assert/strict'
import fs from 'node:fs'

const runtime=fs.readFileSync(new URL('../src/runtime/StreetVerseAfterDarkAlphaRuntime.ts',import.meta.url),'utf8')
const overlay=fs.readFileSync(new URL('../src/components/StreetVerseAfterDarkAlpha.tsx',import.meta.url),'utf8')
const bridge=fs.readFileSync(new URL('../src/components/StreetVerseGeoSpawnBridge.tsx',import.meta.url),'utf8')
const catalog=fs.readFileSync(new URL('../src/data/livingStoryMissionCatalog.ts',import.meta.url),'utf8')

for(const token of [
  'after-dark-white-night-file',
  'age-gate',
  'verifyAfterDarkAgeAndConsent',
  'chooseAfterDarkApproach',
  'collectAfterDarkEvidence',
  'protectAfterDarkWitness',
  'validateAfterDarkAlphaCompletion',
  'tryamm:streetverse-mission-complete',
  'tryamm:reel-highlight',
  'Evidence Before Accusation',
]) assert(runtime.includes(token),`After Dark runtime missing ${token}`)

assert(runtime.includes('VERIFIED_PUBLIC_EVENT_CAMEOS: PublicEventCameo[] = []'), 'Alpha must not enable unsourced real-person cameos')
assert(runtime.includes('suspectEligible: false'), 'Real-person cameo contract must forbid suspect eligibility')
assert(runtime.includes("fictional: true"), 'Evidence contract must be explicitly fictional')
assert(!runtime.includes('P. Diddy'), 'Runtime must not make a real celebrity a gameplay suspect')
assert(!runtime.includes('Sean Combs'), 'Runtime must not make a real celebrity a gameplay suspect')

for(const token of ['21+ gate & consent','Choose your approach','Evidence board','Protected witness','VALIDATE & COMPLETE MISSION']) {
  assert(overlay.includes(token),`After Dark playable overlay missing ${token}`)
}

assert(bridge.includes('installStreetVerseAfterDarkAlphaRuntime()'), 'StreetVerse city bridge must install After Dark runtime')
assert(bridge.includes('<StreetVerseAfterDarkAlpha/>'), 'StreetVerse city bridge must render After Dark alpha overlay')
assert(catalog.includes("id: 'after-dark-white-night-file'"), 'Living Story catalog must register After Dark mission')
assert(catalog.includes("status: 'ready'"), 'After Dark mission must be alpha-ready, not falsely marked live')

console.log('StreetVerse After Dark alpha mission contract: PASS')
