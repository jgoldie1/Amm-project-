import fs from 'node:fs'
const g=fs.readFileSync(new URL('../src/components/StreetVerseMyGarage.tsx',import.meta.url),'utf8')
const w=fs.readFileSync(new URL('../src/components/StreetVerseNearWest3D.tsx',import.meta.url),'utf8')
for(const x of ['serverConfirmed!==true','tryamm:vehicle-ownership-granted','tryamm:vehicle-sell-request','SPAWN','SELL'])if(!g.includes(x))throw new Error('missing '+x)
for(const x of ['MY GARAGE','tryamm:vehicle-spawn-request','StreetVerseMyGarage'])if(!w.includes(x))throw new Error('missing '+x)
console.log('StreetVerse garage ownership contract: PASS')
