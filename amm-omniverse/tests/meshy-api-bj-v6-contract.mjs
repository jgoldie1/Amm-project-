import fs from 'node:fs'

const lib=fs.readFileSync(new URL('../api/_lib/meshy.js',import.meta.url),'utf8')
const health=fs.readFileSync(new URL('../api/meshy/health.js',import.meta.url),'utf8')
const tasks=fs.readFileSync(new URL('../api/meshy/tasks.js',import.meta.url),'utf8')
const task=fs.readFileSync(new URL('../api/meshy/task.js',import.meta.url),'utf8')
const hero=fs.readFileSync(new URL('../src/runtime/StreetVerseMeshyBJHeroRuntime.ts',import.meta.url),'utf8')
const world=fs.readFileSync(new URL('../src/components/StreetVerseMobileWorld.tsx',import.meta.url),'utf8')

const must=(ok,msg)=>{if(!ok)throw new Error('MESHY BRIDGE CONTRACT FAIL: '+msg)}

must(lib.includes("process.env.MESHY_API_KEY"),'Meshy key must come from server environment')
must(lib.includes("Authorization:`Bearer ${key}`"),'Meshy API must use Bearer authentication')
must(!health.includes('MESHY_API_KEY:'),'health endpoint must never return secret value')
must(health.includes("keyExposed:false"),'health endpoint must explicitly report secret non-exposure')
must(tasks.includes("requireUser(req,res)"),'task listing must require authenticated TRYAMM user')
must(task.includes("requireUser(req,res)"),'task detail must require authenticated TRYAMM user')
must(tasks.includes("'image-to-3d','multi-image-to-3d'"),'3D task listing must cover single and multi-image generation')
must(lib.includes("modelUrls.glb||null"),'Meshy task summary must expose completed GLB URL')
must(hero.includes("SV_HERO_BJ_STUBBS_V6.glb"),'BJ V6 runtime must reserve canonical Meshy hero filename')
must(world.includes("loadStreetVerseMeshyBJHero()"),'mobile world must attempt Meshy BJ V6 hot-swap')
must(world.includes("proceduralFallbackSuppressed:true"),'successful Meshy hero must suppress fallback visual authority')

console.log('MESHY BRIDGE CONTRACT PASS: server secret + authenticated task listing + BJ V6 hot-swap')
