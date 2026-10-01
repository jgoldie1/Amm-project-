import fs from 'node:fs'
const d=fs.readFileSync(new URL('../src/data/streetVerseDiscordCommunity.ts',import.meta.url),'utf8')
const a=fs.readFileSync(new URL('../src/data/streetVerseQuantumDiscordZapier.ts',import.meta.url),'utf8')
const w=fs.readFileSync(new URL('../src/components/StreetVerseNearWest3D.tsx',import.meta.url),'utf8')
for(const x of ['DISCORD_CLIENT_SECRET','role_connections.write','bot-token'])if(!d.includes(x))throw new Error('missing '+x)
for(const x of ['ZAPIER_CATCH_HOOK_URL','tryamm:automation-event-request','mission.completed','live.started'])if(!a.includes(x))throw new Error('missing '+x)
for(const x of ['QUANTUM DISCORD','StreetVerseDiscordPanel'])if(!w.includes(x))throw new Error('missing '+x)
console.log('Quantum Discord + Zapier integration contract: PASS')
