import fs from 'node:fs'
const world=fs.readFileSync(new URL('../src/components/StreetVerseMobileWorld.tsx',import.meta.url),'utf8')
const actions=fs.readFileSync(new URL('../src/components/StreetVerseActionCarousel.tsx',import.meta.url),'utf8')
const repair=fs.readFileSync(new URL('../src/runtime/StreetVerseVehicleRepairStreamerRuntime.ts',import.meta.url),'utf8')
const shell=fs.readFileSync(new URL('../src/components/StreetVerseMobileGameShell.tsx',import.meta.url),'utf8')
const bridge=fs.readFileSync(new URL('../src/components/StreetVerseGeoSpawnBridge.tsx',import.meta.url),'utf8')

for(const x of ["first-repair-car","REPAIR CAR","ENTER VEHICLE","missionNav","tryamm:streetverse-interaction-context","tryamm:streetverse-vehicle-breakdown","tryamm:streetverse-repair-kit-acquired","reason:'repair-required'"])if(!world.includes(x))throw new Error('visible mobile repair/vehicle path missing: '+x)
for(const x of ["'diagnose'","'verify'","label:'DIAGNOSE'","label:'VERIFY'","tryamm:streetverse-vehicle-repair-action"])if(!actions.includes(x))throw new Error('complete repair carousel action missing: '+x)
for(const x of ["'inspect','open-hood','diagnose','use-repair-kit','repair','verify'","tryamm:streetverse-vehicle-drive-lock","tryamm:streetverse-vehicle-repaired"])if(!repair.includes(x))throw new Error('repair runtime certification path missing: '+x)
for(const x of ["REPAIR_TAP_ACTIONS","{action:'inspect'},{action:'open-hood'}","{action:'diagnose'},{action:'use-repair-kit',repairKitId:'starter-repair-kit'},{action:'repair'}","{action:'verify'}","tryamm:streetverse-vehicle-repair-action","source:'mobile-game-shell-3tap'","authoritative-repair-confirmation"])if(!shell.includes(x))throw new Error('3-tap to 6-action repair bridge missing: '+x)
if(shell.includes("new CustomEvent('tryamm:streetverse-vehicle-repaired',{detail:{vehicleId:repairContext.vehicleId,source:'mobile-game-shell'}}"))throw new Error('mobile shell must not self-certify vehicle repair')
for(const x of ["installStreetVerseVehicleRepairStreamerRuntime","useLayoutEffect(()=>{installStreetVerseVehicleRepairStreamerRuntime()},[])"])if(!bridge.includes(x))throw new Error('repair authority runtime is not installed on StreetVerse route: '+x)
console.log('StreetVerse visible mission + repair + vehicle entry contract: PASS')
