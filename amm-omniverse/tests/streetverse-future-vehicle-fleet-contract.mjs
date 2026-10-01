import fs from 'node:fs'
const s=fs.readFileSync(new URL('../src/components/StreetVerseNearWest3D.tsx',import.meta.url),'utf8')
const d=fs.readFileSync(new URL('../src/data/streetVerseFutureVehicles.ts',import.meta.url),'utf8')
for(const x of ['FutureVehicleMeshes','STREETVERSE_FUTURE_VEHICLES'])if(!s.includes(x))throw new Error('missing '+x)
for(const x of ['Aurora Hyper','Orbit Ring Bike','Guardian Utility','Vector Cyber Shuttle'])if(!d.includes(x))throw new Error('missing '+x)
console.log('StreetVerse future vehicle fleet contract: PASS')
