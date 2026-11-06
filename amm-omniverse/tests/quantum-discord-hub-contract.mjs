import assert from 'node:assert/strict'
import fs from 'node:fs'
const hub=fs.readFileSync(new URL('../src/components/QuantumDiscordHub.tsx',import.meta.url),'utf8')
const city=fs.readFileSync(new URL('../src/components/StreetVerse3D.tsx',import.meta.url),'utf8')
for(const token of ['safeDiscordInvite','VITE_QUANTUM_DISCORD_INVITE','noopener noreferrer','staff-review','rate-limit','Discord connection pending'])assert.ok(hub.includes(token),'Missing Discord control: '+token)
assert.ok(city.includes('<QuantumDiscordHub')&&city.includes('QUANTUM DISCORD'),'Discord launch not connected')
assert.ok(!hub.includes('fetch(')&&!hub.includes('DISCORD_BOT_TOKEN'),'Browser code must not send Discord API calls or embed bot credentials')
console.log('Quantum Discord safe-link and UI contract: PASS')
