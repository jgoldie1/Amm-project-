import fs from 'node:fs'

const lib=fs.readFileSync(new URL('../api/_lib/meshy.js',import.meta.url),'utf8')
const generate=fs.readFileSync(new URL('../api/meshy/generate.js',import.meta.url),'utf8')
const factory=fs.readFileSync(new URL('../api/_lib/meshy-factory.js',import.meta.url),'utf8')
const env=fs.readFileSync(new URL('../.env.example',import.meta.url),'utf8')
const must=(ok,msg)=>{if(!ok)throw new Error('MESHY SERVER API CONTRACT FAIL: '+msg)}

must(lib.includes("process.env.MESHY_API_KEY"),'Meshy key must stay server-side')
must(!lib.includes('VITE_MESHY_API_KEY'),'Meshy secret must never use a VITE_ prefix')
must(lib.includes("Authorization:`Bearer ${key}`"),'Meshy requests must use bearer authorization')
must(lib.includes("'image-to-3d':{path:'/image-to-3d',version:'v1'}"),'Image-to-3D v1 endpoint missing')
must(lib.includes("'multi-image-to-3d':{path:'/multi-image-to-3d',version:'v1'}"),'Multi-Image-to-3D v1 endpoint missing')
must(lib.includes("'text-to-3d':{path:'/text-to-3d',version:'v2'}"),'Text-to-3D must use Meshy v2')
must(lib.includes("body.mode='preview'"),'Text-to-3D v2 preview mode missing')
must(lib.includes('export async function createMeshyTextRefineTask'),'Text-to-3D v2 refine helper missing')
must(lib.includes("mode:'refine'"),'Text-to-3D v2 refine mode missing')
must(lib.includes('export async function getMeshyBalance'),'Meshy credit balance check missing')
must(factory.includes("textStage:'refine-submitting'"),'factory must atomically claim text refine submission')
must(factory.includes("textStage:'refine'"),'factory must record text refine stage')
must(factory.includes('createMeshyTextRefineTask'),'factory must submit Meshy text refine after preview')
must(lib.includes("export async function createMeshyTask"),'Meshy create task function missing')
must(generate.includes('requireUser(req,res)'),'generation route must require an authenticated TRYAMM user')
must(generate.includes("keyExposed:false"),'generation route must explicitly avoid key exposure')
must(generate.includes("target_formats"),'generation route must request GLB output')
must(generate.includes("pose_mode"),'generation route must support humanoid pose mode')
must(env.includes('MESHY_API_KEY='),'server env template must include Meshy key slot')

console.log('MESHY SERVER API CONTRACT PASS')
