import assert from 'node:assert/strict'
import fs from 'node:fs'
const guide=fs.readFileSync(new URL('../src/components/HoloGPTCommunityGuide.tsx',import.meta.url),'utf8')
const discord=fs.readFileSync(new URL('../src/components/QuantumDiscordHub.tsx',import.meta.url),'utf8')
const city=fs.readFileSync(new URL('../src/components/StreetVerse3D.tsx',import.meta.url),'utf8')
const required=['StreetVerse controls','Sculptify missions','Aniyah Cross Borders','Private beta','Discord community','Camera troubleshooting','Safety and privacy']
for(const name of required)assert.ok(guide.includes(name),'Missing topic: '+name)
assert.ok(guide.includes('answerHoloCommunityQuestion'))
assert.ok(guide.includes('aria-live="polite"'))
assert.ok(discord.includes('<HoloGPTCommunityGuide/>'))
assert.ok(city.includes('QUANTUM DISCORD'))
assert.ok(!guide.includes('fetch('),'Offline assistant must not transmit user messages')
assert.ok(!guide.includes('dangerouslySetInnerHTML'),'Do not inject untrusted content')
console.log('Quantum Discord + HoloGPT source contract: PASS')
