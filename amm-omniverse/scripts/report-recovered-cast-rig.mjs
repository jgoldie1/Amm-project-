// Diagnostic-only rig auditor. Never equate mesh counts or clip counts with rig quality.
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
const dir=path.resolve('public/tryamm-assets/recovered-characters')
const definitions=[
 {id:'BJ Stubbs V15',file:'BJ_STUBBS_V15_MOTION_ENHANCED.glb',expectedJoints:17,expectedClips:9,faceMorphs:20},
 {id:'Jacobie Stubbs',file:'Jacobie_Greenville_Recovered.glb',expectedJoints:24,expectedClips:12,faceMorphs:0},
 {id:'LaTeasia Monroe (diagnostic)',file:'LaTeasia_RIGGED_DIAGNOSTIC.glb',expectedJoints:9,expectedClips:7,faceMorphs:0},
]
const report=[]
for(const asset of definitions){
 const filename=path.join(dir,asset.file)
 if(!fs.existsSync(filename)){report.push({...asset,loaded:false,readyForPremiumRig:false,reason:'GLB absent from build'});continue}
 const b=fs.readFileSync(filename)
 if(b.length<24||b.toString('utf8',0,4)!=='glTF'||b.readUInt32LE(4)!==2||b.readUInt32LE(8)!==b.length)throw Error('Invalid GLB header: '+asset.file)
 const jsonLength=b.readUInt32LE(12),jsonType=b.readUInt32LE(16)
 if(jsonType!==0x4e4f534a)throw Error('Missing GLB JSON chunk: '+asset.file)
 const gltf=JSON.parse(b.subarray(20,20+jsonLength).toString('utf8'))
 const joints=(gltf.skins||[]).map(s=>s.joints?.length||0)
 const morphTargets=(gltf.meshes||[]).flatMap(m=>(m.primitives||[]).map(p=>p.targets?.length||0))
 const item={
  id:asset.id,file:asset.file,loaded:true,bytes:b.length,sha256:crypto.createHash('sha256').update(b).digest('hex'),
  joints:Math.max(0,...joints),animations:gltf.animations?.length||0,
  images:gltf.images?.length||0,morphTargets:Math.max(0,...morphTargets),
  bodyRigTarget:'65–100 joints plus validated skin weights, finger and twist chains',
  facialTarget:'40–60 controls or equivalent joint/blendshape rig',
  readyForPremiumRig:false,
 }
 item.readyForPremiumRig=item.joints>=65&&item.animations>=30&&item.images>0&&item.morphTargets>=40
 report.push(item)
}
console.log(JSON.stringify({source:'user-owned recovered cast',gta6VerifiedSkeletonReference:false,models:report},null,2))
if(process.argv.includes('--strict')&&report.some(r=>!r.readyForPremiumRig))process.exitCode=1
