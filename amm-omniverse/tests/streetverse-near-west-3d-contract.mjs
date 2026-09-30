import fs from 'node:fs'
const p=new URL('../src/components/StreetVerseNearWest3D.tsx',import.meta.url)
const s=fs.readFileSync(p,'utf8')
for(const token of ['<Canvas','RoadMeshes','TaylorLots','sidewalkWidth','TAYLOR_STREET_CORRIDOR'])if(!s.includes(token))throw new Error('missing '+token)
console.log('StreetVerse Near West 3D contract: PASS')
