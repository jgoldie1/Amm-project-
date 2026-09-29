import fs from 'node:fs'
const world=fs.readFileSync(new URL('../src/components/StreetVerseMobileWorld.tsx',import.meta.url),'utf8')
const actions=fs.readFileSync(new URL('../src/components/StreetVerseActionCarousel.tsx',import.meta.url),'utf8')
const repair=fs.readFileSync(new URL('../src/runtime/StreetVerseVehicleRepairStreamerRuntime.ts',import.meta.url),'utf8')

for(const x of ["first-repair-car","REPAIR CAR","ENTER VEHICLE","missionNav","tryamm:streetverse-interaction-context","tryamm:streetverse-vehicle-breakdown","tryamm:streetverse-repair-kit-acquired","reason:'repair-required'"])if(!world.includes(x))throw new Error('visible mobile repair/vehicle path missing: '+x)
for(const x of ["'diagnose'","'verify'","label:'DIAGNOSE'","label:'VERIFY'","tryamm:streetverse-vehicle-repair-action"])if(!actions.includes(x))throw new Error('complete repair carousel action missing: '+x)
for(const x of ["'inspect','open-hood','diagnose','use-repair-kit','repair','verify'","tryamm:streetverse-vehicle-drive-lock","tryamm:streetverse-vehicle-repaired"])if(!repair.includes(x))throw new Error('repair runtime certification path missing: '+x)
console.log('StreetVerse visible mission + repair + vehicle entry contract: PASS')
