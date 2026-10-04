import fs from 'node:fs'
const mobile=fs.readFileSync(new URL('../src/components/StreetVerseMobilePlayableWorld.tsx',import.meta.url),'utf8')
const omni=fs.readFileSync(new URL('../src/components/StreetVerseOmniWorld.tsx',import.meta.url),'utf8')
for(const x of ['🚛 JOBS','__showLogisticsFreight','tryamm:streetverse-logistics-open','/logistics-freight'])if(!mobile.includes(x))throw new Error('Mobile logistics bridge missing '+x)
for(const x of ['Holo Logistics Dispatch','Holo Logistics'])if(!omni.includes(x))throw new Error('OmniWorld logistics mission missing '+x)
console.log('StreetVerse logistics jobs bridge: PASS')