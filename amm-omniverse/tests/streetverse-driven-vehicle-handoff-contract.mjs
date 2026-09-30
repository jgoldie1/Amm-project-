import fs from 'node:fs'
const s=fs.readFileSync(new URL('../src/components/StreetVerseNearWest3D.tsx',import.meta.url),'utf8')
for(const x of ['DrivenVehicle','hidden={!!driving}','exclude={driving||undefined}','drivenPosition','setPlayerSpawn','camera.position.lerp'])if(!s.includes(x))throw new Error('missing '+x)
console.log('Driven vehicle ownership handoff contract: PASS')
