import fs from 'node:fs'
const access=fs.readFileSync(new URL('../src/data/StreetVerseVehicleAccessProgression.ts',import.meta.url),'utf8')
const runtime=fs.readFileSync(new URL('../src/runtime/StreetVerseVehicleAccessRuntime.ts',import.meta.url),'utf8')
const garage=fs.readFileSync(new URL('../src/components/StreetVersePowersportsGarage.tsx',import.meta.url),'utf8')
const must=(ok,msg)=>{if(!ok)throw new Error('STREETVERSE VEHICLE ACCESS CONTRACT FAIL: '+msg)}
for(const credential of ['StreetVerse Driver','Powersports Rider','StreetVerse Commercial Driver','Emergency Fleet Operator','StreetVerse Rotorcraft Pilot','StreetVerse Fixed-Wing Pilot','Future Mobility Pilot'])must(access.includes(credential),'missing '+credential)
must(access.includes('noPayToSkipSafetyProgression:true'),'pay-to-skip protection missing')
must(access.includes('realWorldLicenseRepresentation:false'),'real-world license truth boundary missing')
must(access.includes("ownership:'role-fleet'"),'emergency role-fleet ownership missing')
must(runtime.includes('ACTIVE_ROLE_REQUIRED'),'emergency active-role gate missing')
must(runtime.includes("streetLanding:false"),'street aircraft landing block missing')
must(runtime.includes('PASSENGER_ACCESS'),'passenger access path missing')
must(garage.includes('canUseStreetVerseVehicle'),'Powersports garage must enforce vehicle access runtime')
console.log('STREETVERSE VEHICLE ACCESS CONTRACT PASS: cars → powersports → commercial → emergency → rotorcraft → fixed-wing → future air')
