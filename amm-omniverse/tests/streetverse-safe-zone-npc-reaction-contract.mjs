import fs from 'node:fs'
const s=fs.readFileSync(new URL('../src/components/StreetVerseNearWest3D.tsx',import.meta.url),'utf8')
for(const x of ['UIC CAMPUS SAFE ZONE','MEDICAL DISTRICT SAFE ZONE','SAFE ZONE','npcReaction',"'downed'","vehicleAmmo<=0||!!safeZone"])if(!s.includes(x))throw new Error('missing '+x)
console.log('Safe-zone NPC reaction contract: PASS')
