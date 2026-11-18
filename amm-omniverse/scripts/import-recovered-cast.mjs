import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import {inflateRawSync} from 'node:zlib'
import {fileURLToPath} from 'node:url'

const repoRoot=fileURLToPath(new URL('../',import.meta.url))
const zipPath=path.join(repoRoot,'assets','StreetVerse_3_Character_GLBS_Extracted.zip')
const outDir=path.join(repoRoot,'public','tryamm-assets','recovered-characters')
const expected=new Map([
 ['BJ_STUBBS_V15_MOTION_ENHANCED.glb',{size:6220868,sha:'310c56801f32760d79679242c6dee10631957ca29a42d9c8e10f4934df8a8439'}],
 ['Jacobie_Greenville_Recovered.glb',{size:7860680,sha:'f0b0ada28cf343a58668d5adfd8a42aadd12f867ae87c7a24d9b749f4370ed13'}],
 ['LaTeasia_RIGGED_DIAGNOSTIC.glb',{size:871880,sha:'96faef46205295d16cdf6c8d21a0e216438141f053cf0601800d62d3020998af'}],
])
if(!fs.existsSync(zipPath)){
 console.warn('RECOVERED_CAST_PENDING: upload assets/StreetVerse_3_Character_GLBS_Extracted.zip to include the original models. No placeholder is treated as verified.')
 process.exit(0)
}
const bytes=fs.readFileSync(zipPath)
function u16(i){return bytes.readUInt16LE(i)}
function u32(i){return bytes.readUInt32LE(i)}
let eocd=-1
for(let i=bytes.length-22;i>=Math.max(0,bytes.length-65557);i--){if(u32(i)===0x06054b50){eocd=i;break}}
const fileCount=eocd<0?0:u16(eocd+10)
if(eocd<0||fileCount<expected.size||fileCount>expected.size+1)throw Error('Recovered cast ZIP central directory missing or unexpected file count')
const entries=new Map()
let offset=u32(eocd+16)
for(let i=0;i<fileCount;i++){
 if(u32(offset)!==0x02014b50)throw Error('Invalid ZIP central directory')
 const method=u16(offset+10),compressed=u32(offset+20),original=u32(offset+24)
 const nameLength=u16(offset+28),extraLength=u16(offset+30),commentLength=u16(offset+32)
 const localOffset=u32(offset+42)
 const name=bytes.subarray(offset+46,offset+46+nameLength).toString('utf8')
 if(name==='asset-manifest.json'&&fileCount===expected.size+1){offset+=46+nameLength+extraLength+commentLength;continue}
 if(!expected.has(name)||entries.has(name))throw Error('Unexpected or repeated recovered asset name')
 if(u32(localOffset)!==0x04034b50)throw Error('Corrupt ZIP local header')
 const start=localOffset+30+u16(localOffset+26)+u16(localOffset+28)
 const compressedData=bytes.subarray(start,start+compressed)
 const raw=method===8?inflateRawSync(compressedData):method===0?compressedData:null
 const expectedAsset=expected.get(name)
 if(!raw||raw.length!==original||raw.length!==expectedAsset.size||raw.subarray(0,4).toString()!=='glTF'||crypto.createHash('sha256').update(raw).digest('hex')!==expectedAsset.sha)throw Error('Recovered model verification failed: '+name)
 entries.set(name,raw)
 offset+=46+nameLength+extraLength+commentLength
}
if(entries.size!==expected.size)throw Error('Recovered cast archive lacks required GLB files')
fs.mkdirSync(outDir,{recursive:true})
for(const [name,raw] of entries){fs.writeFileSync(path.join(outDir,name),raw);console.log('RECOVERED_CAST_VERIFIED',name,raw.length)}
