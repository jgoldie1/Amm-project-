import fs from 'node:fs'
import assert from 'node:assert/strict'

const source = fs.readFileSync(new URL('../src/memory/holographicMemoryMissionNexus.ts', import.meta.url), 'utf8')

for (const surface of ['CONTINUE_MISSION', 'CHARACTERS', 'BENNY_HOLOGPT', 'MEMORY_RESTORE']) {
  assert.ok(source.includes(`'${surface}'`), `missing dashboard surface ${surface}`)
}

for (const state of ['IDEA', 'DESIGNED', 'COMMITTED', 'TESTED', 'DEPLOYED', 'LIVE']) {
  assert.ok(source.includes(`'${state}'`), `missing implementation state ${state}`)
}

assert.ok(source.includes('githubAuthoritativeForCode: true'))
assert.ok(source.includes('conversationMayDeclareLive: false'))
assert.ok(source.includes('screenshotsSupportingEvidenceOnly: true'))
assert.ok(source.includes('rawConversationRetentionLimited: true'))
assert.ok(source.includes('sensitiveDataMinimized: true'))
assert.ok(source.includes('restoreRequiresAuthorizedUser: true'))
assert.ok(source.includes("item.kind === 'GITHUB_COMMIT'"))

console.log('holographic memory mission nexus contract: ok')
