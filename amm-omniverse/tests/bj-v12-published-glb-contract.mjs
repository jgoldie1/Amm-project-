import fs from 'node:fs'

const v12=new URL('../public/tryamm-assets/meshy/characters/SV_HERO_BJ_STUBBS_V12.glb',import.meta.url)
const v7=new URL('../public/tryamm-assets/meshy/characters/SV_HERO_BJ_STUBBS_V7.glb',import.meta.url)
const manifestUrl=new URL('../public/tryamm-assets/meshy/characters/SV_HERO_BJ_STUBBS_V12.manifest.json',import.meta.url)
const runtimeUrl=new URL('../src/runtime/StreetVerseMeshyBJHeroRuntime.ts',import.meta.url)
const must=(ok,msg)=>{if(!ok)throw new Error('BJ V12 PUBLISHED GLB CONTRACT FAIL: '+msg)}

for(const [label,url] of [['V12',v12],['V7 compatibility',v7]]){
  must(fs.existsSync(url),label+' GLB must exist after assets:prebuild')
  const bytes=fs.readFileSync(url)
  must(bytes.length>=12000,label+' GLB must contain a substantive generated model')
  must(bytes.subarray(0,4).toString('ascii')==='glTF',label+' file must have binary glTF magic')
  must(bytes.readUInt32LE(4)===2,label+' file must be GLB version 2')
}

must(fs.existsSync(manifestUrl),'BJ V12 manifest must exist')
const manifest=JSON.parse(fs.readFileSync(manifestUrl,'utf8'))
must(manifest.characterId==='bj-stubbs','manifest must bind V12 to BJ Stubbs')
must(manifest.productionFile==='SV_HERO_BJ_STUBBS_V12.glb','manifest must identify V12 production filename')
must(manifest.assetVersion==='bj-realism-v12','manifest must identify BJ realism V12')
must(manifest.photoMatched===false,'procedural V12 must not claim photo matching')
must(manifest.certifiedLikeness===false,'procedural V12 must not claim likeness certification')

const runtime=fs.readFileSync(runtimeUrl,'utf8')
must(runtime.includes("productionFilename:'SV_HERO_BJ_STUBBS_V12.glb'"),'runtime must prefer V12 production file')
must(runtime.includes("authority:'tryamm-owned-native-glb-v12'"),'runtime must identify V12 authority')
must(runtime.includes("texturePipeline:'pbr-mobile-production-v12'"),'runtime must keep the V12 material pipeline')

console.log('BJ V12 PUBLISHED GLB CONTRACT PASS: owned V12 exists, runtime prefers it, and likeness claims remain truthful')
