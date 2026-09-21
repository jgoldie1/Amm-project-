export type RepairLayer='SOURCE'|'DEPENDENCY'|'TYPECHECK'|'TEST'|'CI'|'CONFIG'|'BUILD'|'DEPLOYMENT'|'PROVIDER'|'DATA'|'UNKNOWN'
export type RepairAttempt={id:string;signature:string;layer:RepairLayer;changeSummary:string;result:'PLANNED'|'PASS'|'FAIL';evidence:string[]}
export type RepairCase={id:string;errorSignature:string;layer:RepairLayer;attempts:RepairAttempt[];maxAttempts:number;checkpointId?:string}

export function detectRepairLayer(log:string):RepairLayer{
 const s=log.toLowerCase()
 if(/ts\d+|typecheck|tsc --noemit/.test(s))return'TYPECHECK'
 if(/test|assert|expect/.test(s))return'TEST'
 if(/workflow|github actions|runner/.test(s))return'CI'
 if(/package-lock|dependency|npm|pnpm|yarn/.test(s))return'DEPENDENCY'
 if(/env|node version|config|configuration/.test(s))return'CONFIG'
 if(/build|compile|bundle/.test(s))return'BUILD'
 if(/vercel|render|deploy|production probe/.test(s))return'DEPLOYMENT'
 if(/provider|timeout|rate limit|429|503/.test(s))return'PROVIDER'
 if(/database|migration|schema|supabase/.test(s))return'DATA'
 return'UNKNOWN'
}

export function normalizeErrorSignature(log:string){
 return log.toLowerCase().replace(/\b[0-9a-f]{7,40}\b/g,'<sha>').replace(/\d+/g,'#').replace(/\s+/g,' ').trim().slice(0,800)
}

export function guardAgainstRepairLoop(c:RepairCase,nextSignature:string){
 if(c.attempts.length>=c.maxAttempts)throw new Error('repair attempt budget exhausted; human review required')
 const repeated=c.attempts.filter(a=>a.signature===nextSignature&&a.result==='FAIL').length
 if(repeated>=2)throw new Error('same failed repair path repeated; change strategy or escalate')
 return true
}

export function chooseSmallestRepair(files:string[],suspects:string[]){
 const set=new Set(suspects)
 return files.filter(f=>set.has(f))
}

export const AUTONOMOUS_REPAIR_ENGINE={
 mode:'EVIDENCE_FIRST',
 loop:[
  'CAPTURE_EXACT_ERROR',
  'CLASSIFY_FAILING_LAYER',
  'LOCATE_SMALLEST_RELEVANT_SOURCE',
  'CHECK_PRIOR_FAILED_ATTEMPTS',
  'CREATE_RECOVERY_CHECKPOINT',
  'PROPOSE_MINIMUM_REVERSIBLE_PATCH',
  'RUN_NARROW_TEST',
  'RUN_FULL_REQUIRED_TESTS',
  'VERIFY_EXACT_SHA',
  'CREATE_WORK_RECEIPT',
  'STOP_OR_ESCALATE',
 ],
 prohibitions:[
  'no-random-large-feature-batch-during-repair',
  'no-repeat-of-same-failed-patch',
  'no-claim-of-success-without-evidence',
  'no-deploy-from-unverified-revision',
  'no-silent-destructive-action',
 ],
} as const

export function nextRepairAction(c:RepairCase,log:string){
 const signature=normalizeErrorSignature(log)
 guardAgainstRepairLoop(c,signature)
 const layer=detectRepairLayer(log)
 return{caseId:c.id,signature,layer,action:'inspect-smallest-relevant-source-and-create-reversible-patch',requiresCheckpoint:true}
}
