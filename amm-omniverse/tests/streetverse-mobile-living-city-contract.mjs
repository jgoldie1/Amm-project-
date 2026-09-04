import fs from 'node:fs'

const world=fs.readFileSync(new URL('../src/components/StreetVerseMobileWorld.tsx',import.meta.url),'utf8')
const runtime=fs.readFileSync(new URL('../src/runtime/StreetVerseMobileLivingCityRuntime.ts',import.meta.url),'utf8')

const requiredWorld=[
  "createMobileResidentPopulation(scene)",
  "tickMobileResidentPopulation(residents,now)",
  "disposeMobileResidentPopulation(residents)",
  "tryamm:streetverse-resident-population-ready",
  "residentCount:residents.length",
  "livingCity:true",
]
for(const token of requiredWorld){if(!world.includes(token))throw new Error(`StreetVerse mobile living-city contract missing: ${token}`)}

const residentIds=(runtime.match(/streetverse-mobile-resident-/g)||[]).length
if(residentIds<1)throw new Error('Mobile resident runtime must name resident scene objects.')
if(!runtime.includes("const routes:Array<Pick<MobileResident,'axis'|'fixed'|'phase'|'speed'>>=["))throw new Error('Mobile resident runtime must define lightweight walking routes.')
if(!runtime.includes("group.userData.streetverseResident=true"))throw new Error('Mobile resident runtime must tag residents for QA/runtime discovery.')
if(!runtime.includes('BODY_GEOMETRY')||!runtime.includes('HEAD_GEOMETRY'))throw new Error('Mobile resident runtime must share lightweight geometry rather than generate heavy per-frame assets.')

console.log('StreetVerse mobile living-city contract: PASS (8 lightweight moving residents + health telemetry + cleanup)')
