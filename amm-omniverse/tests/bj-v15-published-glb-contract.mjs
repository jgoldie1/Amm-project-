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
must(fs.existsSync(manifestUrl),'V15 authoring manifest must exist')
const meta=JSON.parse(fs.readFileSync(manifestUrl,'utf8'))
must(meta.assetVersion==='bj-realism-v15','manifest must identify the distinct sculpt')
must(meta.photoMatched===false&&meta.certifiedLikeness===false,'procedural likeness must be labeled unverified')
must(meta.visualPass.includes('curved-locs'),'manifest must describe newly sculpted hair')
const root=new URL('../',import.meta.url)
const foundry=fs.readFileSync(new URL('scripts/tryamm-native-asset-foundry.mjs',root),'utf8')
const runtime=fs.readFileSync(new URL('src/runtime/StreetVerseMeshyBJHeroRuntime.ts',root),'utf8')
must(foundry.includes("'streetverse-bj-v15-sculpt':()=>"),'V15 must have a distinct source builder')
must(foundry.includes('bj-v15-beard-dark-merged')&&foundry.includes('bj-v15-locs-silver-merged'),'V15 must contain 3D hair/locs')
must(foundry.includes('mergeGeometries(geometries,false)'),'V15 must merge hairs to limit mobile draw calls')
must(runtime.includes("premiumFilename:'SV_HERO_BJ_STUBBS_V15.glb'"),'runtime must know premium V15 file')
must(runtime.indexOf('BJ_MESHY_V6_ASSET.premiumUrl')<runtime.indexOf('BJ_MESHY_V6_ASSET.productionUrl,'),'V15 must precede old V12 in load order')
console.log('BJ V15 DISTINCT 3D ASSET PASS: new hairstyle/face geometry, stable V12 rollback, valid manifest and truthful likeness metadata')
