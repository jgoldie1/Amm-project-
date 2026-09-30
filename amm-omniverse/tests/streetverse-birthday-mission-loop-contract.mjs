import fs from 'node:fs'
const w=fs.readFileSync(new URL('../src/components/StreetVerseNearWest3D.tsx',import.meta.url),'utf8')
const d=fs.readFileSync(new URL('../src/data/streetVerseBirthdayMissions.ts',import.meta.url),'utf8')
for(const x of ['START MISSION • TAYLOR RUN','MissionMarker','OBJECTIVE REACHED','COMPLETE • +','tryamm:streetverse-mission-complete'])if(!w.includes(x))throw new Error('missing '+x)
for(const x of ['birthday-taylor-run','mission-reward-request','SV_CREDITS'])if(!d.includes(x))throw new Error('missing '+x)
console.log('Birthday mission loop contract: PASS')
