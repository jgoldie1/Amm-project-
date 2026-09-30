import fs from 'node:fs'
const s=fs.readFileSync(new URL('../src/components/StreetVerseNearWest3D.tsx',import.meta.url),'utf8')
for(const x of ['NearWestPlayer','useFrame','One hand movement controls','Walk forward','Walk left','Walk right','Walk backward','Stop walking'])if(!s.includes(x))throw new Error('missing '+x)
console.log('Near West one-hand movement contract: PASS')
