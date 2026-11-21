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
must(manifest.rigged===true&&manifest.jointCount===17,'V12 standby must now have an explicit original humanoid rig')
must(manifest.generator==='tryamm-original-skeletal-fallback','V12 generator provenance must identify original rigged fallback')
must(manifest.clipNames.includes('BJ_Walk_Cycle'),'V12 standby must include real named walking animation')
const v12Bytes=fs.readFileSync(v12)
const jsonLength=v12Bytes.readUInt32LE(12)
const gltf=JSON.parse(v12Bytes.toString('utf8',20,20+jsonLength))
must(Array.isArray(gltf.skins)&&gltf.skins.some(s=>s.joints?.length>=17),'V12 must contain a 17+ joint glTF skin')
must(gltf.meshes?.some(mesh=>mesh.primitives?.some(p=>p.attributes?.JOINTS_0!==undefined&&p.attributes?.WEIGHTS_0!==undefined)),'V12 must have real skinned mesh weight attributes')
must(gltf.animations?.some(a=>/walk/i.test(a.name)&&a.channels?.length>0),'V12 must have walking animation channels')

const runtime=fs.readFileSync(runtimeUrl,'utf8')
must(runtime.includes("productionFilename:'SV_HERO_BJ_STUBBS_V12.glb'"),'runtime must prefer V12 production file')
must(runtime.includes("authority:'tryamm-owned-native-glb-v12'"),'runtime must identify V12 authority')
must(runtime.includes("texturePipeline:'pbr-mobile-production-v12'"),'runtime must keep the V12 material pipeline')

console.log('BJ V12 PUBLISHED GLB CONTRACT PASS: original rigged standby V12 has real skin/animations; owner V15 remains separate, likeness not certified')
