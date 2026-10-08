import fs from 'node:fs/promises'
import path from 'node:path'
import crypto from 'node:crypto'

const root=path.resolve(process.cwd())
const outFile=path.resolve(process.argv[2]||'../release-evidence/bj-source-truth.json')
const candidates={
  productionV12:'public/tryamm-assets/meshy/characters/SV_HERO_BJ_STUBBS_V12.glb',
  productionV7:'public/tryamm-assets/meshy/characters/SV_HERO_BJ_STUBBS_V7.glb',
  compatibilityV6:'public/tryamm-assets/meshy/characters/SV_HERO_BJ_STUBBS_V6.glb',
  nativeHero:'public/generated-assets/native/kit/streetverse-hero-player.glb',
}
const rows={}
for(const [key,rel] of Object.entries(candidates)){
  const file=path.join(root,rel)
  try{
    const bytes=await fs.readFile(file)
    rows[key]={file:rel,exists:true,bytes:bytes.length,sha256:crypto.createHash('sha256').update(bytes).digest('hex')}
  }catch{
    rows[key]={file:rel,exists:false,bytes:0,sha256:null}
  }
}
const equal=(a,b)=>Boolean(rows[a]?.sha256&&rows[a].sha256===rows[b]?.sha256)
let publishManifest=null
try{publishManifest=JSON.parse(await fs.readFile(path.join(root,'public/tryamm-assets/meshy/characters/SV_HERO_BJ_STUBBS_V12.manifest.json'),'utf8'))}catch{}
const report={
  schema:'tryamm.streetverse.bj-source-truth.v1',
  generatedAt:new Date().toISOString(),
  files:rows,
  comparisons:{
    v12EqualsNative:equal('productionV12','nativeHero'),
    v12EqualsV7:equal('productionV12','productionV7'),
    v12EqualsV6:equal('productionV12','compatibilityV6'),
  },
  publishManifestTruth:publishManifest?.truth||null,
  publishManifestGenerator:publishManifest?.generator||null,
}
report.productionDistinctFromNative=rows.productionV12.exists&&rows.nativeHero.exists&&!report.comparisons.v12EqualsNative
report.higherFidelitySourceRequired=!report.productionDistinctFromNative
report.truthBoundary=report.higherFidelitySourceRequired
  ? 'Current production V12 is not proven distinct from the native procedural hero; do not claim a new higher-fidelity BJ source mesh.'
  : 'Production V12 is byte-distinct from the native hero; visual/likeness quality still requires separate inspection.'

await fs.mkdir(path.dirname(outFile),{recursive:true})
await fs.writeFile(outFile,JSON.stringify(report,null,2)+'\n')
console.log(`BJ source truth: V12 distinct from native = ${report.productionDistinctFromNative}`)
