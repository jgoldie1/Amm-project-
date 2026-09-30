import fs from 'node:fs'
const p=new URL('../src/components/StreetVerseGeoSpawnBridge.tsx',import.meta.url)
const s=fs.readFileSync(p,'utf8')
for(const token of ["StreetVerseNearWest3D","nearWestOpen","UIC • TAYLOR • MEDICAL","Return to StreetVerse Chicago"])if(!s.includes(token))throw new Error('missing '+token)
console.log('StreetVerse Near West playable mount contract: PASS')
