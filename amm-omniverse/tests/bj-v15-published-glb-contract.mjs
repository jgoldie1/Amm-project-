import fs from 'node:fs'
import crypto from 'node:crypto'
const base=new URL('../public/tryamm-assets/meshy/characters/',import.meta.url)
const must=(ok,msg)=>{if(!ok)throw new Error('BJ V15 GLB CONTRACT FAIL: '+msg)}
const newer=new URL('SV_HERO_BJ_STUBBS_V15.glb',base)
const previous=new URL('SV_HERO_BJ_STUBBS_V12.glb',base)
const manifestUrl=new URL('SV_HERO_BJ_STUBBS_V15.manifest.json',base)
for(const [name,file] of [['V15',newer],['V12',previous]]){
 must(fs.existsSync(file),name+' GLB must be present after native assets prebuild')
 const b=fs.readFileSync(file)
 must(b.length>=12000,name+' must contain substantive geometry')
 must(b.subarray(0,4).toString('ascii')==='glTF'&&b.readUInt32LE(4)===2,name+' must be a binary glTF 2.0 file')
}
const hash=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')
must(hash(newer)!==hash(previous),'V15 geometry must be distinct, not a V12 copy')
const readGltfJson=(file)=>{
 const buf=fs.readFileSync(file)
 let offset=12
 while(offset+8<=buf.length){
  const length=buf.readUInt32LE(offset),kind=buf.readUInt32LE(offset+4)
  must(length>=0&&offset+8+length<=buf.length,'GLB chunks must be in bounds')
  if(kind===0x4e4f534a)return JSON.parse(buf.toString('utf8',offset+8,offset+8+length).trim())
  offset+=length+8
 }
 throw new Error('V15 GLB JSON chunk missing')
}
const gltf=readGltfJson(newer)
const nodes=new Set((gltf.nodes||[]).map(n=>n.name))
for(const name of ['rig-head','bj-v15-beard-dark-merged','bj-v15-beard-silver-merged','bj-v15-locs-dark-merged','bj-v15-locs-silver-merged']){
 must(nodes.has(name),'V15 exported GLB is missing real node '+name)
}
const triangles=(gltf.meshes||[]).reduce((total,mesh)=>total+(mesh.primitives||[]).reduce((sum,primitive)=>{
 if((primitive.mode??4)!==4)return sum
 const accessorIndex=primitive.indices??primitive.attributes?.POSITION
 return sum+(accessorIndex===undefined?0:(gltf.accessors?.[accessorIndex]?.count||0)/3)
},0),0)
must(triangles>0&&triangles<160000,'V15 model must stay within mobile triangle safety budget')
must(fs.statSync(newer).size<12*1024*1024,'V15 GLB file should stay under 12 MB for legacy iPhone')
console.log('BJ V15 3D ACTUAL EXPORT',JSON.stringify({nodes:nodes.size,meshes:gltf.meshes?.length||0,triangles:Math.round(triangles),bytes:fs.statSync(newer).size}))

must(fs.existsSync(manifestUrl),'V15 authoring manifest must exist')
const meta=JSON.parse(fs.readFileSync(manifestUrl,'utf8'))
must(meta.assetVersion==='bj-realism-v15','manifest must identify the distinct sculpt')
must(meta.photoMatched===false&&meta.certifiedLikeness===false,'procedural likeness must be labeled unverified')
must(meta.visualPass.includes('curved-locs'),'manifest must describe newly sculpted hair')
must(meta.sha256===hash(newer),'V15 published file must match its signed manifest digest')
const root=new URL('../',import.meta.url)
const foundry=fs.readFileSync(new URL('scripts/tryamm-native-asset-foundry.mjs',root),'utf8')
const runtime=fs.readFileSync(new URL('src/runtime/StreetVerseMeshyBJHeroRuntime.ts',root),'utf8')
must(foundry.includes("'streetverse-bj-v15-sculpt':()=>"),'V15 must have a distinct source builder')
must(foundry.includes('bj-v15-beard-dark-merged')&&foundry.includes('bj-v15-locs-silver-merged'),'V15 must contain 3D hair/locs')
must(foundry.includes('mergeGeometries(geometries,false)'),'V15 must merge hairs to limit mobile draw calls')
must(runtime.includes("premiumFilename:'SV_HERO_BJ_STUBBS_V15.glb'"),'runtime must know premium V15 file')
must(runtime.includes("const candidateUrls=[BJ_MESHY_V6_ASSET.premiumUrl,published?.url,BJ_MESHY_V6_ASSET.productionUrl"),'V15 must take precedence over cached/published V12 assets')
must(runtime.includes("modelVersion:loadedModelVersion"),'Hero loader must identify the actual asset')
console.log('BJ V15 DISTINCT 3D ASSET PASS: new hairstyle/face geometry, stable V12 rollback, valid manifest and truthful likeness metadata')
