export type ReleaseTruthState='DESIGNED'|'CODED'|'TESTED'|'CI_GREEN'|'MERGED'|'DEPLOYED'|'LIVE'|'BLOCKED'|'NEEDS_APPROVAL'
export type ReleaseEvidence={kind:'COMMIT'|'TEST'|'CI'|'MERGE'|'DEPLOYMENT'|'PRODUCTION_PROBE'|'APPROVAL';ref:string;verified:boolean;at:string}
export type ReleaseLane={id:string;name:string;state:ReleaseTruthState;evidence:ReleaseEvidence[];blockers:string[];nextAction:string}

const required:Record<ReleaseTruthState,ReleaseEvidence['kind'][]>={
 DESIGNED:[],CODED:['COMMIT'],TESTED:['COMMIT','TEST'],CI_GREEN:['COMMIT','TEST','CI'],
 MERGED:['COMMIT','TEST','CI','MERGE'],DEPLOYED:['COMMIT','TEST','CI','MERGE','DEPLOYMENT'],
 LIVE:['COMMIT','TEST','CI','MERGE','DEPLOYMENT','PRODUCTION_PROBE'],BLOCKED:[],NEEDS_APPROVAL:[]
}

export function certifyReleaseState(lane:ReleaseLane,target:ReleaseTruthState){
 const verified=new Set(lane.evidence.filter(e=>e.verified).map(e=>e.kind))
 const missing=required[target].filter(k=>!verified.has(k))
 if(missing.length)throw new Error(`cannot claim ${target}; missing verified evidence: ${missing.join(',')}`)
 return {...lane,state:target}
}

export function selectActualBlocker(lanes:ReleaseLane[]){
 const blocked=lanes.filter(l=>l.state==='BLOCKED'||l.state==='NEEDS_APPROVAL'||l.blockers.length)
 return blocked.sort((a,b)=>b.blockers.length-a.blockers.length)[0]??null
}

export type FounderCommandSnapshot={
 generatedAt:string
 lanes:ReleaseLane[]
 counts:Record<ReleaseTruthState,number>
 actualBlocker:ReleaseLane|null
}

export function buildFounderCommandSnapshot(lanes:ReleaseLane[]):FounderCommandSnapshot{
 const states:ReleaseTruthState[]=['DESIGNED','CODED','TESTED','CI_GREEN','MERGED','DEPLOYED','LIVE','BLOCKED','NEEDS_APPROVAL']
 const counts=Object.fromEntries(states.map(s=>[s,lanes.filter(l=>l.state===s).length])) as Record<ReleaseTruthState,number>
 return{generatedAt:new Date().toISOString(),lanes,counts,actualBlocker:selectActualBlocker(lanes)}
}

export const FOUNDER_COMMAND_CENTER={
 views:['RELEASE_TRUTH','ACTUAL_BLOCKER','APPROVAL_QUEUE','RECOVERY_CHECKPOINTS','WORK_RECEIPTS','CI_AND_DEPLOYMENTS','FILES_AND_CONTEXT','COST_AND_PROVIDER_HEALTH'],
 actions:['RESUME_MY_WORK','FIX_ACTUAL_BLOCKER','RUN_TESTS','VERIFY_EXACT_SHA','PREPARE_RELEASE','ROLL_BACK','APPROVE_HIGH_IMPACT_ACTION'],
 accessibility:['one-hand-primary-actions','voice-command-ready','large-touch-targets','plain-language-status','no-color-only-status'],
 rule:'A feature may advance only when evidence required for the target state is verified.',
} as const
