import fs from 'node:fs'
const w=fs.readFileSync(new URL('../src/components/StreetVerseNearWest3D.tsx',import.meta.url),'utf8')
const d=fs.readFileSync(new URL('../src/data/streetVerseCreatorGrowth.ts',import.meta.url),'utf8')
for(const x of ['CREATOR PASS','StreetVerseCreatorGrowthPanel'])if(!w.includes(x))throw new Error('missing '+x)
for(const x of ['creator-code-request','creator-join-request','mission-complete','reel-share'])if(!d.includes(x))throw new Error('missing '+x)
console.log('StreetVerse creator growth contract: PASS')
