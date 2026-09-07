import fs from 'node:fs'
import path from 'node:path'

const sourcePath=path.join(process.cwd(),'src/foundation/epicTrainingCertificationFoundation.ts')
if(!fs.existsSync(sourcePath))throw new Error('EPIC training/certification foundation is missing')
const source=fs.readFileSync(sourcePath,'utf8')

for(const token of[
  'TRYAMM EPIC Training & Certification Hub',
  'Education · Practice · Industry · Credentials',
  'analyzeEpicTrainingGaps',
  'EPIC_TRAINING_REQUIREMENTS',
  'EPIC_ROLE_PATHWAYS',
  'osha-pit-employer-evaluation',
  '29 CFR 1910.178(l)',
  'msha-part46-new-miner',
  '24 hours',
  'fda-produce-safety-training-record',
  'FSMA',
  'farm-robot-supervisor-core',
  'additive-manufacturing-operator-core',
  'creator-live-production-core',
  'accessible-service-core',
  'issuerVerified',
  'evidenceVerified',
  'practicalEvaluationRequired:true',
  'mayTryammSelfIssueGovernmentCredential(){return false as const}',
  'mayEpicTrainingUnlockHazardousEquipmentWithoutPracticalEvaluation(){return false as const}',
  'mayEpicAIInventCertificationEvidence(){return false as const}',
]){
  if(!source.includes(token))throw new Error(`EPIC training/certification contract missing: ${token}`)
}

if(!source.includes("record.kind!=='TRYAMM_COMPLETION'&&record.issuerVerified===true&&record.evidenceVerified===true")){
  throw new Error('External certification claims must remain evidence/issuer gated')
}

console.log('EPIC training/certification foundation contract: PASS')
