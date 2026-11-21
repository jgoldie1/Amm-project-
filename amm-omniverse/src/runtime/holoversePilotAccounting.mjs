// HoloVerse streaming pilot: internal rights and accounting simulation, not a DSP/PRO or payout system.
const validId=x=>typeof x==='string'&&/^[a-zA-Z0-9][a-zA-Z0-9:_-]{1,79}$/.test(x);
const validSplits=x=>Array.isArray(x)&&x.length>0&&x.every(s=>validId(s.partyId)&&Number.isSafeInteger(s.basisPoints)&&s.basisPoints>=0)&&x.reduce((n,s)=>n+s.basisPoints,0)===10000&&new Set(x.map(s=>s.partyId)).size===x.length;
export function assessRelease(r){
 if(!r||typeof r!=='object')return {eligible:false,errors:['invalid_release']};
 const e=[];
 if(!validId(r.id)||!validId(r.artistId)||typeof r.title!=='string'||!r.title.trim())e.push('missing_identity');
 if(r.rightsStatus!=='cleared')e.push('rights_not_cleared');
 if(r.ownerConsent!==true||r.masterPermission!==true||r.compositionPermission!==true)e.push('permissions_missing');
 if(!['none','cleared'].includes(r.sampleStatus))e.push('sample_clearance_missing');
 if(r.audiovisual===true&&r.syncPermission!==true)e.push('sync_permission_missing');
 if(r.aiVoiceConsentRequired===true&&r.aiVoiceConsent!==true)e.push('voice_consent_missing');
 if(!validSplits(r.masterSplits)||!validSplits(r.compositionSplits))e.push('invalid_splits');
 return {eligible:e.length===0,errors:e};
}
function splitCents(amount,splits){
 if(!Number.isSafeInteger(amount)||amount<0||!validSplits(splits))throw new TypeError('invalid split');
 const rows=splits.map(s=>({partyId:s.partyId,cents:Math.floor(amount*s.basisPoints/10000),rem:amount*s.basisPoints%10000}));
 const rest=amount-rows.reduce((n,r)=>n+r.cents,0);
 const ordered=[...rows].sort((a,b)=>b.rem-a.rem||a.partyId.localeCompare(b.partyId));
 for(let i=0;i<rest;i++)ordered[i].cents++;
 return rows.map(({partyId,cents})=>({partyId,cents}));
}
// Pool rates are illustrative, NOT contractual offers or real platform royalty obligations.
export function simulateAllocation({receiptCents,recordingPoolBasisPoints=5000,compositionPoolBasisPoints=2000,masterSplits,compositionSplits,managedLabel=false}){
 if(!Number.isSafeInteger(receiptCents)||receiptCents<0||!Number.isSafeInteger(recordingPoolBasisPoints)||!Number.isSafeInteger(compositionPoolBasisPoints)||recordingPoolBasisPoints<0||compositionPoolBasisPoints<0||recordingPoolBasisPoints+compositionPoolBasisPoints>10000)throw new TypeError('invalid pools');
 const recordingCents=Math.floor(receiptCents*recordingPoolBasisPoints/10000);
 const compositionCents=Math.floor(receiptCents*compositionPoolBasisPoints/10000);
 const platformCents=receiptCents-recordingCents-compositionCents;
 const masterOwnerCents=managedLabel?Math.floor(recordingCents*7500/10000):recordingCents;
 return {simulationOnly:true,recordingCents,compositionCents,platformCents,labelCents:recordingCents-masterOwnerCents,recordingOwners:splitCents(masterOwnerCents,masterSplits),compositionOwners:splitCents(compositionCents,compositionSplits)};
}
export function qualifyPlay({playedSeconds,durationSeconds,isSelfPlay=false,duplicate=false,authorized=false}){
 return authorized===true&&!isSelfPlay&&!duplicate&&Number.isFinite(playedSeconds)&&playedSeconds>=0&&Number.isFinite(durationSeconds)&&durationSeconds>0&&(playedSeconds>=30||playedSeconds>=durationSeconds);
}
