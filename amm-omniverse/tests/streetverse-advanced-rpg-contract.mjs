import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
const rpg=readFileSync(new URL('../src/game/rpg/StreetVerseAdvancedRPG.ts',import.meta.url),'utf8')
for(const symbol of ['createPlayer','applyRPGEvent','levelForXp','eligibleForBusinessLicense','completedEventIds','relationships','skills'])assert.ok(rpg.includes(symbol),'Missing RP/RPG contract: '+symbol)
assert.ok(rpg.includes('player.completedEventIds.includes(event.id)'),'Events must not award twice')
assert.ok(rpg.includes('event.city!==player.city'),'Events must remain city scoped')
console.log('StreetVerse advanced RP/RPG source contract: PASS')
