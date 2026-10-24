import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import {spawnSync} from 'node:child_process'

// Safe wrapper around the existing Mind Over Matter foundry.
// Never replace original, licensed, or artist-authored assets.
const root=path.resolve(import.meta.dirname,'..')
const out=path.resolve(process.argv[2]||path.join(root,'public/generated-assets/mind-over-matter'))
const generator=path.join(root,'scripts/mind-over-matter-clean-room-foundry.mjs')
const names=['mom-building-kit.glb','mom-interior-kit.glb','mom-vehicle.glb',
  'mom-character.glb','mom-animal.glb','mom-prop-kit.glb','mom-environment-kit.glb',
  'mom-business-brand-kit.glb','mom-road-kit.glb','mom-mission-kit.glb']
const verifyOnly=process.argv.includes('--verify-only')
const force=process.argv.includes('--force')
const manifestFile=path.join(out,'genie-abracadabra-asset-manifest.json')
function checkGlb(file){
  const data=fs.readFileSync(file)
  if(data.length<28||data.toString('ascii',0,4)!=='glTF'||data.readUInt32LE(4)!==2||
    data.readUInt32LE(8)!==data.length)throw new Error('Invalid GLB header/length: '+file)
  const jsonLength=data.readUInt32LE(12)
  if(data.toString('ascii',16,20)!=='JSON'||20+jsonLength+8>data.length)throw new Error('Invalid GLB JSON chunk: '+file)
  const doc=JSON.parse(data.subarray(20,20+jsonLength).toString('utf8'))
  if(doc.asset?.version!=='2.0'||!doc.meshes?.length)throw new Error('Missing glTF 2.0 mesh: '+file)
  const binAt=20+jsonLength
  if(data.toString('ascii',binAt+4,binAt+8)!=='BIN\0')throw new Error('Missing GLB BIN chunk: '+file)
  return {bytes:data.length,sha256:crypto.createHash('sha256').update(data).digest('hex'),meshes:doc.meshes.length}
}
if(!verifyOnly){
  if(!force&&[...names,'original-fallback-pack.json','genie-abracadabra-asset-manifest.json']
      .some(name=>fs.existsSync(path.join(out,name)))){
    throw new Error('Output contains existing files; refusing to overwrite. Use a fresh output directory or --force for known generated files.')
  }
  fs.mkdirSync(out,{recursive:true})
  const result=spawnSync(process.execPath,[generator,out],{cwd:root,encoding:'utf8'})
  if(result.status!==0)throw new Error('Mind Over Matter generator failed: '+result.stderr)
}
const assets=names.map(name=>{
  const file=path.join(out,name)
  if(!fs.existsSync(file))throw new Error('Missing generated asset: '+file)
  return {name,...checkGlb(file),source:'TRYAMM Mind Over Matter procedural original',status:'generated-not-production-approved'}
})
const recipes=path.join(out,'original-fallback-pack.json')
if(!fs.existsSync(recipes))throw new Error('Missing original recipes')
const manifest={schema:'tryamm.genie.abracadabra.asset-manifest.v1',generator:'mind-over-matter-clean-room-foundry',
  requiresHumanApproval:true,deployAutomatically:false,assets}
if(!verifyOnly)fs.writeFileSync(manifestFile,JSON.stringify(manifest,null,2)+'\n')
console.log(JSON.stringify({output:out,verified:assets.length,manifest:verifyOnly?'read-only':manifestFile},null,2))
