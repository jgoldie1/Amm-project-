import type { HoloInputKind } from './HoloGPTSovereignIntentFabric.ts'

export type IntakeSource='UPLOAD'|'CAMERA'|'VOICE'|'REPOSITORY'|'CLOUD'|'GENERATED'
export type IntakeState='RECEIVED'|'QUARANTINED'|'INDEXED'|'READY'|'REJECTED'|'EXPIRED'

export type HoloFileRecord={
 id:string; ownerId:string; projectId:string; name:string; kind:HoloInputKind; source:IntakeSource
 contentHash:string; sizeBytes:number; state:IntakeState; createdAt:string
 retention:'SESSION'|'PROJECT'|'USER_PINNED'|'LEGAL_REQUIRED'
 permissions:string[]; derivedFrom?:string[]; expiresAt?:string
}

export function validateUniversalIntake(f:HoloFileRecord){
 if(!f.id||!f.ownerId||!f.projectId||!f.name||!f.contentHash) throw new Error('file provenance required')
 if(!Number.isSafeInteger(f.sizeBytes)||f.sizeBytes<0) throw new Error('invalid file size')
 if(f.retention==='SESSION'&&!f.expiresAt) throw new Error('session file requires expiry')
 if(f.permissions.length===0) throw new Error('file permissions required')
 return f
}

export type ContextNodeKind='FILE'|'COMMIT'|'BRANCH'|'PR'|'DEPLOYMENT'|'BUSINESS'|'WORLD'|'ASSET'|'PERSON'|'TASK'|'DECISION'|'RECEIPT'
export type ContextNode={id:string;kind:ContextNodeKind;label:string;sourceRef:string;evidence:string[];updatedAt:string}
export type ContextEdge={from:string;to:string;relation:string;evidence:string[]}

export class LivingContextGraph{
 private nodes=new Map<string,ContextNode>()
 private edges:ContextEdge[]=[]
 upsert(node:ContextNode){if(!node.evidence.length)throw new Error('context nodes require evidence');this.nodes.set(node.id,node);return node}
 link(edge:ContextEdge){if(!this.nodes.has(edge.from)||!this.nodes.has(edge.to))throw new Error('context edge endpoints required');if(!edge.evidence.length)throw new Error('context edges require evidence');this.edges.push(edge);return edge}
 snapshot(){return{nodes:[...this.nodes.values()],edges:[...this.edges]}}
}

export type ResumeEvidence={
 projectId:string
 verifiedCommitSha?:string
 branch?:string
 openPr?:number
 ci?:'PASS'|'FAIL'|'PENDING'|'UNKNOWN'
 deployment?:'LIVE'|'PREVIEW'|'FAILED'|'UNKNOWN'
 lastReceiptId?:string
 files:HoloFileRecord[]
 unresolved:string[]
}

export function buildResumeMyWork(e:ResumeEvidence){
 const claims=[
  e.verifiedCommitSha&&`verified commit ${e.verifiedCommitSha}`,
  e.branch&&`branch ${e.branch}`,
  e.openPr&&`PR #${e.openPr}`,
  `CI ${e.ci??'UNKNOWN'}`,
  `deployment ${e.deployment??'UNKNOWN'}`,
 ].filter(Boolean)
 return{
  projectId:e.projectId,
  verifiedState:claims,
  recoverableFiles:e.files.filter(f=>f.state==='READY'||f.state==='INDEXED').map(f=>({id:f.id,name:f.name,hash:f.contentHash})),
  unresolved:e.unresolved,
  nextRule:'Continue from verified evidence; never infer that planned work was committed, merged, deployed or live.',
 }
}

export const UNIVERSAL_INTAKE_POLICY={
 supported:['text','voice','camera','image','pdf','docx','txt','csv','xlsx','pptx','audio','video','code','repository','cloud-file'] as HoloInputKind[],
 pipeline:['RECEIVE','TYPE_AND_SIZE_GATE','MALWARE_SAFETY_GATE','HASH','PERMISSION_GATE','PARSE','INDEX','CONTEXT_LINK','RETENTION_SCHEDULE','READY'],
 rules:['preserve-original','hash-every-artifact','derived-files-link-to-source','minimum-necessary-access','no-public-chain-sensitive-files','expiry-is-enforced','deletion-propagates-to-derived-indexes'],
} as const
