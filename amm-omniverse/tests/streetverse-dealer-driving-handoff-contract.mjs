import fs from 'node:fs'
const s=fs.readFileSync(new URL('../src/components/StreetVerseNearWest3D.tsx',import.meta.url),'utf8')
for(const x of ['FUTURE MOBILITY • BUY','StreetVerseFutureVehicleDealer','driving','EXIT VEHICLE','One hand driving controls','exit-vehicle'])if(!s.includes(x))throw new Error('missing '+x)
console.log('Dealership driving handoff contract: PASS')
