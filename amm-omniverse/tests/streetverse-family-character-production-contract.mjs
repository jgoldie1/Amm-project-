import fs from 'node:fs'
import assert from 'node:assert/strict'

const production=fs.readFileSync(new URL('../src/data/StreetVerseFamilyCharacterProduction.ts',import.meta.url),'utf8')
const registry=fs.readFileSync(new URL('../src/game/characters/meetTheStubbsFamilyFriends.ts',import.meta.url),'utf8')
const playable=fs.readFileSync(new URL('../src/runtime/StreetVersePlayableCharactersRuntime.ts',import.meta.url),'utf8')
const mobile=fs.readFileSync(new URL('../src/components/StreetVerseMobileWorld.tsx',import.meta.url),'utf8')
const bash=fs.readFileSync(new URL('../scripts/streetverse-bj-family-mega-fix.sh',import.meta.url),'utf8')

for(const token of [
  'STREETVERSE_FAMILY_CHARACTER_PRODUCTION',
  "if(id==='bj-stubbs')return 'sv-bj-stubbs-v6'",
  'genericStandInsAllowedUntilReferenceReady:true',
  'authorizedReferenceRequiredForRealPersonMatch:true',
  'finalLikenessNeverClaimedFromGenericSlot:true',
])assert.ok(production.includes(token),'family production policy missing '+token)

for(const token of [
  "id:'bj-stubbs'",
  "id:'uncle-ray'",
  "id:'jacobie-stubbs'",
  "id:'isaiah-stubbs'",
  "id:'aniyah-stubbs'",
  "id:'kenny-stubbs'",
  "id:'don-cario-stubbs'",
])assert.ok(registry.includes(token),'family/friend registry missing '+token)

assert.ok(playable.includes('FAMILY_FRIEND_CAST'),'registered family/friends must become playable roster entries')
assert.ok(playable.includes('STREETVERSE_FAMILY_CHARACTER_PRODUCTION'),'playable runtime must use the canonical family production registry')
assert.ok(mobile.includes('activateFamilyStandIn'),'mobile StreetVerse must live-swap family/friend stand-in rigs')
assert.ok(mobile.includes('realPersonLikeness:false'),'generic rigs must never claim a real-person likeness')
assert.ok(mobile.includes('familyHeroHandle?.tick'),'family/friend rigs must animate with player movement')
assert.ok(bash.includes('SV_HERO_BJ_STUBBS_V6.glb'),'mega-fix must audit BJ production GLB')
assert.ok(bash.includes('meet-the-stubbs-native-character-visuals-contract.mjs'),'mega-fix must audit family visual authority')
assert.ok(bash.includes('Code/game convergence: PASSED'),'mega-fix must produce a clear verdict')

console.log('STREETVERSE BJ + FAMILY CHARACTER PRODUCTION CONTRACT PASS')
