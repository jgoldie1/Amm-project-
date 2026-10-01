import fs from 'node:fs'
const d=fs.readFileSync(new URL('../src/data/streetVerseFutureVehicles.ts',import.meta.url),'utf8')
const u=fs.readFileSync(new URL('../src/components/StreetVerseFutureVehicleDealer.tsx',import.meta.url),'utf8')
for(const x of ['STREETVERSE_FUTURE_VEHICLE_LISTINGS','tryamm:vehicle-purchase-request','player-garage','SV_CREDITS'])if(!d.includes(x))throw new Error('missing '+x)
for(const x of ['BUY • DELIVER TO GARAGE','TRYAMM FUTURE MOBILITY'])if(!u.includes(x))throw new Error('missing '+x)
console.log('Future vehicle dealership contract: PASS')
