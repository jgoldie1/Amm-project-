import {validateCreatorAgencyMembership,type CreatorAgencyMembership} from '../../foundation/staysAgencyFamilyFoundation'
export type CreatorMoneyEventKind='live-gift'|'live-ticket'|'live-subscription'|'pk-gift'|'pk-prize'|'debate-gift'|'debate-ticket'|'debate-sponsor'|'debate-prize'|'family-creator-earning'|'agency-creator-earning'
export type SplitRecipientKind='creator'|'agency'|'family'|'tryamm'|'reserve'
export interface SettlementParticipant{accountId:string;kind:SplitRecipientKind;basisPoints:number}
export interface CreatorMoneyEvent{id:string;kind:CreatorMoneyEventKind;creatorId:string;amountMinor:number;currency:string;providerVerified:boolean;providerEventId:string;roomId?:string;familyAccountId?:string;agencyMembership?:CreatorAgencyMembership;familyShareBps?:number;platformShareBps?:number;reserveShareBps?:number;debatePrizeEligibility?:{reviewed:boolean;approved:boolean;reviewId:string}}
export interface CreatorSettlement{eventId:string;currency:string;grossMinor:number;allocations:Array<SettlementParticipant&{amountMinor:number}>;payable:boolean;holdReasons:string[]}
const validBps=(v:number|undefined)=>v===undefined||(Number.isInteger(v)&&v>=0&&v<=10_000)
export function buildCreatorSettlement(event:CreatorMoneyEvent):CreatorSettlement{
 const holdReasons:string[]=[]
 if(!event.id.trim()||!event.providerEventId.trim())holdReasons.push('payment-evidence-required')
 if(!event.creatorId.trim())holdReasons.push('creator-account-required')
 if(!event.providerVerified)holdReasons.push('provider-verification-required')
 if(!Number.isInteger(event.amountMinor)||event.amountMinor<=0)holdReasons.push('positive-amount-required')
 if(!event.currency.trim())holdReasons.push('currency-required')
 for(const [name,value] of [['platform',event.platformShareBps],['reserve',event.reserveShareBps],['family',event.familyShareBps]] as const)if(!validBps(value))holdReasons.push(`${name}-share-bps-invalid`)
 const platform=validBps(event.platformShareBps)?event.platformShareBps??0:0,reserve=validBps(event.reserveShareBps)?event.reserveShareBps??0:0,family=validBps(event.familyShareBps)?event.familyShareBps??0:0
 let agency=0
 if(event.agencyMembership){
  if(event.agencyMembership.creatorId!==event.creatorId)holdReasons.push('agency:creator-mismatch')
  const membership=validateCreatorAgencyMembership(event.agencyMembership)
  if(!membership.allowed)holdReasons.push(...membership.reasons.map(reason=>`agency:${reason}`))
  else if(event.agencyMembership.creatorId===event.creatorId)agency=event.agencyMembership.commissionBps
 }
 if(family>0&&!event.familyAccountId?.trim())holdReasons.push('family-account-required')
 if(event.kind==='debate-prize'){const e=event.debatePrizeEligibility;if(!e?.reviewed||!e.approved||!e.reviewId.trim())holdReasons.push('debate-prize-eligibility-review-required')}
 const committed=platform+reserve+family+agency;if(committed>10_000)holdReasons.push('split-exceeds-100-percent');const creator=Math.max(0,10_000-committed)
 const participants:SettlementParticipant[]=[{accountId:event.creatorId,kind:'creator',basisPoints:creator},...(event.agencyMembership&&agency>0?[{accountId:event.agencyMembership.agencyId,kind:'agency' as const,basisPoints:agency}]:[]),...(event.familyAccountId&&family>0?[{accountId:event.familyAccountId,kind:'family' as const,basisPoints:family}]:[]),...(platform>0?[{accountId:'tryamm',kind:'tryamm' as const,basisPoints:platform}]:[]),...(reserve>0?[{accountId:'tryamm-reserve',kind:'reserve' as const,basisPoints:reserve}]:[])]
 const allocations=participants.map((p,index)=>{const prior=participants.slice(0,index).reduce((sum,x)=>sum+Math.floor(event.amountMinor*x.basisPoints/10_000),0);return{...p,amountMinor:index===participants.length-1?Math.max(0,event.amountMinor-prior):Math.floor(event.amountMinor*p.basisPoints/10_000)}})
 return{eventId:event.id,currency:event.currency.toUpperCase(),grossMinor:event.amountMinor,allocations,payable:holdReasons.length===0,holdReasons}
}
export const CREATOR_SETTLEMENT_BOUNDARY={serverAuthoritative:true,providerVerificationRequired:true,agencyContractRequired:true,familyWalletPoolingDefault:false,clientMayMintBalance:false,clientMayChangeCommission:false,debateWageringSupported:false,reversalsMustReverseOriginalAllocations:true} as const
