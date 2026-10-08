#!/usr/bin/env node
/**
 * StreetVerse read-only glTF/GLB asset audit.
 * Reports mobile/XR production risks without modifying assets.
 */
import fs from 'node:fs'
import path from 'node:path'

const BUDGET={
  tris:{hero:60000,building:25000,prop:8000},
  textureBytes:4*1024*1024,
  maxTextureDim:2048,
  totalFileBytes:12*1024*1024,
}

const argv=process.argv.slice(2)
let outFile='asset-audit.json'
const roots=[]
for(let i=0;i<argv.length;i++){
  if(argv[i]==='--out'){outFile=argv[++i];continue}
  roots.push(argv[i])
}
if(!roots.length)roots.push('public')

function walk(dir,acc=[]){
  let entries
  try{entries=fs.readdirSync(dir,{withFileTypes:true})}catch{return acc}
  for(const e of entries){
    const full=path.join(dir,e.name)
    if(e.isDirectory()){if(e.name!=='node_modules')walk(full,acc)}
    else if(/\.(glb|gltf)$/i.test(e.name))acc.push(full)
  }
  return acc
}

function readContainer(file){
  const buf=fs.readFileSync(file)
  if(!/\.glb$/i.test(file))return{json:JSON.parse(buf.toString('utf8')),bin:null,buf}
  if(buf.length<12||buf.readUInt32LE(0)!==0x46546c67)throw new Error('not a GLB container')
  let offset=12,json=null,bin=null
  while(offset+8<=buf.length){
    const len=buf.readUInt32LE(offset),type=buf.readUInt32LE(offset+4),start=offset+8,end=start+len
    if(end>buf.length)break
    if(type===0x4e4f534a)json=JSON.parse(buf.subarray(start,end).toString('utf8'))
    else if(type===0x004e4942)bin=buf.subarray(start,end)
    offset=end+(end%4?4-(end%4):0)
  }
  if(!json)throw new Error('GLB has no JSON chunk')
  return{json,bin,buf}
}

function imageSize(bytes){
  if(!bytes||bytes.length<16)return null
  if(bytes.length>=24&&bytes.readUInt32BE(0)===0x89504e47)return[bytes.readUInt32BE(16),bytes.readUInt32BE(20)]
  if(bytes.toString('ascii',0,4)==='RIFF'&&bytes.toString('ascii',8,12)==='WEBP'){
    const fourcc=bytes.toString('ascii',12,16)
    if(fourcc==='VP8X')return[1+bytes.readUIntLE(24,3),1+bytes.readUIntLE(27,3)]
    if(fourcc==='VP8 ')return[bytes.readUInt16LE(26)&0x3fff,bytes.readUInt16LE(28)&0x3fff]
    if(fourcc==='VP8L'){const b=bytes.readUInt32LE(21);return[(b&0x3fff)+1,((b>>14)&0x3fff)+1]}
  }
  if(bytes[0]===0xff&&bytes[1]===0xd8){
    let i=2
    while(i+9<bytes.length){
      if(bytes[i]!==0xff){i++;continue}
      const marker=bytes[i+1]
      if(marker>=0xc0&&marker<=0xcf&&![0xc4,0xc8,0xcc].includes(marker))return[bytes.readUInt16BE(i+7),bytes.readUInt16BE(i+5)]
      const seg=i+3<bytes.length?bytes.readUInt16BE(i+2):0
      if(!seg)break
      i+=2+seg
    }
  }
  return null
}

function classify(file){
  const n=path.basename(file).toLowerCase()
  if(/hero|bj_stubbs|character|npc|resident|astronaut|suit/.test(n))return'hero'
  if(/building|facade|block|store|house|site|station/.test(n))return'building'
  return'prop'
}

const files=[...new Set(roots.flatMap(r=>walk(r)))]
if(!files.length){
  console.error('asset audit: no .glb/.gltf files found under '+roots.join(', '))
  process.exit(1)
}

const assets=[]
let unreadable=0
for(const file of files){
  const stat=fs.statSync(file)
  const record={file,kind:classify(file),bytes:stat.size,readable:false,findings:[]}
  const add=(severity,code,detail,action)=>record.findings.push({severity,code,detail,action})
  let json,bin
  try{({json,bin}=readContainer(file))}catch(err){
    unreadable++;add('error','unreadable',String(err?.message||err).slice(0,200),'Re-export or repair the container.');assets.push(record);continue
  }
  record.readable=true
  const accessors=json.accessors||[],meshes=json.meshes||[],materials=json.materials||[],images=json.images||[],bufferViews=json.bufferViews||[],nodes=json.nodes||[]
  let tris=0,prims=0,noNormal=0,noUV=0,uvSets=0,compressedPrims=0
  for(const mesh of meshes)for(const p of mesh.primitives||[]){
    prims++
    if(p.extensions?.KHR_draco_mesh_compression||p.extensions?.EXT_meshopt_compression)compressedPrims++
    const mode=p.mode===undefined?4:p.mode
    if(mode===4){
      const acc=p.indices!==undefined?accessors[p.indices]:accessors[p.attributes?.POSITION]
      if(acc&&Number.isFinite(acc.count))tris+=Math.floor(acc.count/3)
    }
    if(!p.attributes?.NORMAL)noNormal++
    if(p.attributes?.TEXCOORD_0===undefined)noUV++
    else uvSets=Math.max(uvSets,p.attributes?.TEXCOORD_1!==undefined?2:1)
  }

  let textureBytes=0,oversize=0,npot=0,unknownDim=0
  const dims=[]
  for(const img of images){
    let bytes=null
    if(img.bufferView!==undefined&&bin){
      const bv=bufferViews[img.bufferView]
      if(bv){const start=bv.byteOffset||0;bytes=bin.subarray(start,start+bv.byteLength);textureBytes+=bv.byteLength}
    }
    const dim=imageSize(bytes)
    if(!dim){unknownDim++;continue}
    dims.push(dim.join('x'))
    const[w,h]=dim
    if(w>BUDGET.maxTextureDim||h>BUDGET.maxTextureDim)oversize++
    const pot=n=>n>0&&(n&(n-1))===0
    if(!pot(w)||!pot(h))npot++
  }

  const materialIssues=[]
  for(const m of materials){
    const pbr=m.pbrMetallicRoughness||{},missing=[]
    if(!pbr.baseColorTexture&&!pbr.baseColorFactor)missing.push('baseColor')
    if(!m.normalTexture)missing.push('normal')
    if(!pbr.metallicRoughnessTexture)missing.push('metallicRoughness')
    if(missing.length)materialIssues.push({material:m.name||'(unnamed)',missing})
  }

  const names=nodes.map(n=>n.name||'')
  const lodNodes=names.filter(n=>/(^|[_-])lod ?\d/i.test(n))
  const collisionNodes=names.filter(n=>/(ucx[_-]|collision|collider|_col\b)/i.test(n))
  const xrPivots=names.filter(n=>/(grab|pivot|socket|attach|handle)/i.test(n))

  record.stats={
    meshes:meshes.length,primitives:prims,triangles:tris,compressedPrimitives:compressedPrims,
    materials:materials.length,images:images.length,textureBytes,textureDimensions:[...new Set(dims)].slice(0,12),
    uvSets,skins:(json.skins||[]).length,animations:(json.animations||[]).length,nodes:nodes.length,
    lodNodes:lodNodes.length,collisionNodes:collisionNodes.length,xrPivots:xrPivots.length,extensionsUsed:json.extensionsUsed||[]
  }
  record.materialIssues=materialIssues

  const triBudget=BUDGET.tris[record.kind]
  if(compressedPrims&&!tris)add('info','compressed-geometry',compressedPrims+' compressed primitive(s); triangle count unavailable','Decompress once to verify the triangle budget.')
  else if(tris>triBudget)add('warn','triangle-budget',tris.toLocaleString()+' tris over '+triBudget.toLocaleString(),'Create/repair LODs or simplify in Blender without destroying silhouette.')
  if(noNormal)add('error','missing-normals',noNormal+' primitive(s) have no NORMAL','Recalculate normals in Blender and re-export.')
  if(noUV)add('error','missing-uv',noUV+' primitive(s) have no TEXCOORD_0','Create/repair UVs before textured production use.')
  if(textureBytes>BUDGET.textureBytes)add('warn','texture-payload',(textureBytes/1048576).toFixed(1)+'MB embedded texture payload','Compress/repack textures for mobile.')
  if(oversize)add('warn','texture-oversize',oversize+' texture(s) exceed '+BUDGET.maxTextureDim+'px','Downscale or author platform-specific texture variants.')
  if(npot)add('info','texture-npot',npot+' non-power-of-two texture(s)','Review mip/compression behavior; POT is not mandatory for all modern WebGL uses.')
  if(unknownDim)add('info','texture-dim-unknown',unknownDim+' image(s) external or unrecognized','Verify external/extension images separately.')
  if(stat.size>BUDGET.totalFileBytes)add('warn','file-size',(stat.size/1048576).toFixed(1)+'MB file','Use geometry/texture compression only after visual comparison.')
  if(materialIssues.length)add('info','pbr-incomplete',materialIssues.length+' material(s) lack common PBR maps','Confirm flat intent or author needed PBR maps.')
  if(!lodNodes.length)add('info','no-lod','No named LOD nodes','Add LODs where runtime profiling shows value.')
  if(!collisionNodes.length&&record.kind!=='prop')add('info','no-collision-proxy','No named collision proxy','Add simple collision where gameplay/XR needs it.')
  if((json.skins||[]).length&&!(json.animations||[]).length)add('warn','rig-without-animation','Skinned asset has no animation clips','Verify external animation workflow or export clips.')
  if(record.kind==='hero'&&!(json.skins||[]).length)add('info','hero-unrigged','Hero-class asset has no skin','Rig/weight only if the gameplay role requires animation.')
  if(!xrPivots.length)add('info','no-xr-pivot','No grab/socket/pivot node','Add a deliberate grab pivot to XR-grabbable assets.')
  assets.push(record)
}

const count=s=>assets.reduce((n,a)=>n+a.findings.filter(f=>f.severity===s).length,0)
const report={
  generatedAt:new Date().toISOString(),
  tool:'streetverse-asset-audit-v2',
  note:'Read-only container audit. It cannot validate n-gons, flipped faces, UV overlap, bone weights, visual likeness, or in-engine appearance.',
  budgets:BUDGET,roots,
  summary:{assets:assets.length,unreadable,errors:count('error'),warnings:count('warn'),info:count('info'),totalTriangles:assets.reduce((n,a)=>n+(a.stats?.triangles||0),0),totalBytes:assets.reduce((n,a)=>n+a.bytes,0)},
  assets,
}
fs.writeFileSync(outFile,JSON.stringify(report,null,2))
const s=report.summary
console.log(`asset audit: ${s.assets} assets • ${s.errors} errors • ${s.warnings} warnings • ${s.info} info • ${s.unreadable} unreadable`)
console.log(`             ${s.totalTriangles.toLocaleString()} tris • ${(s.totalBytes/1048576).toFixed(1)}MB • wrote ${outFile}`)
