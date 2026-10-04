export type AccessorialType=
 |'detention'|'layover'|'tonu'|'stop-off'|'driver-assist'|'lumper-reimbursement'|'tarp'|'reefer'|'hazmat'
 |'scale-ticket'|'toll-reimbursement'|'parking-reimbursement'|'washout'|'breakdown'|'deadhead-premium'
 |'fuel-surcharge'|'after-hours'|'redelivery'|'storage'|'other'

export type AccessorialClaim={
 id:string;shipmentId:string;driverId:string;type:AccessorialType;state:'draft'|'submitted'|'review'|'approved'|'rejected'|'payable'|'paid';
 amountMinor?:number;currency:'USD';
 rateConfirmationSupportsCharge:boolean;providerTermsSupportCharge:boolean;
 appointmentAt?:string;arrivalAt?:string;releaseAt?:string;freeTimeMinutes?:number;
 receiptRequired?:boolean;receiptAttached?:boolean;bolAttached?:boolean;podAttached?:boolean;
 notes?:string;authoritativeApproval:boolean
}

export function detentionMinutes(claim:AccessorialClaim){
 if(!claim.arrivalAt||!claim.releaseAt)return 0
 const elapsed=Math.max(0,Math.floor((Date.parse(claim.releaseAt)-Date.parse(claim.arrivalAt))/60000))
 return Math.max(0,elapsed-Math.max(0,claim.freeTimeMinutes||0))
}

export function evaluateAccessorialClaim(claim:AccessorialClaim){
 const blockers:string[]=[]
 if(!claim.rateConfirmationSupportsCharge&&!claim.providerTermsSupportCharge)blockers.push('contract_or_provider_term_required')
 if(claim.type==='detention'&&detentionMinutes(claim)<=0)blockers.push('detention_threshold_not_met')
 if(claim.receiptRequired&&!claim.receiptAttached)blockers.push('receipt_required')
 if(['detention','layover','tonu','stop-off','driver-assist','redelivery'].includes(claim.type)&&!claim.bolAttached)blockers.push('bol_or_trip_document_required')
 if(['lumper-reimbursement','scale-ticket','toll-reimbursement','parking-reimbursement','washout'].includes(claim.type)&&!claim.receiptAttached)blockers.push('expense_proof_required')
 if(!claim.authoritativeApproval)blockers.push('authoritative_approval_required')
 return{eligible:blockers.length===0,blockers,detentionBillableMinutes:claim.type==='detention'?detentionMinutes(claim):0,automaticEntitlement:false}
}

export const ACCESSORIAL_PAY_RULE='Detention, layover, TONU, lumper, fuel surcharge and other accessorials are contract/provider dependent. TRYAMM records evidence and eligibility; it does not promise payment without authoritative approval.'