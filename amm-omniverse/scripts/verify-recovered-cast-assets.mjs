import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
const root=new URL('../public/tryamm-assets/recovered-characters/',import.meta.url)
const files=[
 ['BJ_STUBBS_V15_MOTION_ENHANCED.glb',6220868,'310c56801f32760d79679242c6dee10631957ca29a42d9c8e10f4934df8a8439',9],
 ['Jacobie_Greenville_Recovered.glb',7860680,'f0b0ada28cf343a58668d5adfd8a42aadd12f867ae87c7a24d9b749f4370ed13',12],
 ['LaTeasia_RIGGED_DIAGNOSTIC.glb',871880,'96faef46205295d16cdf6c8d21a0e216438141f053cf0601800d62d3020998af',7],
]
let missing=0
for(const [filename,size,expected,animations] of files){
 const url=new URL(filename,root)
 if(!fs.existsSync(url)){console.error('MISSING:',filename);missing++;continue}
 const bytes=fs.readFileSync(url)
 const sha=crypto.createHash('sha256').update(bytes).digest('hex')
 if(bytes.length!==size||sha!==expected||bytes.subarray(0,4).toString()!=='glTF')throw Error('BAD GLB: '+filename)
 const len=bytes.readUInt32LE(12);const json=JSON.parse(bytes.subarray(20,20+len).toString('utf8'))
 if(!json.skins?.length||!json.meshes?.length||json.animations?.length<animations)throw Error('MISSING RIG/ANIMATIONS: '+filename)
 console.log('VERIFIED',filename,'meshes',json.meshes.length,'animations',json.animations.length)
}
if(missing)throw Error('Cast model assets not yet published: '+missing+' missing. Upload extracted binaries.')
