import assert from 'node:assert/strict'
import fs from 'node:fs'
const hub=fs.readFileSync(new URL('../src/components/QuantumDiscordHub.tsx',import.meta.url),'utf8')
const game=fs.readFileSync(new URL('../src/components/StreetVerse3D.tsx',import.meta.url),'utf8')
assert.ok(hub.includes('https://discord.gg/KZvPA9dnythat'),'Owner-provided Discord invite missing')
assert.ok(hub.includes('safeDiscordInvite(configured)'),'Invite must be validated')
assert.ok(hub.includes('rel="noopener noreferrer"'),'External invite must be safe')
assert.ok(hub.includes('unverified'),'Invite validation status must be transparent')
assert.ok(game.includes('<QuantumDiscordHub')&&game.includes('QUANTUM DISCORD'),'StreetVerse hub launcher missing')
assert.ok(!hub.includes('fetch('),'Community hub must not silently post data')
console.log('Quantum Discord invite and safety source contract: PASS')
