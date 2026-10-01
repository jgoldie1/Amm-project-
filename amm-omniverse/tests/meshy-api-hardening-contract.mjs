import fs from 'node:fs'

const lib=fs.readFileSync(new URL('../api/_lib/meshy.js',import.meta.url),'utf8')
const health=fs.readFileSync(new URL('../api/meshy/health.js',import.meta.url),'utf8')
const status=fs.readFileSync(new URL('../api/meshy/status.js',import.meta.url),'utf8')
const generate=fs.readFileSync(new URL('../api/meshy/generate.js',import.meta.url),'utf8')
const env=fs.readFileSync(new URL('../.env.example',import.meta.url),'utf8')

const must=(ok,msg)=>{if(!ok)throw new Error('MESHY API HARDENING CONTRACT FAIL: '+msg)}

must(lib.includes("process.env.MESHY_API_KEY"),'secret must come from server environment')
must(!lib.includes('VITE_MESHY_API_KEY'),'secret must never use VITE_ prefix')
must(lib.includes("Authorization:`Bearer ${key}`"),'Meshy API must use Bearer auth')
must(lib.includes("data:image\\/(png|jpe?g);base64"),'PNG/JPEG data URI input validation missing')
must(lib.includes("geometry_resolution=['standard','2k','4k']"),'single-image resolution guard missing')
must(lib.includes("geometry_resolution=['standard','2k']"),'multi-image resolution guard missing')
must(lib.includes("normalizeModel(body.ai_model)"),'Meshy model normalization missing')
must(health.includes("keyExposed:false"),'health endpoint must never expose secret')
must(status.includes("publicSecret:false"),'status endpoint must explicitly report secret as private')
must(status.includes("envName:'MESHY_API_KEY'"),'status endpoint must identify server env name only')
must(generate.includes("requireUser(req,res)"),'generation route must remain authenticated')
must(env.includes("MESHY_API_KEY="),'server env example must document MESHY_API_KEY')
must(!env.includes("VITE_MESHY_API_KEY"),'env example must not document a public Meshy secret')

console.log('MESHY API HARDENING CONTRACT PASS')
