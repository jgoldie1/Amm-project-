import fs from 'node:fs'
import path from 'node:path'
import assert from 'node:assert/strict'

const root = process.cwd()
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8')

const cast = read('src/gameplay/streetVersePlayableCast.ts')
const memory = read('src/memory/holographicMemoryMissionNexus.ts')

for (const character of ['Jay', 'Nova', 'Ace', 'Sky', 'Miles']) {
  assert.ok(cast.includes(`name:'${character}'`), `missing playable character ${character}`)
}
for (const game of ['HOLO_HOOPS', 'STREET_RACE', 'DELIVERY_RUN', 'MISSION_HUNT']) {
  assert.ok(cast.includes(game), `missing StreetVerse game ${game}`)
}
assert.ok(cast.includes('clientMayAwardCash:false'), 'client cash awards must remain blocked')
assert.ok(cast.includes('clientMayCreatePayableBalance:false'), 'client payable balances must remain blocked')
assert.ok(cast.includes('cashRewardsRequireServerVerification:true'), 'cash rewards must remain server verified')
assert.ok(cast.includes('spectatorBettingEnabled:false'), 'spectator betting must remain disabled')

assert.ok(memory.includes('conversationMayDeclareLive: false'), 'conversation must not declare implementation live')
assert.ok(memory.includes('rawConversationRetentionLimited: true'), 'raw conversation retention must remain limited')
assert.ok(memory.includes('sensitiveDataMinimized: true'), 'sensitive data must remain minimized')
assert.ok(memory.includes('restoreRequiresAuthorizedUser: true'), 'memory restore must require authorization')
assert.ok(memory.includes("item.kind === 'GITHUB_COMMIT'"), 'LIVE claims must require GitHub commit evidence')

console.log('StreetVerse playable recovery contract passed')
