import fs from 'node:fs'

const v7=new URL('../public/tryamm-assets/meshy/characters/SV_HERO_BJ_STUBBS_V7.glb',import.meta.url)
const v6=new URL('../public/tryamm-assets/meshy/characters/SV_HERO_BJ_STUBBS_V6.glb',import.meta.url)
const manifestUrl=new URL('../public/tryamm-assets/meshy/characters/SV_HERO_BJ_STUBBS_V7.manifest.json',import.meta.url)
const must=(ok,msg)=>{if(!ok)throw new Error('BJ V7 PUBLISHED GLB CONTRACT FAIL: '+msg)}

for(const [label,url] of [['V7',v7],['V6 compatibility',v6]]){
  must(fs.existsSync(url),label+' GLB must exist after assets:prebuild')
  const bytes=fs.readFileSync(url)
  must(bytes.length>=12000,label+' GLB must contain a substantive generated model')
  must(bytes.subarray(0,4).toString('ascii')==='glTF',label+' file must have binary glTF magic')
  must(bytes.readUInt32LE(4)===2,label+' file must be GLB version 2')
}
must(fs.existsSync(manifestUrl),'BJ V7 manifest must exist')
const manifest=JSON.parse(fs.readFileSync(manifestUrl,'utf8'))
must(manifest.characterId==='bj-stubbs','manifest must bind asset to BJ Stubbs')
must(manifest.externalProviderRequired===false,'owned V7 asset must not require an external provider')
must(manifest.photoMatched===false,'owned generated V7 must not claim photo matching')
must(manifest.certifiedLikeness===false,'owned generated V7 must not claim likeness certification')
must(manifest.productionFile==='SV_HERO_BJ_STUBBS_V7.glb','manifest must identify V7 production filename')

console.log('BJ V7 PUBLISHED GLB CONTRACT PASS: real owned V7 + V6 compatibility GLBs exist and are valid GLB v2 files')
