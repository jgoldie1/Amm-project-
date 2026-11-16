// Internal draft/approval workflow. This does NOT send email, contact publishers,
// register copyright, or grant licenses. Persist via authenticated server storage.
export const SAMPLE_CLEARANCE_STATES=Object.freeze(['draft','research','ready_to_submit','submitted','negotiating','cleared','denied','expired']);
const types=new Set(['sample','interpolation','beat','remix']);
const uses=new Set(['audio_stream','download','video_sync','film','game','radio','advertisement','live']);
const nonblank=x=>typeof x==='string'&&x.trim().length>0;
const isDate=x=>typeof x==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(x)&&!Number.isNaN(Date.parse(x+'T00:00:00Z'));
export function validateClearanceIntake(x){
 const errors=[];
 if(!x||typeof x!=='object')return {valid:false,errors:['invalid_request']};
 if(!nonblank(x.requestId)||!nonblank(x.artistId)||!nonblank(x.releaseId))errors.push('missing_request_identity');
 if(!types.has(x.useType))errors.push('invalid_sample_type');
 if(!nonblank(x.sourceTitle)||!nonblank(x.sourceArtist))errors.push('missing_source_identification');
 if(!Number.isFinite(x.startSeconds)||x.startSeconds<0||!Number.isFinite(x.endSeconds)||x.endSeconds<=x.startSeconds)errors.push('invalid_sample_timing');
 if(!Array.isArray(x.requestedUses)||!x.requestedUses.length||x.requestedUses.some(s=>!uses.has(s)))errors.push('invalid_requested_uses');
 if(!nonblank(x.territories)||!nonblank(x.term))errors.push('missing_scope');
 if(x.hasOriginalRecording===true&&(!nonblank(x.masterOwner)||!nonblank(x.compositionOwner)))errors.push('both_rights_owners_required');
 if(x.hasOriginalRecording===false&&!nonblank(x.compositionOwner))errors.push('composition_owner_required');
 if(typeof x.artistConsent!=='boolean'||x.artistConsent!==true)errors.push('artist_consent_required');
 return {valid:errors.length===0,errors};
}
export function canSubmitClearanceRequest(x){
 const validation=validateClearanceIntake(x);
 const errors=[...validation.errors];
 if(!nonblank(x?.recipientContact)||!nonblank(x?.recipientName))errors.push('verified_recipient_required');
 if(x?.rightsOwnerVerified!==true)errors.push('rights_owner_not_verified');
 if(!nonblank(x?.reviewedTerms))errors.push('terms_required');
 if(x?.artistApprovedSubmission!==true)errors.push('submission_not_approved');
 return {ready:errors.length===0,errors};
}
export function markClearanceSubmitted(x,{submissionId,submittedAt,channel}={}){
 const ready=canSubmitClearanceRequest(x);
 if(!ready.ready)return {ok:false,errors:ready.errors};
 if(!nonblank(submissionId)||!isDate(submittedAt)||!['manual_email','rights_portal','legal_counsel'].includes(channel))return {ok:false,errors:['external_submission_receipt_required']};
 return {ok:true,request:{...x,status:'submitted',submission:{submissionId,submittedAt,channel},masterApproval:null,compositionApproval:null}};
}
function approvalValid(a,usesRequested,today){
 return a&&a.verified===true&&nonblank(a.signedAgreementRef)&&nonblank(a.rightsOwner)&&isDate(a.expiresOn)&&a.expiresOn>=today&&Array.isArray(a.permittedUses)&&usesRequested.every(u=>a.permittedUses.includes(u))&&nonblank(a.territories)&&nonblank(a.term);
}
export function assessSampleClearance(x,today='2026-11-16'){
 const errors=[];
 if(!x?.submission?.submissionId)errors.push('not_submitted');
 if(x?.status==='denied'||x?.status==='expired')errors.push('denied_or_expired');
 if(!approvalValid(x?.compositionApproval,x?.requestedUses||[],today))errors.push('composition_approval_missing');
 if(x?.hasOriginalRecording===true&&!approvalValid(x?.masterApproval,x?.requestedUses||[],today))errors.push('master_approval_missing');
 if(!nonblank(x?.reviewerId)||x?.reviewerVerified!==true)errors.push('independent_review_required');
 return {cleared:errors.length===0,errors};
}
