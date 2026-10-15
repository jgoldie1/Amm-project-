/**
 * Read-only audit of the real BJ V15 animated GLB.
 * Do not copy source photographs, provider tokens, or face-texture files into
 * GitHub artifacts. Only a high-level QA report is uploaded.
 * This is NOT a likeness certification or Meshy/Higgsfield generation.
 */
import fs from 'node:fs/promises'
import path from 'node:path'
const out=path.resolve(process.argv[2]||'../release-evidence/streetverse-night/bj-v15-qa.json')
const source=process.env.STREETVERSE_BJ_V15_URL||
 'https://d2ol7oe51mr4n9.cloudfront.net/user_3HqgexuZuGoTDUJ2Hxg2e6x5Hzm/daa5234c-5fbf-4b52-9c45-e82e36156153.glb'
const controller=new AbortController()
const timer=setTimeout(()=>controller.abort(),20_000)
let report={schema:'tryamm.bj.v15.night-audit.v1',validatedAt:new Date().toISOString(),fileReadable:false,rigged:false,animated:false,photoAccurateCertified:false,renderedGTAQualityCertified:false,sourceType:'hosted-supplied-existing-model',sourceBytes:0,errors:[]}
try{
  const response=await fetch(source,{signal:controller.signal})
  if(!response.ok)throw Error('BJ source GET HTTP '+response.status)
  const buf=Buffer.from(await response.arrayBuffer())
  if(buf.byteLength>15_000_000||buf.byteLength<10_000)throw Error('BJ GLB outside download safety budget')
  if(buf.toString('ascii',0,4)!=='glTF'||buf.readUInt32LE(4)!==2)throw Error('Invalid glTF binary format')
  const jsonChunkSize=buf.readUInt32LE(12)
  const gltf=JSON.parse(buf.subarray(20,20+jsonChunkSize).toString('utf8'))
  const skins=gltf.skins||[],animations=gltf.animations||[],meshes=gltf.meshes||[],nodes=gltf.nodes||[]
  const morphNames=new Set(meshes.flatMap(mesh=>mesh.extras?.targetNames||[]))
  const skinned=nodes.filter(n=>n.skin!==undefined)
  const clips=animations.map(a=>a.name||'unnamed')
  const rigged=skins.some(s=>(s.joints||[]).length>=15)&&skinned.length>0
  const animated=clips.length>=4&&clips.some(n=>/Idle/i.test(n))&&clips.some(n=>/Walk/i.test(n))
  const faceAnimated=morphNames.has('jawOpen')&&morphNames.has('eyeBlinkLeft')
  report={...report,fileReadable:true,rigged,animated,faceAnimated,
    skinCount:skins.length,skinnedNodeCount:skinned.length,clipCount:clips.length,
    faceMorphCount:morphNames.size,meshCount:meshes.length,
    zeroScaleVisuals:nodes.filter(n=>n.mesh!==undefined&&Array.isArray(n.scale)&&n.scale.every(v=>v===0)).length,
    sourceBytes:buf.length,errors:[]}
  if(!rigged||!animated||!faceAnimated)report.errors.push('Missing skeletal, motion or facial runtime requirements')
  console.log('BJ V15 RUNTIME ASSET AUDIT',JSON.stringify(report))
}catch(e){report.errors.push(String(e.message||e));console.error('BJ V15 asset audit failed:',report.errors[0])}
finally{
  clearTimeout(timer)
  await fs.mkdir(path.dirname(out),{recursive:true})
  await fs.writeFile(out,JSON.stringify(report,null,2)+'\n')
}
if(report.errors.length)process.exitCode=1
