import fs from 'node:fs'
const s=fs.readFileSync(new URL('../src/components/StreetVerseNearWest3D.tsx',import.meta.url),'utf8')
for(const x of ['StreetVerseHitFx','tryamm:streetverse-npc-hit','tryamm:streetverse-npc-consequence','missionConsequence'])if(!s.includes(x))throw new Error('missing '+x)
console.log('NPC hit consequence contract: PASS')
