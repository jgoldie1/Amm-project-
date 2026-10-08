import fs from 'node:fs/promises'
import path from 'node:path'

const input=path.resolve(process.argv[2]||'asset-audit.json')
const outDir=path.resolve(process.argv[3]||'../release-evidence/blender-forge')
const audit=JSON.parse(await fs.readFile(input,'utf8'))

const weight={error:100,warn:25,info:3}
const codeWeight={
  'missing-uv':60,
  'missing-normals':70,
  'triangle-budget':40,
  'texture-payload':35,
  'texture-oversize':30,
  'rig-without-animation':30,
  'hero-unrigged':25,
  'no-collision-proxy':18,
  'no-xr-pivot':15,
  'no-lod':12,
  'pbr-incomplete':8,
  'texture-npot':2,
}
const scoreAsset=asset=>{
  let score=0
  for(const f of asset.findings||[])score+=(weight[f.severity]||0)+(codeWeight[f.code]||0)
  if(asset.kind==='hero')score+=20
  return score
}
const queue=(audit.assets||[])
  .map(asset=>({
    file:asset.file,
    kind:asset.kind,
    score:scoreAsset(asset),
    triangles:asset.stats?.triangles||0,
    bytes:asset.bytes||0,
    findings:(asset.findings||[]).map(f=>({severity:f.severity,code:f.code,detail:f.detail,action:f.action})),
    blenderActions:[...new Set((asset.findings||[]).map(f=>f.action).filter(Boolean))],
  }))
  .sort((a,b)=>b.score-a.score||b.triangles-a.triangles)

await fs.mkdir(outDir,{recursive:true})
await fs.writeFile(path.join(outDir,'priority-queue.json'),JSON.stringify({
  schema:'tryamm.streetverse.blender-priority.v1',
  generatedAt:new Date().toISOString(),
  sourceAudit:path.basename(input),
  totalAssets:queue.length,
  top10:queue.slice(0,10).map(x=>x.file),
  queue,
},null,2)+'\n')

const md=[
  '# StreetVerse Blender Priority Queue',
  '',
  `Generated from ${path.basename(input)}. Higher scores mean more severe/valuable repair work first.`,
  '',
  '| # | Asset | Kind | Score | Tris | Highest-priority findings |',
  '|---:|---|---|---:|---:|---|',
  ...queue.slice(0,25).map((a,i)=>{
    const findings=a.findings.slice(0,4).map(f=>f.code).join(', ')
    return `| ${i+1} | \`${a.file}\` | ${a.kind} | ${a.score} | ${a.triangles.toLocaleString()} | ${findings} |`
  }),
  '',
  'This queue is advisory. Blender must still inspect the asset visually before destructive edits.',
  '',
].join('\n')
await fs.writeFile(path.join(outDir,'priority-queue.md'),md)
console.log(`Forge priority queue: ${queue.length} assets • top: ${queue.slice(0,5).map(x=>path.basename(x.file)).join(', ')}`)
