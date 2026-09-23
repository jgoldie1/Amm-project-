import fs from 'node:fs'
const src=fs.readFileSync(new URL('../src/foundation/sportsVerseVrFoundation.ts', import.meta.url),'utf8')
for (const required of ['5v5','beachVolleyball','aiFillEmptySlots','spectatorsSupported','holo-hand','adaptive-one-hand','event-replay','holo-director','verified-competition','serverAuthoritativeCompetition','noClientMintedRewards']) {
  if (!src.includes(required)) throw new Error('Missing SportsVerse VR foundation contract: '+required)
}
console.log('SportsVerse VR/phygital foundation contract OK')
