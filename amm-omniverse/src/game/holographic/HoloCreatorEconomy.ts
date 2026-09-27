export type HoloRevenueKind='ticket'|'ppv'|'gift'|'subscription'|'sponsorship'|'merch'|'music-sale'|'stream-royalty'
export type HoloPayeeRole='creator'|'collaborator'|'rights-holder'|'venue'|'platform'|'community-fund'

export interface HoloRevenueEvent{
 id:string
 sessionId:string
 kind:HoloRevenueKind
 grossMinor:number
 currency:string
 purchaserId?:string
 createdAt:number
 verified:boolean
}

export interface HoloSplit{
 payeeId:string
 role:HoloPayeeRole
 basisPoints:number
}

export interface HoloPayoutPlan{
 revenueEventId:string
 splits:HoloSplit[]
 status:'draft'|'verified'|'payable'|'paid'|'reversed'
}

export const validateSplits=(splits:HoloSplit[])=>{
 const total=splits.reduce((n,s)=>n+s.basisPoints,0)
 return splits.length>0&&total===10000&&splits.every(s=>s.basisPoints>=0&&Number.isInteger(s.basisPoints))
}

export const calculateSplitAmounts=(grossMinor:number,splits:HoloSplit[])=>{
 if(!validateSplits(splits))throw new Error('Holo creator splits must total 10000 basis points')
 let allocated=0
 return splits.map((split,index)=>{
  const amount=index===splits.length-1?grossMinor-allocated:Math.floor(grossMinor*split.basisPoints/10000)
  allocated+=amount
  return {...split,amountMinor:amount}
 })
}

export const HOLO_CREATOR_ECONOMY_RULES={
 clientCannotMarkPurchaseVerified:true,
 clientCannotCreatePayableBalance:true,
 stripeOrApprovedProcessorWebhookVerificationRequired:true,
 ledgerIsAppendOnlyAfterVerification:true,
 rightsMetadataRequiredForMusicRevenue:true,
 collaboratorSplitsRecordedBeforePayout:true,
 giftsCannotAlterRankedOutcome:true,
 refundsAndChargebacksReverseEligibleRevenue:true,
 minorsRequireApplicableGuardianAndPlatformControls:true,
 creatorCanViewGrossFeesSplitsAndPayableBalance:true,
} as const

export const createDraftRevenueEvent=(input:Omit<HoloRevenueEvent,'id'|'createdAt'|'verified'>):HoloRevenueEvent=>({
 ...input,
 id:`holo-revenue-${Date.now()}-${Math.random().toString(36).slice(2,8)}`,
 createdAt:Date.now(),
 verified:false,
})

/**
 * This module defines economy contracts only.
 * Verification, entitlement and payable balances must be produced server-side.
 */
