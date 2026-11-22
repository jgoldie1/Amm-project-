import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'

const ROOT=path.resolve(import.meta.dirname,'..')
const SEARCH=['amm-omniverse/public','public','amm-omniverse/src/assets','assets']
const LIMIT=35000
const extensions=new Set(['.glb','.gltf','.fbx','.obj'])
const files=[]
const warnings=[]
let scanned=0
function walk(root,level=0){
 if(scanned>=LIMIT||level>13)return
 let list
 try{list=fs.readdirSync(root,{withFileTypes:true})}catch{return}
 for(const dirent of list){
  if(scanned>=LIMIT)return
  if(dirent.name==='node_modules'||dirent.name==='.git'||dirent.name==='dist'||dirent.name==='.next')continue
  const full=path.join(root,dirent.name)
  if(dirent.isDirectory()){walk(full,level+1);continue}
  scanned++
  const ext=path.extname(dirent.name).toLowerCase()
  if(!extensions.has(ext))continue
  try{
   const stat=fs.statSync(full)
   const rel=path.relative(ROOT,full).replaceAll(path.sep,'/')
   const info={path:rel,format:ext.slice(1),bytes:stat.size,validFormat:null,skins:0,animations:0,meshes:0,rigEvidence:false,animationEvidence:false}
   if(ext==='.glb'){
    const buffer=fs.readFileSync(full)
    const magic=buffer.toString('ascii',0,4)
    const version=buffer.length>=12?buffer.readUInt32LE(4):0
    const total=buffer.length>=12?buffer.readUInt32LE(8):0
    info.validFormat=magic==='glTF'&&version===2&&total===buffer.length
    if(info.validFormat&&buffer.length>=20){
     const len=buffer.readUInt32LE(12),kind=buffer.readUInt32LE(16)
     if(kind===0x4E4F534A&&len>0&&len<=buffer.length-20){
      try{const gltf=JSON.parse(buffer.toString('utf8',20,20+len));info.skins=Array.isArray(gltf.skins)?gltf.skins.length:0;info.animations=Array.isArray(gltf.animations)?gltf.animations.length:0;info.meshes=Array.isArray(gltf.meshes)?gltf.meshes.length:0}catch(e){warnings.push('GLB JSON parse failed: '+rel)}
     }
    }
   }
   if(ext==='.gltf'){
    const gltf=JSON.parse(fs.readFileSync(full,'utf8'))
    info.validFormat=Boolean(gltf.asset?.version)
    info.skins=Array.isArray(gltf.skins)?gltf.skins.length:0
    info.animations=Array.isArray(gltf.animations)?gltf.animations.length:0
    info.meshes=Array.isArray(gltf.meshes)?gltf.meshes.length:0
   }
   info.rigEvidence=info.skins>0
   info.animationEvidence=info.animations>0
   files.push(info)
  }catch(e){warnings.push('Failed reading '+path.relative(ROOT,full))}
 }
}
for(const target of SEARCH)walk(path.join(ROOT,target))
const identified=files.filter(x=>/bj|jacob|lateasia|lat[eai]asia|streetverse|circle.?park|raymond|showcase/i.test(x.path))
const report={
 schema:'tryamm.streetverse.asset.audit.v1',generatedAt:new Date().toISOString(),scannedFiles:scanned,
 assets:files.length,glbFiles:files.filter(x=>x.format==='glb').length,
 parseableGLTF:files.filter(x=>(x.format==='glb'||x.format==='gltf')&&x.validFormat===true).length,
 withSkin:files.filter(x=>x.rigEvidence).length,withAnimation:files.filter(x=>x.animationEvidence).length,
 relevantAssets:identified.slice(0,150),warnings:warnings.slice(0,80),
 flags:{liveRendererVerified:false,liveRigRetargetVerified:false,characterLikenessVerified:false,chromebookVerified:false,iphoneVerified:false},
 note:'File-level mesh, skin and animation presence is not an in-world render, fidelity, license, or device-playability certification.'
}
const destination=path.join(ROOT,'asset-evidence')
fs.mkdirSync(destination,{recursive:true})
fs.writeFileSync(path.join(destination,'streetverse-asset-audit.json'),JSON.stringify(report,null,2))
console.log(JSON.stringify({scannedFiles:report.scannedFiles,assets:report.assets,glbFiles:report.glbFiles,parseableGLTF:report.parseableGLTF,withSkin:report.withSkin,withAnimation:report.withAnimation,relevant:identified.length,warnings:warnings.length}))
for(const entry of identified.slice(0,12))console.log('ASSET '+entry.path+' skin='+entry.skins+' animations='+entry.animations+' meshes='+entry.meshes)
