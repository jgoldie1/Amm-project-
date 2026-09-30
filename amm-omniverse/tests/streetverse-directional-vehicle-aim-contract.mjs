import fs from 'node:fs'
const s=fs.readFileSync(new URL('../src/components/StreetVerseNearWest3D.tsx',import.meta.url),'utf8')
for(const x of ['drivenHeading','onHeading','vehicleAimSide','x.dot>.86','aimSide:vehicleAimSide'])if(!s.includes(x))throw new Error('missing '+x)
if(s.includes("filter(x=>x.d<34)"))throw new Error('nearest-target approximation still present')
console.log('Directional vehicle aim contract: PASS')
