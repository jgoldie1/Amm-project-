/**
 * Rebuild the approved BJ articulated development GLB from the in-repository
 * offline Chromebook demo. No network, API key, paid asset or git-binary write.
 * The original is a six-clip prototype, NOT verified V15 face-likeness.
 */
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'

const root = process.cwd()
const source = path.join(root,'public/chromebook-streetverse-bj-v5-animated.html')
const destination = path.join(root,'public/tryamm-assets/meshy/characters/BJ_Articulated_Animated_v3_PROTOTYPE.glb')
const EXPECTED_SHA256 = 'cd8db37f912e7ddbeeb6a672d524249154680aa1c00eca16b0f010f8fcfbc788'
const EXPECTED_CLIPS = ['BJ_Idle_Breathing','BJ_Walk_Cycle','BJ_Seated_Driving_Pose','BJ_Talking_Gesture','BJ_Nod_Yes','BJ_Dance_Step']

if (!fs.existsSync(source)) throw new Error('BJ extraction stopped: owned v5 source HTML missing')
const html = fs.readFileSync(source,'utf8')
const match = html.match(/const BJ_ARTICULATED_V3_BASE64='([A-Za-z0-9+/=]+)'/)
if (!match) throw new Error('BJ extraction stopped: verified embedded GLB not found')
const bytes = Buffer.from(match[1],'base64')
const sha256 = crypto.createHash('sha256').update(bytes).digest('hex')
if (sha256 !== EXPECTED_SHA256 || bytes.length !== 216360) throw new Error('BJ extraction stopped: integrity mismatch')
if (bytes.toString('utf8',0,4) !== 'glTF' || bytes.readUInt32LE(4)!==2 || bytes.readUInt32LE(8)!==bytes.length) throw new Error('BJ extraction stopped: invalid binary glTF header')
const jsonChunkSize = bytes.readUInt32LE(12)
if (bytes.readUInt32LE(16)!==0x4e4f534a || jsonChunkSize<100 || jsonChunkSize>bytes.length-20) throw new Error('BJ extraction stopped: invalid glTF JSON chunk')
const doc = JSON.parse(bytes.subarray(20,20+jsonChunkSize).toString('utf8').trim())
const clips = (doc.animations||[]).map(x=>x.name)
if (doc.asset?.version!=='2.0' || (doc.meshes||[]).length!==126 || (doc.nodes||[]).length!==139 || EXPECTED_CLIPS.some(x=>!clips.includes(x))) throw new Error('BJ extraction stopped: prototype mesh/clip inventory mismatch')
// Preserve the real GLB; never overwrite the separately named V6/V7/V12/V15 artifacts.
fs.mkdirSync(path.dirname(destination),{recursive:true})
fs.writeFileSync(destination,bytes)
const manifest={schema:'tryamm.bj-articulated-prototype.v3',characterId:'bj-stubbs',filename:path.basename(destination),source:'in-repository-bj-v5-embedded-glb',ownedByUser:true,artisticDevelopmentPrototype:true,certifiedPhotoLikeness:false,meshCount:doc.meshes.length,nodeCount:doc.nodes.length,animationNames:clips,sha256,bytes:bytes.length,license:'TRYAMM user-owned original',release:'preview-only'}
fs.writeFileSync(destination+'.manifest.json',JSON.stringify(manifest,null,2)+'\n')
console.log(JSON.stringify({extracted:true,asset:path.relative(root,destination),sha256,bytes:bytes.length,meshCount:doc.meshes.length,clips},null,2))