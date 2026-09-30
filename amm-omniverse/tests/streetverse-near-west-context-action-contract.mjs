import fs from 'node:fs'
const s=fs.readFileSync(new URL('../src/components/StreetVerseNearWest3D.tsx',import.meta.url),'utf8')
for(const x of ['senseNearby','ACTION •','tryamm:streetverse-gameplay-action','tryamm:streetverse-mission-start',"'npc'|'business'|'vehicle'"])if(!s.includes(x))throw new Error('missing '+x)
console.log('Near West context action contract: PASS')
