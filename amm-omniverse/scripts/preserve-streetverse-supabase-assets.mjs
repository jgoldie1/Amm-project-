/**
 * Read-only preservation of existing October 5 StreetVerse character assets.
 * Downloads from the verified public bucket; NEVER uploads, mutates or deletes source objects.
 * Usage: node amm-omniverse/scripts/preserve-streetverse-supabase-assets.mjs
 */
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import {createHash} from 'node:crypto'
import {Readable, Transform} from 'node:stream'
import {pipeline} from 'node:stream/promises'
import {createWriteStream} from 'node:fs'
import {fileURLToPath} from 'node:url'

const lockUrl=new URL('../config/streetverse-asset-lock-20261005.json',import.meta.url)
const required=[
  ['static-wave1','SV_NPC_BLACK_MAN_ADULT_01'],
  ['static-wave1','SV_NPC_BLACK_WOMAN_ADULT_01'],
  ['static-wave2','SV_NPC_BLACK_MAN_YOUNGADULT_01'],
  ['static-wave2','SV_NPC_BLACK_WOMAN_YOUNGADULT_01'],
]

export function validateLock(lock){
  if(lock?.schema!=='tryamm.streetverse.storage-preservation-lock.v1')throw new Error('Unexpected asset-lock schema')
  if(lock.projectRef!=='fxluchtdfpediivhoksl'||lock.bucket!=='streetverse-assets')throw new Error('Unexpected storage identity')
  if(lock.baseUrl!=='https://fxluchtdfpediivhoksl.supabase.co/storage/v1/object/public/streetverse-assets/')throw new Error('Unexpected storage origin')
  if(lock.assetCount!==12||!Array.isArray(lock.assets)||lock.assets.length!==12)throw new Error('Exactly twelve locked assets required')
  const seen=new Set()
  for(const asset of lock.assets){
    if(typeof asset.path!=='string'||!/^characters\/static-wave[12]\/SV_NPC_[A-Z0-9_]+(?:\.(?:walk|run))?\.glb$/.test(asset.path))throw new Error('Unsafe or unexpected asset path')
    if(!Number.isSafeInteger(asset.bytes)||asset.bytes<12000||asset.bytes>40000000)throw new Error('Invalid locked byte size')
    if(seen.has(asset.path))throw new Error('Duplicate asset')
    seen.add(asset.path)
  }
  for(const [wave,stem] of required){
    for(const suffix of ['','.walk','.run']){
      if(!seen.has('characters/'+wave+'/'+stem+suffix+'.glb'))throw new Error('Missing required character/animation pairing: '+stem+suffix)
    }
  }
  return true
}

export function validateGlbHeader(header,actualBytes,expectedBytes){
  if(!Buffer.isBuffer(header)||header.length<12)throw new Error('GLB header missing')
  if(header.toString('ascii',0,4)!=='glTF')throw new Error('Invalid GLB magic')
  if(header.readUInt32LE(4)!==2)throw new Error('Expected binary glTF version 2')
  if(header.readUInt32LE(8)!==actualBytes)throw new Error('GLB internal length mismatch')
  if(actualBytes!==expectedBytes)throw new Error('Source bytes differ from locked October 5 inventory')
  return true
}

async function copyOne(lock,asset,outDir){
  const source=new URL(asset.path,lock.baseUrl)
  const destination=path.join(outDir,asset.path)
  await fs.mkdir(path.dirname(destination),{recursive:true})
  const partial=destination+'.partial'
  let size=0
  let header=Buffer.alloc(0)
  const sha256=createHash('sha256')
  try{
    const response=await fetch(source,{headers:{Accept:'model/gltf-binary,application/octet-stream'},signal:AbortSignal.timeout(120000),redirect:'error'})
    if(!response.ok||!response.body)throw new Error('Public source download failed: HTTP '+response.status)
    if((response.headers.get('content-type')||'').toLowerCase().includes('text/html'))throw new Error('Refused HTML instead of GLB')
    const tap=new Transform({transform(chunk,_enc,cb){
      size+=chunk.length
      if(size>asset.bytes)return cb(new Error('Download exceeds locked size: '+asset.path))
      sha256.update(chunk)
      if(header.length<12)header=Buffer.concat([header,chunk.subarray(0,12-header.length)])
      cb(null,chunk)
    }})
    await pipeline(Readable.fromWeb(response.body),tap,createWriteStream(partial,{flags:'wx'}))
    validateGlbHeader(header,size,asset.bytes)
    // Hard-link prevents accidental replacement of an existing preserved file.
    await fs.link(partial,destination)
    await fs.unlink(partial)
    return {path:asset.path,bytes:size,sha256:sha256.digest('hex'),sourceUrl:source.href,verifiedGlbHeader:true}
  }catch(error){
    await fs.rm(partial,{force:true}).catch(()=>{})
    throw new Error(asset.path+': '+String(error?.message||error))
  }
}

export async function preserveAssets(outputDir){
  const lock=JSON.parse(await fs.readFile(lockUrl,'utf8'))
  validateLock(lock)
  await fs.mkdir(outputDir,{recursive:true})
  const assets=[]
  for(const asset of lock.assets){
    assets.push(await copyOne(lock,asset,outputDir))
    process.stdout.write('Preserved '+asset.path+' ('+asset.bytes+' bytes)\n')
  }
  const manifest={
    schema:'tryamm.streetverse.verified-asset-preservation.v1',
    generatedAt:new Date().toISOString(),
    sourceBucket:lock.bucket,
    assetCount:assets.length,
    totalBytes:assets.reduce((sum,a)=>sum+a.bytes,0),
    sourceObjectsUnchanged:true,
    note:'Backup checks only GLB container validity, size and SHA-256; not likeness, rig quality or in-game rendering.',
    assets,
  }
  await fs.copyFile(lockUrl,path.join(outputDir,'asset-lock.json'))
  await fs.writeFile(path.join(outputDir,'verified-sha256-manifest.json'),JSON.stringify(manifest,null,2)+'\n',{flag:'wx'})
  return manifest
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const dest=process.env.STREETVERSE_PRESERVATION_DIR||path.join(os.tmpdir(),'streetverse-backup-'+Date.now())
  preserveAssets(dest).then(result=>console.log('VERIFIED STREETVERSE SNAPSHOT: '+result.assetCount+' files, '+result.totalBytes+' bytes at '+dest)).catch(error=>{console.error('PRESERVATION FAILED — source files untouched:',error);process.exitCode=1})
}
