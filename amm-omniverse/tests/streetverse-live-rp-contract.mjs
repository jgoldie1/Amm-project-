import fs from 'node:fs'
const w=fs.readFileSync(new URL('../src/components/StreetVerseNearWest3D.tsx',import.meta.url),'utf8')
const d=fs.readFileSync(new URL('../src/data/streetVerseLiveRp.ts',import.meta.url),'utf8')
for(const x of ['LIVE • PK','StreetVerseLiveRpPanel'])if(!w.includes(x))throw new Error('missing '+x)
for(const x of ['circle-park','streetverse-global','pk-1v1','pk-team','mission-vote','reel-moment','disableWeaponInteraction:true'])if(!d.includes(x))throw new Error('missing '+x)
console.log('StreetVerse LIVE RP contract: PASS')
