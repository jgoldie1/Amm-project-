import fs from 'node:fs'

const lib=fs.readFileSync(new URL('../api/_lib/meshy.js',import.meta.url),'utf8')
const health=fs.readFileSync(new URL('../api/meshy/health.js',import.meta.url),'utf8')
const generate=fs.readFileSync(new URL('../api/meshy/generate.js',import.meta.url),'utf8')
const task=fs.readFileSync(new URL('../api/meshy/task.js',import.meta.url),'utf8')
const must=(ok,msg)=>{if(!ok)throw new Error('MESHY API CONTRACT FAIL: '+msg)}

must(lib.includes("process.env.MESHY_API_KEY"),'Meshy credential must stay server-side')
must(!lib.includes('VITE_MESHY_API_KEY'),'Meshy secret must never use a VITE_ public env variable')
must(lib.includes("Authorization:`Bearer ${key}`"),'Meshy requests must use Bearer authentication')
must(lib.includes("https://api.meshy.ai/openapi/v1"),'Meshy API base URL missing')
must(lib.includes("target_formats=['glb']"),'Meshy generation must request GLB')
must(lib.includes("meshy-7.1"),'Meshy 7.1 model support missing')
must(lib.includes("geometry_resolution=['standard','2k','4k']"),'single-image geometry resolution guard missing')
must(lib.includes("geometry_resolution=['standard','2k']"),'multi-image geometry resolution guard missing')
must(lib.includes("data:image\\/(png|jpe?g);base64"),'data URI image support missing')

must(health.includes("keyExposed:false"),'health endpoint must never expose key')
must(generate.includes("requireUser"),'generation endpoint must require authenticated TRYAMM user')
must(task.includes("requireUser"),'task endpoint must require authenticated TRYAMM user')
must(generate.includes("image-to-3d")&&generate.includes("multi-image-to-3d"),'single and multi-image generation modes missing')

console.log('MESHY API CONTRACT PASS: server secret + Bearer auth + single/multi image-to-3D + GLB-only output')
