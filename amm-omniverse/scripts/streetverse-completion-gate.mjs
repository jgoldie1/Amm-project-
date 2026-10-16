/** Reproducible asset evidence; never equates source contracts with finished artwork. */
import fs from 'node:fs/promises'
import path from 'node:path'
import {createHash} from 'node:crypto'
import {fileURLToPath} from 'node:url'

const app=fileURLToPath(new URL('../',import.meta.url))
const sha=b=>createHash('sha256').update(b).digest('hex')
const requireThat=(ok,message)=>{if(!ok)throw new Error(message)}

export function inspectGlb(bytes,{rig=false,requiredAnimations=[]}={}){
  requireThat(bytes.length>=20&&bytes.toString('ascii',0,4)==='glTF','Invalid GLB header')
  requireThat(bytes.readUInt32LE(4)===2&&bytes.readUInt32LE(8)===bytes.length,'Invalid GLB version/length')
  let json,bin,offset=12
  while(offset<bytes.length){
    requireThat(offset+8<=bytes.length,'Truncated chunk header')
    const len=bytes.readUInt32LE(offset),type=bytes.readUInt32LE(offset+4)
    requireThat(len%4===0&&offset+8+len<=bytes.length,'Invalid chunk bounds')
    if(type===0x4e4f534a){requireThat(!json,'Duplicate JSON');json=JSON.parse(bytes.subarray(offset+8,offset+8+len).toString())}
    if(type===0x004e4942)bin=bytes.subarray(offset+8,offset+8+len)
    offset+=8+len
  }
  requireThat(json?.asset?.version==='2.0'&&bin,'Missing glTF JSON/binary')
  requireThat(json.buffers?.length===1&&!json.buffers[0].uri,'Expected self-contained GLB')
  requireThat(json.buffers[0].byteLength<=bin.length,'Truncated binary buffer')
  for(const view of json.bufferViews||[])requireThat(view.buffer===0&&(view.byteOffset||0)>=0&&view.byteLength>0&&(view.byteOffset||0)+view.byteLength<=json.buffers[0].byteLength,'Invalid buffer view')
  const accessors=json.accessors||[],nodes=json.nodes||[],meshes=json.meshes||[],skins=json.skins||[]
  const accessor=i=>{requireThat(Number.isInteger(i)&&accessors[i]?.count>0,'Missing accessor');return accessors[i]}
  requireThat(meshes.length>0,'No meshes')
  let primitives=0,skinnedPrimitives=0
  for(const mesh of meshes)for(const p of mesh.primitives||[]){
    const positions=accessor(p.attributes?.POSITION);primitives++
    if(p.indices!==undefined)accessor(p.indices)
    if(p.attributes?.JOINTS_0!==undefined){
      const joints=accessor(p.attributes.JOINTS_0),weights=accessor(p.attributes.WEIGHTS_0)
      requireThat(joints.type==='VEC4'&&weights.type==='VEC4'&&joints.count===positions.count&&weights.count===positions.count,'Skin attribute mismatch')
      skinnedPrimitives++
    }
  }
  requireThat(primitives>0,'No primitives')
  for(const skin of skins){
    requireThat(skin.joints?.length>0&&skin.joints.every(i=>Number.isInteger(i)&&nodes[i]),'Invalid joint references')
    if(skin.inverseBindMatrices!==undefined)requireThat(accessor(skin.inverseBindMatrices).count===skin.joints.length,'Inverse-bind count mismatch')
  }
  const clips=json.animations||[]
  for(const clip of clips){
    requireThat(clip.channels?.length>0,'Empty animation')
    for(const channel of clip.channels){
      const sampler=clip.samplers?.[channel.sampler]
      requireThat(sampler&&nodes[channel.target?.node],'Invalid animation target/sampler')
      accessor(sampler.input);accessor(sampler.output)
    }
  }
  if(rig){
    requireThat(skins.length>0&&skinnedPrimitives>0&&nodes.some(n=>skins[n.skin]&&meshes[n.mesh]),'Hero is not bound to a skin')
    for(const name of requiredAnimations)requireThat(clips.some(c=>c.name===name),'Missing animation: '+name)
  }
  return {bytes:bytes.length,sha256:sha(bytes),meshes:meshes.length,primitives,skins:skins.length,skinnedPrimitives,animations:clips.map(c=>c.name||'(unnamed)')}
}

async function download(hero){
  const response=await fetch(hero.url,{signal:AbortSignal.timeout(60000),redirect:'error'})
  requireThat(response.ok&&response.body,'Hero download HTTP '+response.status)
  const chunks=[];let size=0
  for await(const chunk of response.body){size+=chunk.length;requireThat(size<=hero.bytes,'Hero exceeds locked size');chunks.push(Buffer.from(chunk))}
  return Buffer.concat(chunks)
}

export async function runGate({out=path.join(app,'../release-evidence/character-world'),heroFile}={}){
  await fs.mkdir(out,{recursive:true})
  const lock=JSON.parse(await fs.readFile(path.join(app,'config/streetverse-completion-assets.json'),'utf8'))
  const report={schema:1,generatedAt:new Date().toISOString(),commit:process.env.GITHUB_SHA||null,technicalStatus:'FAIL',artworkStatus:'PENDING_REVIEW',limitations:'Container, binding references and clip presence only; not a visual deformation, likeness or gameplay certification.',assets:[],errors:[],pendingReview:lock.pendingReview}
  try{
    const runtime=await fs.readFile(path.join(app,'src/runtime/StreetVerseMeshyBJHeroRuntime.ts'),'utf8')
    requireThat(runtime.includes(lock.hero.url),'Hero runtime URL differs from asset lock')
    const bytes=heroFile?await fs.readFile(heroFile):await download(lock.hero)
    requireThat(bytes.length===lock.hero.bytes&&sha(bytes)===lock.hero.sha256,'Hero checksum differs from approved preservation lock')
    const stats=inspectGlb(bytes,{rig:true,requiredAnimations:lock.hero.requiredAnimations})
    await fs.mkdir(path.join(out,'hero'),{recursive:true})
    await fs.writeFile(path.join(out,'hero',lock.hero.id+'.glb'),bytes)
    report.assets.push({id:lock.hero.id,role:'hero',...stats})
  }catch(error){report.errors.push('BJ: '+error.message)}
  const catalog=await fs.readFile(path.join(app,'src/data/TryammNativeRuntimeAssetCatalog.ts'),'utf8')
  const entries=[...catalog.matchAll(/(\w+):\{id:'([^']+)',url:'([^']+)',state:'([^']+)'/g)]
  if(entries.length===0)report.errors.push('Native asset catalog is empty or its schema changed')
  for(const [,key,id,url,state] of entries){
    try{
      requireThat(url.startsWith('/generated-assets/native/kit/')&&!url.includes('..'),'Unexpected native asset path')
      const bytes=await fs.readFile(path.join(app,'public',url)),stats=inspectGlb(bytes)
      const destination=path.join(out,'world',path.basename(url))
      await fs.mkdir(path.dirname(destination),{recursive:true});await fs.writeFile(destination,bytes)
      report.assets.push({id,key,role:'world',state,...stats})
    }catch(error){report.errors.push(id+': '+error.message)}
  }
  const known=new Set(entries.map(e=>e[1]))
  const west=await fs.readFile(path.join(app,'src/runtime/StreetVerseWestSideVisibleWorldRuntime.ts'),'utf8')
  for(const source of [catalog,west])for(const [,key] of source.matchAll(/asset:'([^']+)'/g))if(!known.has(key))report.errors.push('Unknown placement asset: '+key)
  report.technicalStatus=report.errors.length?'FAIL':'PASS'
  await fs.writeFile(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\n')
  const md=['# BJ / Circle Park / West Side asset evidence','',`Technical assets: **${report.technicalStatus}**. Artwork and physical-device play: **PENDING REVIEW**.`, '',report.limitations,'',`Packaged assets: ${report.assets.length}`, '', '## Errors',...(report.errors.length?report.errors.map(e=>'- '+e):['None.']), '', '## Remaining review',...report.pendingReview.map(e=>'- '+e),'','Checksums and clip inventory: report.json. CI artifacts expire after 90 days; this is not permanent backup.'].join('\n')
  await fs.writeFile(path.join(out,'report.md'),md+'\n')
  if(process.env.GITHUB_STEP_SUMMARY)await fs.appendFile(process.env.GITHUB_STEP_SUMMARY,md+'\n')
  console.log(md)
  return report
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const arg=name=>{const i=process.argv.indexOf(name);return i<0?undefined:process.argv[i+1]}
  try{const result=await runGate({out:arg('--out'),heroFile:arg('--hero-file')});if(result.errors.length)process.exitCode=1}
  catch(error){console.error(error);process.exitCode=1}
}
