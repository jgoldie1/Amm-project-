export type EpicTrainingDomain='WAREHOUSE'|'FARMING'|'FARM_ROBOTICS'|'IMPORT_EXPORT'|'MINING'|'ADDITIVE_MANUFACTURING'|'SUPPLIER_SOURCING'|'STREAMING_CREATOR'|'ACCESSIBILITY'|'STREETVERSE_TECH'
export type EpicCredentialKind='TRYAMM_COMPLETION'|'SKILL_ASSESSMENT'|'EMPLOYER_EVALUATION'|'EXTERNAL_CERTIFICATION_EVIDENCE'|'LICENSE_EVIDENCE'
export type EpicCredentialStatus='ACTIVE'|'EXPIRED'|'PENDING_VERIFICATION'|'REVOKED'
export type EpicDeliveryMode='SELF_PACED'|'LIVE_INSTRUCTOR'|'STREETVERSE_SIMULATION'|'PRACTICAL'|'BLENDED'

export interface EpicTrainingRequirement{
  id:string
  domain:EpicTrainingDomain
  title:string
  credentialKind:EpicCredentialKind
  deliveryModes:EpicDeliveryMode[]
  practicalEvaluationRequired:boolean
  renewalMonths?:number
  reference?:string
  claimBoundary:string
}

export interface EpicCredentialRecord{
  credentialId:string
  learnerToken:string
  requirementId:string
  kind:EpicCredentialKind
  status:EpicCredentialStatus
  issuerName:string
  issuerVerified:boolean
  evidenceVerified:boolean
  issuedAt:string
  expiresAt?:string
  evidenceIds:string[]
}

export interface EpicRolePathway{
  id:string
  title:string
  domains:EpicTrainingDomain[]
  requiredRequirementIds:string[]
  optionalRequirementIds:string[]
}

export const TRYAMM_EPIC_TRAINING={
  brandName:'TRYAMM EPIC Training & Certification Hub',
  epicMeaning:'Education · Practice · Industry · Credentials',
  learningLoop:['learn','practice','simulate','practical evaluation','verify evidence','issue appropriate credential','renew/re-evaluate'],
  appSurfaces:['skills passport','role pathway','AI tutor','LIVE instructor room','StreetVerse simulation lab','practical-evaluation checklist','credential wallet','renewal dashboard','employer verification view'],
  accessibility:['captions','translation','screen-reader structure','voice navigation','large controls','reduced-motion training mode','low-bandwidth lessons'],
  aiBoundary:'AI may teach, quiz, translate, coach and analyze training gaps; it may not invent regulatory certification, license status or practical-evaluation evidence.',
  claimBoundary:'TRYAMM completion badges are platform learning records. External certifications, employer evaluations and government licenses must remain attributed to their real issuer and supported by verification evidence.',
} as const

export const EPIC_TRAINING_REQUIREMENTS:EpicTrainingRequirement[]=[
  {id:'tryamm-supplier-sourcing-core',domain:'SUPPLIER_SOURCING',title:'Supplier Discovery, RFQ and Golden Order Fundamentals',credentialKind:'TRYAMM_COMPLETION',deliveryModes:['SELF_PACED','LIVE_INSTRUCTOR','STREETVERSE_SIMULATION'],practicalEvaluationRequired:false,claimBoundary:'TRYAMM course completion only; not a customs broker or trade-compliance license.'},
  {id:'tryamm-import-export-core',domain:'IMPORT_EXPORT',title:'Import/Export Workflow and Trade Evidence Fundamentals',credentialKind:'TRYAMM_COMPLETION',deliveryModes:['SELF_PACED','LIVE_INSTRUCTOR','STREETVERSE_SIMULATION'],practicalEvaluationRequired:false,claimBoundary:'Training may prepare users for real trade work but does not authorize customs filing or replace licensed/authorized operators.'},
  {id:'osha-pit-employer-evaluation',domain:'WAREHOUSE',title:'Powered Industrial Truck Operator Training and Workplace Evaluation Evidence',credentialKind:'EMPLOYER_EVALUATION',deliveryModes:['LIVE_INSTRUCTOR','PRACTICAL','BLENDED'],practicalEvaluationRequired:true,renewalMonths:36,reference:'29 CFR 1910.178(l)',claimBoundary:'The employer remains responsible for ensuring operator competence. TRYAMM may store training/evaluation evidence but may not substitute a simulation-only badge for required practical workplace evaluation.'},
  {id:'msha-part46-new-miner',domain:'MINING',title:'MSHA Part 46 New Miner Training Evidence',credentialKind:'EXTERNAL_CERTIFICATION_EVIDENCE',deliveryModes:['LIVE_INSTRUCTOR','PRACTICAL','BLENDED'],practicalEvaluationRequired:true,reference:'30 CFR Part 46; new miner training includes at least 24 hours where applicable',claimBoundary:'TRYAMM may manage curriculum, attendance and records only when the mine/operator training plan and qualified instructors satisfy applicable requirements; it does not self-authorize mine work.'},
  {id:'fda-produce-safety-training-record',domain:'FARMING',title:'Produce Safety Training Record',credentialKind:'EXTERNAL_CERTIFICATION_EVIDENCE',deliveryModes:['SELF_PACED','LIVE_INSTRUCTOR','BLENDED'],practicalEvaluationRequired:false,renewalMonths:12,reference:'21 CFR 112.21 and 112.30 where applicable',claimBoundary:'Track required training records accurately. FDA does not require or endorse a universal Produce Safety Rule certification badge.'},
  {id:'fsma-pcqi-evidence',domain:'FARMING',title:'Preventive Controls Qualified Individual Training/Experience Evidence',credentialKind:'EXTERNAL_CERTIFICATION_EVIDENCE',deliveryModes:['LIVE_INSTRUCTOR','BLENDED'],practicalEvaluationRequired:false,reference:'FDA FSMA preventive controls requirements; FSPCA standardized curriculum is recognized by FDA as adequate training',claimBoundary:'Do not label a TRYAMM badge as an FDA certification. Store external course/experience evidence and issuer attribution.'},
  {id:'farm-robot-supervisor-core',domain:'FARM_ROBOTICS',title:'Supervised Farm Robotics Safety and Mission Planning',credentialKind:'SKILL_ASSESSMENT',deliveryModes:['SELF_PACED','STREETVERSE_SIMULATION','PRACTICAL','BLENDED'],practicalEvaluationRequired:true,claimBoundary:'TRYAMM skill assessment only unless an employer/manufacturer or accredited body separately verifies real-machine competence.'},
  {id:'additive-manufacturing-operator-core',domain:'ADDITIVE_MANUFACTURING',title:'TRYAMM 12D Forge / Additive Manufacturing Operator Fundamentals',credentialKind:'SKILL_ASSESSMENT',deliveryModes:['SELF_PACED','STREETVERSE_SIMULATION','PRACTICAL','BLENDED'],practicalEvaluationRequired:true,claimBoundary:'Covers qualified real 3D/additive and manufacturing processes; 12D Forge remains a TRYAMM research/brand label rather than a recognized manufacturing certification standard.'},
  {id:'creator-live-production-core',domain:'STREAMING_CREATOR',title:'TRYAMM LIVE Production, Moderation and Accessibility',credentialKind:'TRYAMM_COMPLETION',deliveryModes:['SELF_PACED','LIVE_INSTRUCTOR','STREETVERSE_SIMULATION'],practicalEvaluationRequired:false,claimBoundary:'Platform training credential only.'},
  {id:'accessible-service-core',domain:'ACCESSIBILITY',title:'Accessible Digital Service and Inclusive Creator Operations',credentialKind:'TRYAMM_COMPLETION',deliveryModes:['SELF_PACED','LIVE_INSTRUCTOR','STREETVERSE_SIMULATION'],practicalEvaluationRequired:false,claimBoundary:'Platform training record; does not imply external accessibility accreditation.'},
  {id:'streetverse-tech-core',domain:'STREETVERSE_TECH',title:'StreetVerse World, Blender, QA and Digital Twin Technician',credentialKind:'SKILL_ASSESSMENT',deliveryModes:['SELF_PACED','STREETVERSE_SIMULATION','PRACTICAL','BLENDED'],practicalEvaluationRequired:true,claimBoundary:'TRYAMM technical skill record only.'},
]

export const EPIC_ROLE_PATHWAYS:EpicRolePathway[]=[
  {id:'warehouse-operator',title:'Warehouse Operator',domains:['WAREHOUSE'],requiredRequirementIds:['osha-pit-employer-evaluation'],optionalRequirementIds:['accessible-service-core']},
  {id:'farm-robot-supervisor',title:'Farm Robot Supervisor',domains:['FARMING','FARM_ROBOTICS'],requiredRequirementIds:['farm-robot-supervisor-core'],optionalRequirementIds:['fda-produce-safety-training-record','accessible-service-core']},
  {id:'import-export-specialist',title:'Import/Export + Supplier Specialist',domains:['IMPORT_EXPORT','SUPPLIER_SOURCING'],requiredRequirementIds:['tryamm-supplier-sourcing-core','tryamm-import-export-core'],optionalRequirementIds:['accessible-service-core']},
  {id:'mine-new-worker',title:'Mine New Worker / Trainee',domains:['MINING'],requiredRequirementIds:['msha-part46-new-miner'],optionalRequirementIds:['accessible-service-core']},
  {id:'forge-technician',title:'TRYAMM 12D Forge Technician',domains:['ADDITIVE_MANUFACTURING'],requiredRequirementIds:['additive-manufacturing-operator-core'],optionalRequirementIds:['streetverse-tech-core']},
  {id:'creator-live-producer',title:'TRYAMM LIVE Producer',domains:['STREAMING_CREATOR','ACCESSIBILITY'],requiredRequirementIds:['creator-live-production-core','accessible-service-core'],optionalRequirementIds:['streetverse-tech-core']},
]

export function getEpicRequirement(id:string){return EPIC_TRAINING_REQUIREMENTS.find(item=>item.id===id)}
export function getEpicRolePathway(id:string){return EPIC_ROLE_PATHWAYS.find(item=>item.id===id)}

export function isEpicCredentialCurrentlyValid(record:EpicCredentialRecord,nowMs=Date.now()){
  if(record.status!=='ACTIVE'||!record.issuerVerified||!record.evidenceVerified)return false
  if(!record.expiresAt)return true
  const expiresAtMs=Date.parse(record.expiresAt)
  return Number.isFinite(expiresAtMs)&&expiresAtMs>=nowMs
}

export function analyzeEpicTrainingGaps(pathwayId:string,records:EpicCredentialRecord[],nowMs=Date.now()){
  const pathway=getEpicRolePathway(pathwayId)
  if(!pathway)return{pathwayFound:false as const,missing:[],expired:[],complete:false}
  const missing:string[]=[]
  const expired:string[]=[]
  for(const requirementId of pathway.requiredRequirementIds){
    const candidates=records.filter(record=>record.requirementId===requirementId)
    if(candidates.length===0){missing.push(requirementId);continue}
    if(!candidates.some(record=>isEpicCredentialCurrentlyValid(record,nowMs)))expired.push(requirementId)
  }
  return{pathwayFound:true as const,missing,expired,complete:missing.length===0&&expired.length===0}
}

export function mayTryammClaimExternalCertification(record:EpicCredentialRecord){
  return record.kind!=='TRYAMM_COMPLETION'&&record.issuerVerified===true&&record.evidenceVerified===true&&record.status==='ACTIVE'
}

export function mayTryammSelfIssueGovernmentCredential(){return false as const}
export function mayEpicTrainingUnlockHazardousEquipmentWithoutPracticalEvaluation(){return false as const}
export function mayEpicAIInventCertificationEvidence(){return false as const}
