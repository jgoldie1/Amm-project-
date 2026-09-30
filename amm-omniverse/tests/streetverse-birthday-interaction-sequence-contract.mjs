import fs from 'node:fs'
const s=fs.readFileSync(new URL('../src/components/StreetVerseNearWest3D.tsx',import.meta.url),'utf8')
for(const x of ["'talk'|'repair'|'drive'|'deliver'","STEP 1 • TALK","STEP 2 • ACTION","STEP 3 • ACTION","STEP 4 •","tryamm:streetverse-mission-step","?'REPAIR'","?'DRIVE'"])if(!s.includes(x))throw new Error('missing '+x)
console.log('Birthday interaction mission sequence contract: PASS')
