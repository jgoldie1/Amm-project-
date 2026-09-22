import {validateCreatorAgencyMembership,type CreatorAgencyMembership} from '../../foundation/staysAgencyFamilyFoundation'

export type CreatorMoneyEventKind=
 | 'live-gift'|'live-ticket'|'live-subscription'|'pk-gift'|'pk-prize'
 | 'debate-gift'|'debate-ticket'|'debate-sponsor'|'debate-prize'
 | 'family-creator-earning'|'agency-creator-earning'

export type SplitRecipientKind='creator'|'agency'|'family'|'tryamm'|'reserve'

export interface SettlementParticipant{accountId:string;kind:SplitRecipientKind;basisPoints:number}
export interface CreatorMoneyEvent{
 id:string
 kind:CreatorMoneyEventKind
 creatorId:string
 amountMinor:number
 currency:string
 providerVerified:boolean
 providerEventId:string
 roomId?:string
 familyAccountId?:string
 agencyMembership?:CreatorAgencyMembership
 familyShareBps?:number
 platformShareBps?:number
 reserveShareBps?:number
}

export interface CreatorSettlement{
 eventId:string
 currency:string
 grossMinor:number
 allocations:Array<SettlementParticipant&{amountMinor:number}>
 payable:boolean
 holdReasons:string[]
}

/**
 * Convergence contract for LIVE, PK, debate, Family and Agency earnings.
 * It does not move money. A verified server/provider event must call the
 * authoritative ledger/payout service after this policy calculation.
 */
export function buildCreatorSettlement(event:CreatorMoneyEvent):CreatorSettlement{
 const holdReasons:string[]=[]
 if(!event.id.trim()||!event.providerEventId.trim())holdReasons.push('payment-evidence-required')
 if(!event.providerVerified)holdReasons.push('provider-verification-required')
 if(!Number.isInteger(event.amountMinor)||event.amountMinor<=0)holdReasons.push('positive-amount-required')
 if(!event.currency.trim())holdReasons.push('currency-required')

 const platform=Math.max(0,Math.min(10_000,event.platformShareBps??0))
 const reserve=Math.max(0,Math.min(10_000,event.reserveShareBps??0))
 const family=Math.max(0,Math.min(10_000,event.familyShareBps??0))
 let agency=0

 if(event.agencyMembership){
  const membership=validateCreatorAgencyMembership(event.agencyMembership)
  if(!membership.allowed)holdReasons.push(...membership.reasons.map(reason=>`agency:${reason}`))
  else agency=event.agencyMembership.commissionBps
 }
 if(family>0&&!event.familyAccountId?.trim())holdReasons.push('family-account-required')
 if(event.kind.startsWith('debate-')&&event.kind==='debate-prize')holdReasons.push('debate-prize-eligibility-review-required')

 const committed=platform+reserve+family+agency
 if(committed>10_000)holdReasons.push('split-exceeds-100-percent')
 const creator=Math.max(0,10_000-committed)

 const participants:SettlementParticipant[]=[
  {accountId:event.creatorId,kind:'creator',basisPoints:creator},
  ...(event.agencyMembership&&agency>0?[{accountId:event.agencyMembership.agencyId,kind:'agency' as const,basisPoints:agency}]:[]),
  ...(event.familyAccountId&&family>0?[{accountId:event.familyAccountId,kind:'family' as const,basisPoints:family}]:[]),
  ...(platform>0?[{accountId:'tryamm',kind:'tryamm' as const,basisPoints:platform}]:[]),
  ...(reserve>0?[{accountId:'tryamm-reserve',kind:'reserve' as const,basisPoints:reserve}]:[]),
 ]
 const allocations=participants.map((p,index)=>{
  const prior=participants.slice(0,index).reduce((sum,x)=>sum+Math.floor(event.amountMinor*x.basisPoints/10_000),0)
  const amountMinor=index===participants.length-1?Math.max(0,event.amountMinor-prior):Math.floor(event.amountMinor*p.basisPoints/10_000)
  return {...p,amountMinor}
 })
 return{eventId:event.id,currency:event.currency.toUpperCase(),grossMinor:event.amountMinor,allocations,payable:holdReasons.length===0,holdReasons}
}

export const CREATOR_SETTLEMENT_BOUNDARY={
 serverAuthoritative:true,
 providerVerificationRequired:true,
 agencyContractRequired:true,
 familyWalletPoolingDefault:false,
 clientMayMintBalance:false,
 clientMayChangeCommission:false,
 debateWageringSupported:false,
 reversalsMustReverseOriginalAllocations:true,
} as const
