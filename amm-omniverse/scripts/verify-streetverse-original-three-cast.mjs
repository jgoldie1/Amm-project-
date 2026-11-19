import {readFileSync,existsSync} from 'node:fs'
import {createHash} from 'node:crypto'
import {resolve,dirname,join} from 'node:path'
import {fileURLToPath} from 'node:url'

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..')
const manifest=JSON.parse(readFileSync(join(root,'config','streetverse-original-three-cast-manifest.json'),'utf8'))
let failed=0
for(const asset of manifest.models){
 const file=join(root,manifest.basePath,asset.filename)
 if(!existsSync(file)){console.error('MISSING',asset.id,file);failed++;continue}
 const bytes=readFileSync(file)
 const magic=bytes.toString('ascii',0,4)
 const version=bytes.readUInt32LE(4)
 const hash=createHash('sha256').update(bytes).digest('hex')
 if(magic!=='glTF'||version!==2||hash!==asset.sha256||bytes.length!==asset.sizeBytes){
  console.error('INVALID',asset.id,{magic,version,bytes:bytes.length,sha256:hash});failed++
 }else console.log('VERIFIED',asset.id,asset.filename,bytes.length)
}
if(failed){console.error('StreetVerse original character installation NOT COMPLETE:',failed,'missing or invalid GLBs');process.exitCode=1}
else console.log('PASS: All 3 original cast GLBs match Library recovery SHA-256')
