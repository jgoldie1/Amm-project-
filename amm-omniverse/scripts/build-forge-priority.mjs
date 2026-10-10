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

const runtimePriority=file=>{
  const n=String(file||'').toLowerCase()
  let relevance=0,lane='other'
  if(/bj_stubbs|bj-stubbs|sv_hero_bj|streetverse-hero-player/.test(n)){relevance=260;lane='bj-hero'}
  else if(/resident-archetype|character|npc|hero/.test(n)){relevance=190;lane='streetverse-character'}
  else if(/streetverse|circle|roosevelt|taylor|pilsen|west.?side|chicago|uic|ignatius|holy.?family/.test(n)){relevance=180;lane='chicago-world'}
  else if(/vehicle|car|truck|motorcycle|bus|van|bike/.test(n)){relevance=145;lane='streetverse-vehicle'}
  else if(/tree|vegetation|bench|hydrant|lamp|sign|bin|dumpster|shelter/.test(n)){relevance=125;lane='street-furniture'}
  else if(/xr|holo|grab|mission|creator|reel/.test(n)){relevance=115;lane='xr-interaction'}
  else if(/generated-assets\/native\/kit/.test(n)){relevance=105;lane='native-kit'}
  else if(/space|apollo|vesta|sls|asteroid|shuttle|saturn|mars|moon/.test(n)){relevance=-80;lane='non-core-space'}
  return{relevance,lane}
}

const scoreAsset=asset=>{
  let repairSeverity=0
  for(const f of asset.findings||[])repairSeverity+=(weight[f.severity]||0)+(codeWeight[f.code]||0)
  if(asset.kind==='hero')repairSeverity+=20
  const {relevance,lane}=runtimePriority(asset.file)
  return{repairSeverity,relevance,lane,score:repairSeverity+relevance}
}

const queue=(audit.assets||[])
  .map(asset=>{
    const scored=scoreAsset(asset)
    return{
      file:asset.file,
      kind:asset.kind,
      lane:scored.lane,
      relevance:scored.relevance,
      repairSeverity:scored.repairSeverity,
      score:scored.score,
      triangles:asset.stats?.triangles||0,
      bytes:asset.bytes||0,
      findings:(asset.findings||[]).map(f=>({severity:f.severity,code:f.code,detail:f.detail,action:f.action})),
      blenderActions:[...new Set((asset.findings||[]).map(f=>f.action).filter(Boolean))],
    }
  })
  .sort((a,b)=>b.score-a.score||b.relevance-a.relevance||b.repairSeverity-a.repairSeverity||b.triangles-a.triangles)

const productionQueue=queue.filter(a=>a.relevance>0)
const bjQueue=queue.filter(a=>a.lane==='bj-hero')
const chicagoQueue=queue.filter(a=>['chicago-world','street-furniture','streetverse-vehicle','streetverse-character'].includes(a.lane))
const xrQueue=queue.filter(a=>['xr-interaction','streetverse-vehicle','street-furniture'].includes(a.lane))

await fs.mkdir(outDir,{recursive:true})
await fs.writeFile(path.join(outDir,'priority-queue.json'),JSON.stringify({
  schema:'tryamm.streetverse.blender-priority.v2',
  generatedAt:new Date().toISOString(),
  sourceAudit:path.basename(input),
  policy:'production-relevance-plus-repair-severity',
  totalAssets:queue.length,
  productionAssets:productionQueue.length,
  top10:queue.slice(0,10).map(x=>x.file),
  topBJ:bjQueue.slice(0,10).map(x=>x.file),
  topChicago:chicagoQueue.slice(0,15).map(x=>x.file),
  topXR:xrQueue.slice(0,15).map(x=>x.file),
  queue,
},null,2)+'\n')

const md=[
  '# StreetVerse Blender Priority Queue',
  '',
  `Generated from ${path.basename(input)}. V2 ranks **production relevance + repair severity**, so BJ/Chicago/XR assets are repaired before unrelated space-library assets.`,
  '',
  '| # | Asset | Lane | Score | Relevance | Repair | Tris | Highest-priority findings |',
  '|---:|---|---|---:|---:|---:|---:|---|',
  ...queue.slice(0,30).map((a,i)=>{
    const findings=a.findings.slice(0,4).map(f=>f.code).join(', ')
    return `| ${i+1} | \`${a.file}\` | ${a.lane} | ${a.score} | ${a.relevance} | ${a.repairSeverity} | ${a.triangles.toLocaleString()} | ${findings} |`
  }),
  '',
  '## BJ first',
  ...bjQueue.slice(0,8).map((a,i)=>`${i+1}. \`${a.file}\` — score ${a.score}; ${a.findings.slice(0,5).map(f=>f.code).join(', ')}`),
  '',
  '## Chicago / StreetVerse next',
  ...chicagoQueue.slice(0,12).map((a,i)=>`${i+1}. \`${a.file}\` — ${a.lane}; score ${a.score}`),
  '',
  'This queue is advisory. Blender must still inspect each asset visually before destructive edits.',
  '',
].join('\n')
await fs.writeFile(path.join(outDir,'priority-queue.md'),md)
console.log(`Forge priority V2: ${queue.length} assets • top: ${queue.slice(0,5).map(x=>path.basename(x.file)).join(', ')}`)
