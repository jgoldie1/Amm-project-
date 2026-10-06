import fs from 'node:fs'

const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8')
const runtime=read('src/runtime/Chicago77LivingMemoryMeshRuntime.ts')
const atlas=read('src/components/Chicago77HolographicAtlas.tsx')
const registry=read('src/config/streetverseCommunitySlices.ts')
const main=read('src/main.tsx')
const launch=read('src/components/GlobalLaunchBar.tsx')
const pkg=JSON.parse(read('package.json'))
const must=(ok,msg)=>{if(!ok)throw new Error('CHICAGO77 MEMORY MESH CONTRACT FAIL: '+msg)}

for(const token of ['CHICAGO_77_SLICES','memoryScore','livingScore','lastEra','tryamm:chicago77-memory-mesh-state','tryamm:streetverse-community-slice-ready','tryamm:business-passport-created','tryamm:open-reel-creator','tryamm:time-machine-community-era'])must(runtime.includes(token),'runtime missing '+token)
for(const token of ['CHICAGO 77 HOLOGRAPHIC ATLAS','77 LIVING COMMUNITY AREAS','HOLO FLY IN','communityArea=','MEM'])must(atlas.includes(token),'atlas missing '+token)
const listMatch=registry.match(/export const CHICAGO_77_NAMES=[([sS]*?)]s+as const/)
must(Boolean(listMatch),'Chicago 77 registry missing')
const names=[...(listMatch?.[1]||'').matchAll(/'([^']+)'|"([^"]+)"/g)].map(m=>m[1]||m[2])
must(names.length===77,'Chicago 77 registry is not exactly 77 areas')
must(main.includes("Chicago77HolographicAtlas"),'Chicago 77 atlas route not wired')
must(main.includes("Chicago77LivingMemoryMeshRuntime"),'Chicago 77 memory runtime not installed')
must(launch.includes("['CHICAGO 77','/chicago77']"),'Chicago 77 launcher missing')
must(String(pkg.scripts?.build||'').includes('chicago77-living-memory-mesh-contract.mjs'),'production build does not run Chicago 77 memory contract')

console.log(JSON.stringify({areas:names.length,livingMemoryMesh:true,holographicAtlas:true,timeMachineMemory:true},null,2))
console.log('CHICAGO77 LIVING MEMORY MESH CONTRACT PASS')
