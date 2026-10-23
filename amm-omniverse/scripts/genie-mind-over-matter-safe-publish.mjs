import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import crypto from 'node:crypto'
import {spawnSync} from 'node:child_process'

const root=path.resolve(import.meta.dirname,'..')
const generator=path.join(root,'scripts/mind-over-matter-clean-room-foundry.mjs')
const output=path.resolve(process.argv.find(a=>a.startsWith('--output='))?.slice(9)||path.join(root,'public/generated-assets/mind-over-matter'))
const verifyOnly=process.argv.includes('--verify-only')
const names=['mom-building-kit.glb','mom-interior-kit.glb','mom-vehicle.glb','mom-character.glb','mom-animal.glb','mom-prop-kit.glb','mom-environment-kit.glb','mom-business-brand-kit.glb','mom-road-kit.glb','mom-mission-kit.glb']
const sha256=b=>crypto.createHash('sha256').update(b).digest('hex')
function validate(file){
 const b=fs.readFileSync(file)
 if(b.length<28||b.toString('ascii',0,4)!=='glTF'||b.readUInt32LE(4)!==2||b.readUInt32LE(8)!==b.length)throw Error('Invalid GLB header: '+file)
 const length=b.readUInt32LE(12)
 if(length%4||b.toString('ascii',16,20)!=='JSON'||20+length+8>b.length)throw Error('Invalid JSON chunk: '+file)
 const doc=JSON.parse(b.subarray(20,20+length).toString('utf8'))
 const bin=20+length
 if(doc.asset?.version!=='2.0'||!doc.meshes?.length||b.toString('ascii',bin+4,bin+8)!=='BIN\0')throw Error('Invalid glTF structure: '+file)
 if(bin+8+b.readUInt32LE(bin)!==b.length)throw Error('Invalid binary chunk length: '+file)
 return {bytes:b.length,sha256:sha256(b),meshes:doc.meshes.length}
}
function inspect(dir){
 const assets=names.map(name=>({name,...validate(path.join(dir,name)),status:'generated-not-approved'}))
 const recipe=path.join(dir,'original-fallback-pack.json')
 if(!fs.existsSync(recipe))throw Error('Missing recipes')
 JSON.parse(fs.readFileSync(recipe,'utf8'))
 return {schema:'tryamm.genie.abracadabra.v2',originalGenerator:'mind-over-matter-clean-room-foundry',approved:false,assets}
}
if(verifyOnly){
 console.log(JSON.stringify(inspect(output),null,2))
}else{
 // Generate into a disposable staging directory, validate, then publish only into
 // an EMPTY destination. Never overwrite existing files, even with --force.
 if(fs.existsSync(output)&&fs.readdirSync(output).length)throw Error('Destination is not empty; refusing to replace original or existing assets: '+output)
 const stage=fs.mkdtempSync(path.join(os.tmpdir(),'tryamm-mom-'))
 try{
  const run=spawnSync(process.execPath,[generator,stage],{cwd:root,encoding:'utf8',timeout:120000,maxBuffer:1024*1024})
  if(run.error||run.status!==0)throw Error('Generator failed: '+(run.error?.message||run.stderr||run.status))
  const manifest=inspect(stage)
  fs.writeFileSync(path.join(stage,'genie-abracadabra-asset-manifest.json'),JSON.stringify(manifest,null,2)+'\n')
  fs.mkdirSync(output,{recursive:true})
  if(fs.readdirSync(output).length)throw Error('Destination changed during generation; aborting')
  for(const name of [...names,'original-fallback-pack.json','genie-abracadabra-asset-manifest.json']){
   fs.copyFileSync(path.join(stage,name),path.join(output,name),fs.constants.COPYFILE_EXCL)
  }
  console.log(JSON.stringify({output,verified:manifest.assets.length,approved:false},null,2))
 }finally{fs.rmSync(stage,{recursive:true,force:true})}
}
