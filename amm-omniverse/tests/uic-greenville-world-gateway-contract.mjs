import fs from 'node:fs'
const s=fs.readFileSync(new URL('../src/components/StreetVerseNearWest3D.tsx',import.meta.url),'utf8')
for(const x of ['CampusVerseCollegeBookBridge','UIC • COLLEGEBOOK','GREENVILLE • JACOBIE','tryamm:campusverse-travel'])if(!s.includes(x))throw new Error('missing '+x)
console.log('UIC Greenville world gateway contract: PASS')
