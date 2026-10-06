import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'

const root=process.cwd()
const source=path.join(root,'public/generated-assets/native/kit/streetverse-hero-player.glb')
const outDir=path.join(root,'public/tryamm-assets/meshy/characters')
const v7=path.join(outDir,'SV_HERO_BJ_STUBBS_V7.glb')
const v6=path.join(outDir,'SV_HERO_BJ_STUBBS_V6.glb')
const manifestPath=path.join(outDir,'SV_HERO_BJ_STUBBS_V7.manifest.json')

if(!fs.existsSync(source))throw new Error('BJ V7 publish failed: native StreetVerse hero GLB was not generated')
const bytes=fs.readFileSync(source)
if(bytes.length<12000)throw new Error('BJ V7 publish failed: generated hero GLB is unexpectedly small')
if(bytes.subarray(0,4).toString('ascii')!=='glTF')throw new Error('BJ V7 publish failed: source is not a binary glTF/GLB')
if(bytes.readUInt32LE(4)!==2)throw new Error('BJ V7 publish failed: expected GLB version 2')

fs.mkdirSync(outDir,{recursive:true})
fs.writeFileSync(v7,bytes)
fs.writeFileSync(v6,bytes)

const sha256=crypto.createHash('sha256').update(bytes).digest('hex')
const manifest={
  schema:'tryamm.bj-stubbs-owned-glb.v7',
  characterId:'bj-stubbs',
  displayName:'BJ Stubbs',
  generatedAt:new Date().toISOString(),
  source:'public/generated-assets/native/kit/streetverse-hero-player.glb',
  productionFile:'SV_HERO_BJ_STUBBS_V7.glb',
  compatibilityFile:'SV_HERO_BJ_STUBBS_V6.glb',
  bytes:bytes.length,
  sha256,
  glbVersion:2,
  generator:'tryamm-native-asset-foundry',
  externalProviderRequired:false,
  photoMatched:false,
  certifiedLikeness:false,
  identityContinuity:'current-era-reference-locked',
  lifeLayer:'StreetVerse BJ V7 runtime',
  truth:'Owned TRYAMM procedural BJ production GLB. This is a real GLB fallback/production asset, not a Meshy-generated or certified photo likeness.',
}
fs.writeFileSync(manifestPath,JSON.stringify(manifest,null,2))
console.log(JSON.stringify({published:true,v7:path.relative(root,v7),v6:path.relative(root,v6),bytes:bytes.length,sha256},null,2))
