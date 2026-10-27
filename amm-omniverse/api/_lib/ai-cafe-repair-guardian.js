/**
 * Stubbs AI Café Repair Guardian.
 * Pure red/green release decision logic — no shell, network, model calls, deploy or payment access.
 * An approved sandbox runner supplies independently verified evidence.
 */
const VALID_AREAS=new Set(['city','controls','assets','missions','mobility','reels','multiplayer','accessibility']);
const VALID_PHASES=new Set(['red','green','review']);
const SAFE_NAME=/^[a-zA-Z0-9][a-zA-Z0-9._/-]{0,140}$/;
export function evaluateRepairEvidence(job){
 const errors=[];
 if(!job||typeof job!=='object')return{approved:false,next:'blocked',errors:['invalid_job']};
 if(!VALID_AREAS.has(job.area))errors.push('unknown_area');
 if(!VALID_PHASES.has(job.phase))errors.push('unknown_phase');
 if(typeof job.branch!=='string'||!job.branch.startsWith('feature/')&&!job.branch.startsWith('fix/'))errors.push('non_isolated_branch');
 if(!Array.isArray(job.changedFiles)||job.changedFiles.length>12||job.changedFiles.some(p=>typeof p!=='string'||!SAFE_NAME.test(p)||p.startsWith('/')||p.includes('..')))errors.push('unsafe_file_scope');
 if(job.changedFiles?.some(p=>/^(.github\/workflows\/|.*(?:\.env|secret|credential|billing|payment|payout))/i.test(p)))errors.push('privileged_change');
 if(!Array.isArray(job.failingTests)||!job.failingTests.length)errors.push('missing_red_test');
 if(!Array.isArray(job.passingTests))errors.push('missing_green_test');
 if(job.phase==='red'&&job.failingTests?.length&&job.passingTests?.length)errors.push('red_not_isolated');
 if(job.phase!=='red'&&(job.failingTests||[]).some(t=>!job.passingTests?.includes(t)))errors.push('regression_not_repaired');
 if(job.phase==='review'&&(!job.ciPassed||!job.securityPassed||!job.mobileProofPassed))errors.push('release_gates_incomplete');
 if(job.phase==='review'&&!job.humanApproved)errors.push('owner_approval_required');
 if(errors.length)return{approved:false,next:'blocked',errors};
 if(job.phase==='red')return{approved:true,next:'green',errors:[]};
 if(job.phase==='green')return{approved:true,next:'review',errors:[]};
 return{approved:true,next:'staging_only',errors:[]};
}
export const REPAIR_GUARDIAN_LIMITS=Object.freeze({
 maxChangedFiles:12,maxRetries:2,liveDeploy:false,autoMerge:false,
 allowedAreas:[...VALID_AREAS],
});
