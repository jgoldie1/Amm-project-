import {readFile,writeFile,mkdir,readdir} from 'node:fs/promises'
import path from 'node:path'
import {build} from 'esbuild'
const root=process.cwd(),out=path.resolve(process.argv[2]||'world-request-preview')
const dir=path.join(root,'src/world-requests')
const files=(await readdir(dir)).filter(f=>f.endsWith('.json')).sort()
if(!files.length)throw Error('No world requests')
const compiled=await build({entryPoints:['src/runtime/StreetVerseAutoBuild.ts'],bundle:true,write:false,platform:'node',format:'esm'})
const {validateRequest,applyWorldRequests}=await import('data:text/javascript;base64,'+Buffer.from(compiled.outputFiles[0].text).toString('base64'))
const requests=await Promise.all(files.map(async f=>validateRequest(JSON.parse(await readFile(path.join(dir,f),'utf8')))))
const names={bench:'bench',streetLamp:'street-lamp',tree:'tree',holoWayfinder:'holo-wayfinder'}
const models={}
for(const asset of new Set(requests.flatMap(r=>r.assets))){
 const bytes=await readFile('public/generated-assets/native/kit/'+names[asset]+'.glb')
 if(bytes.toString('ascii',0,4)!=='glTF'||bytes.readUInt32LE(4)!==2||bytes.readUInt32LE(8)!==bytes.length)throw Error('Invalid GLB: '+asset)
 models[asset]=bytes.toString('base64')
}
const scenes={}
for(const site of new Set(requests.map(r=>r.site)))scenes[site]=applyWorldRequests([],site,{x:0,z:0,front:site==='laflin'?1:-1},requests)
const bundle=await build({entryPoints:['scripts/world-request-viewer.mjs'],bundle:true,format:'iife',minify:true,write:false,define:{PREVIEW_MODELS:JSON.stringify(models),PREVIEW_SCENES:JSON.stringify(scenes)}})
await mkdir(out,{recursive:true})
await writeFile(path.join(out,'index.html'),`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>StreetVerse build preview</title><style>*{box-sizing:border-box}body{margin:0;background:#152430;color:white;font:18px system-ui}header{padding:10px}button,select{min-height:48px;font:inherit;margin:3px}canvas{display:block;width:100%;height:65vh}p{margin:6px}</style><header><label>World Builder preview <select id="site"></select></label><p id="status" role="status">Loading models…</p></header><main></main><button id="walk">Walk to next prop</button><button id="back">Return to entrance</button><script>${bundle.outputFiles[0].text.replace(/<\/script/gi,'<\\/script')}</script></html>`)
console.log('Built offline preview:',files.length,'requests;',Object.keys(models).join(', '))
