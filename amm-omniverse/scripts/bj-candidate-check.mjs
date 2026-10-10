import fs from 'node:fs/promises'
import crypto from 'node:crypto'
import path from 'node:path'

const candidate=path.resolve(process.argv[2]||'')
if(!candidate)throw new Error('Usage: node scripts/bj-candidate-check.mjs <candidate.glb> [report.json]')
const reportFile=path.resolve(process.argv[3]||'../release-evidence/bj-candidate-check.json')
const nativeFile=path.resolve('public/generated-assets/native/kit/streetverse-hero-player.glb')

const sha256=buffer=>crypto.createHash('sha256').update(buffer).digest('hex')
const read=async file=>{
  const buffer=await fs.readFile(file)
  if(buffer.length<12||buffer.readUInt32LE(0)!==0x46546c67)throw new Error(path.basename(file)+' is not a valid GLB container')
  return{file,bytes:buffer.length,sha256:sha256(buffer)}
}

const candidateInfo=await read(candidate)
const nativeInfo=await read(nativeFile)
const distinct=candidateInfo.sha256!==nativeInfo.sha256
const sizeRatio=candidateInfo.bytes/Math.max(1,nativeInfo.bytes)
const higherFidelityPlausible=distinct&&sizeRatio>=.55

const report={
  schema:'tryamm.streetverse.bj-candidate-check.v1',
  generatedAt:new Date().toISOString(),
  candidate:candidateInfo,
  native:nativeInfo,
  distinctFromNative:distinct,
  sizeRatio:Number(sizeRatio.toFixed(4)),
  higherFidelityPlausible,
  promotionAllowedByThisCheck:higherFidelityPlausible,
  promotionStillRequires:'visual inspection, rig/material validation, likeness/right-to-use confirmation, mobile performance test, and explicit production promotion',
  truthBoundary:distinct
    ?'Candidate is byte-distinct from the native procedural hero; this check does not prove likeness or higher quality.'
    :'Candidate is byte-identical to the native procedural hero and must not be promoted as a new higher-fidelity BJ source.',
}
await fs.mkdir(path.dirname(reportFile),{recursive:true})
await fs.writeFile(reportFile,JSON.stringify(report,null,2)+'\n')
console.log(`BJ candidate check: distinct=${distinct} • sizeRatio=${report.sizeRatio} • promotionAllowedByThisCheck=${higherFidelityPlausible}`)
if(!higherFidelityPlausible)process.exitCode=2
