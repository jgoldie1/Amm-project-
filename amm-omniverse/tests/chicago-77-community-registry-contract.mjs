import fs from 'node:fs'

const registry=fs.readFileSync(new URL('../src/config/streetverseCommunitySlices.ts',import.meta.url),'utf8')
const safeWorld=fs.readFileSync(new URL('../src/components/StreetVerseSafeWorld.tsx',import.meta.url),'utf8')
const communityWorld=fs.readFileSync(new URL('../src/components/StreetVerseCommunityMobileWorld.tsx',import.meta.url),'utf8')
const geoBridge=fs.readFileSync(new URL('../src/components/StreetVerseGeoSpawnBridge.tsx',import.meta.url),'utf8')

const listMatch=registry.match(/export const CHICAGO_77_NAMES=\[([\s\S]*?)\]\s+as const/)
if(!listMatch)throw new Error('Chicago 77 registry list is missing')
const names=[...listMatch[1].matchAll(/'([^']+)'|"([^"]+)"/g)].map(match=>match[1]||match[2])
if(names.length!==77)throw new Error(`Chicago 77 registry must contain exactly 77 areas; found ${names.length}`)

const expected={1:'Rogers Park',32:'The Loop',41:'Hyde Park',76:"O'Hare",77:'Edgewater'}
for(const [number,name] of Object.entries(expected)){
 if(names[Number(number)-1]!==name)throw new Error(`Community Area ${number} must be ${name}; found ${names[Number(number)-1]}`)
}

for(const needle of ['CHICAGO_77_SLICES','CHICAGO_77_BY_NUMBER','getStreetVerseMissionSlice','getStreetVerseCommunitySlice']){
 if(!registry.includes(needle))throw new Error(`Chicago 77 registry contract missing: ${needle}`)
}
for(const needle of ['StreetVerseCommunityMobileWorld','if(slice)return']){
 if(!safeWorld.includes(needle))throw new Error(`Chicago 77 safe world routing missing: ${needle}`)
}
for(const needle of ['tryamm:streetverse-checkpoint','tryamm:streetverse-mission-complete','tryamm:open-reel-creator','communityAreaNumber','communityAreaName']){
 if(!communityWorld.includes(needle))throw new Error(`Chicago 77 mobile world contract missing: ${needle}`)
}
for(const needle of ['getStreetVerseCommunitySlice','resolveCommunitySpawn',"number==='32'","number==='41'"]){
 if(!geoBridge.includes(needle))throw new Error(`Chicago 77 spawn bridge contract missing: ${needle}`)
}

console.log('Chicago 77 community registry contract: PASS (77/77 configured + safe-world routing + mission/reward/Reel events + spawn bridge)')
