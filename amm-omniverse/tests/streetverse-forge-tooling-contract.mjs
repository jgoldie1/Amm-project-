import fs from 'node:fs'

const setup=fs.readFileSync(new URL('../scripts/streetverse-forge-setup.sh',import.meta.url),'utf8')
const audit=fs.readFileSync(new URL('../scripts/streetverse-asset-audit.mjs',import.meta.url),'utf8')
const pkg=JSON.parse(fs.readFileSync(new URL('../package.json',import.meta.url),'utf8'))
const must=(ok,msg)=>{if(!ok)throw new Error('STREETVERSE FORGE TOOLING CONTRACT FAIL: '+msg)}

for(const token of [
  'http://127.0.0.1:8000/mcp',
  'Unreal MCP',
  'All Toolsets',
  'BLENDER_MCP_CMD',
  'https://www.blender.org/lab/mcp-server/',
  'Unity-Technologies/unity-agent-plugin',
  'streetverse-camera-v10-safety-contract.mjs',
  'streetverse-mobile-v11-clear-view-contract.mjs',
  'streetverse-xr-reach-v1-contract.mjs',
  'dangerously-skip-permissions',
  'working tree is dirty',
  'Nothing was merged or deployed.',
])must(setup.includes(token),'setup missing '+token)

must(!setup.includes('there is no Epic-official Unreal MCP'),'stale Unreal MCP claim must not return')
must(!setup.includes('there is no Blender Foundation MCP server'),'stale Blender MCP claim must not return')
must(!setup.includes('mcp-for-blender'),'community MCP package must not be silently substituted for Blender Lab MCP')

for(const token of [
  'read-only',
  'streetverse-asset-audit-v2',
  'compressedPrimitives',
  'missing-normals',
  'missing-uv',
  'triangle-budget',
  'texture-payload',
  'no-collision-proxy',
  'no-xr-pivot',
  'rig-without-animation',
  'It cannot validate n-gons, flipped faces, UV overlap, bone weights, visual likeness, or in-engine appearance.',
])must(audit.includes(token),'audit missing '+token)

must(pkg.scripts?.['asset:audit']==='node scripts/streetverse-asset-audit.mjs --out asset-audit.json public ../public','asset:audit script mismatch')
must(pkg.scripts?.['forge:setup']==='bash scripts/streetverse-forge-setup.sh','forge:setup script mismatch')
must(pkg.scripts?.['forge:check']==='node tests/streetverse-forge-tooling-contract.mjs','forge:check script mismatch')

console.log('STREETVERSE FORGE TOOLING CONTRACT PASS: official Unreal/Blender/Unity truth + safe Claude guardrails + read-only GLB audit')
