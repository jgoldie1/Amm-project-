import fs from 'node:fs'
import crypto from 'node:crypto'

const runtimePath=new URL('../src/runtime/StreetVerseMeshyBJHeroRuntime.ts',import.meta.url)
const runtime=fs.readFileSync(runtimePath,'utf8')
const urlMatch=runtime.match(/export const BJ_V15_PREVIEW=\{[\s\S]*?url:'([^']+)'/)
const fileMatch=runtime.match(/export const BJ_V15_PREVIEW=\{[\s\S]*?filename:'([^']+)'/)
if(!urlMatch||!fileMatch){
  console.error('BJ PRODUCTION RIG AUDIT FAIL: BJ_V15_PREVIEW URL/filename missing from runtime')
  process.exit(1)
}
const url=urlMatch[1]
const filename=fileMatch[1]
const EXPECTED_SHA256='122e77b243bb9feac9c6e835a500207d034ef8ee710f52751a89ee917e685258'

const controller=new AbortController()
const timer=setTimeout(()=>controller.abort(),30000)
let response
try{
  response=await fetch(url,{signal:controller.signal})
}finally{
  clearTimeout(timer)
}
if(!response.ok){
  console.error('BJ PRODUCTION RIG AUDIT BLOCKED: production V15 URL returned HTTP '+response.status)
  process.exit(2)
}
const bytes=Buffer.from(await response.arrayBuffer())
const sha256=crypto.createHash('sha256').update(bytes).digest('hex')
if(sha256!==EXPECTED_SHA256){
  console.error('BJ PRODUCTION RIG AUDIT BLOCKED: V15 bytes changed; expected reviewed SHA-256 '+EXPECTED_SHA256+' but received '+sha256)
  process.exit(2)
}
if(bytes.length<20||bytes.toString('ascii',0,4)!=='glTF'||bytes.readUInt32LE(4)!==2||bytes.readUInt32LE(8)!==bytes.length){
  console.error('BJ PRODUCTION RIG AUDIT FAIL: invalid GLB v2 header/length')
  process.exit(1)
}
let offset=12,document=null
while(offset+8<=bytes.length){
  const length=bytes.readUInt32LE(offset),type=bytes.readUInt32LE(offset+4)
  offset+=8
  if(offset+length>bytes.length){
    console.error('BJ PRODUCTION RIG AUDIT FAIL: truncated GLB chunk')
    process.exit(1)
  }
  if(type===0x4e4f534a){
    try{document=JSON.parse(bytes.toString('utf8',offset,offset+length).replace(/\0+$/,''))}
    catch{console.error('BJ PRODUCTION RIG AUDIT FAIL: invalid JSON chunk');process.exit(1)}
  }
  offset+=length
}
if(offset!==bytes.length||!document){
  console.error('BJ PRODUCTION RIG AUDIT FAIL: malformed chunks or missing JSON')
  process.exit(1)
}
const meshes=document.meshes?.length||0
const skins=document.skins||[]
const animations=document.animations||[]
const joints=skins.reduce((count,skin)=>count+(skin.joints?.length||0),0)
const clips=animations.map(animation=>({name:animation.name||'(unnamed)',channels:animation.channels?.length||0}))
const hasIdle=clips.some(clip=>/idle/i.test(clip.name)&&clip.channels>0)
const hasWalk=clips.some(clip=>/walk/i.test(clip.name)&&clip.channels>0)
console.log(JSON.stringify({filename,url,bytes:bytes.length,sha256,meshes,skins:skins.length,joints,animations:clips},null,2))
if(!meshes||!skins.length||joints<15||animations.length<3||!hasIdle||!hasWalk||!clips.some(clip=>clip.channels>0)){
  console.error('BJ PRODUCTION RIG AUDIT BLOCKED: production V15 lacks required mesh, skin, humanoid joints, idle/walk clips, or animation channels')
  process.exit(2)
}
console.log('BJ PRODUCTION V15 RIG PASS: reviewed URL/hash has mesh, skin joints, idle/walk and animation channels. Browser playback remains a separate runtime/device proof.')
