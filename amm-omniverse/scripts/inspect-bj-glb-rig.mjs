import fs from 'node:fs'
import path from 'node:path'

const file=process.argv[2]||'public/tryamm-assets/meshy/characters/SV_HERO_BJ_STUBBS_V12.glb'
if(!fs.existsSync(file)){console.error('BJ RIG AUDIT FAIL: GLB missing:',file);process.exit(1)}
const bytes=fs.readFileSync(file)
if(bytes.length<20||bytes.toString('ascii',0,4)!=='glTF'||bytes.readUInt32LE(4)!==2||bytes.readUInt32LE(8)!==bytes.length){
  console.error('BJ RIG AUDIT FAIL: invalid GLB v2 header/length');process.exit(1)
}
let offset=12,document=null
while(offset+8<=bytes.length){
  const length=bytes.readUInt32LE(offset),type=bytes.readUInt32LE(offset+4)
  offset+=8
  if(offset+length>bytes.length){console.error('BJ RIG AUDIT FAIL: truncated chunk');process.exit(1)}
  if(type===0x4e4f534a){try{document=JSON.parse(bytes.toString('utf8',offset,offset+length))}catch{console.error('BJ RIG AUDIT FAIL: invalid JSON chunk');process.exit(1)}}
  offset+=length
}
if(offset!==bytes.length||!document){console.error('BJ RIG AUDIT FAIL: malformed chunks or missing JSON');process.exit(1)}
const meshes=document.meshes?.length||0,skins=document.skins||[],animations=document.animations||[]
const joints=skins.reduce((n,s)=>n+(s.joints?.length||0),0)
const clips=animations.map(a=>({name:a.name||'(unnamed)',channels:a.channels?.length||0}))
console.log(JSON.stringify({file:path.normalize(file),meshes,skins:skins.length,joints,animations:clips},null,2))
if(!meshes){console.error('BJ RIG AUDIT FAIL: no meshes');process.exit(1)}
if(!skins.length||!joints||!animations.length||!clips.some(c=>c.channels>0)){
  console.error('BJ RIG AUDIT BLOCKED: model exists but no verified skeletal skin and animation channels. Do not claim playable BJ rig.');process.exit(2)
}
console.log('BJ RIG STRUCTURE PASS: mesh, skin joints and animation channels present. Browser playback still required.')
