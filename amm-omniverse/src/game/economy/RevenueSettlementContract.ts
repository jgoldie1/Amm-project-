import type {FlywheelRevenueEvent,FlywheelAllocation} from './TryammRevenueFlywheel'

export type SettlementState='pending-verification'|'verified'|'entitled'|'allocated'|'payable'|'paid'|'reversed'|'failed'

export interface SettlementRecord{
 id:string
 revenueEventId:string
 processorEventId?:string
 processorPaymentId?:string
 entitlementId?:string
 ledgerTransactionId?:string
 state:SettlementState
 grossMinor:number
 currency:string
 allocations:FlywheelAllocation[]
 createdAt:number
 updatedAt:number
}

export const createPendingSettlement=(event:FlywheelRevenueEvent,allocations:FlywheelAllocation[]):SettlementRecord=>{
 if(event.verified)throw new Error('Client-created revenue events cannot arrive pre-verified')
 const now=Date.now()
 return {
  id:`settlement-${event.id}`,
  revenueEventId:event.id,
  state:'pending-verification',
  grossMinor:event.grossMinor,
  currency:event.currency,
  allocations,
  createdAt:now,
  updatedAt:now,
 }
}

export const SERVER_SETTLEMENT_SEQUENCE=[
 'checkout-or-approved-payment-created',
 'processor-webhook-signature-verified',
 'processor-event-deduplicated',
 'amount-currency-and-product-validated',
 'transaction-recorded',
 'entitlement-created-if-applicable',
 'splits-calculated-from-approved-contract',
 'ledger-entries-posted',
 'eligible-balance-marked-payable',
 'payout-created-by-approved-server-process',
] as const

export const SETTLEMENT_SECURITY_RULES={
 browserCannotSetVerified:true,
 browserCannotSetProcessorEventId:true,
 browserCannotCreateEntitlement:true,
 browserCannotPostLedgerEntries:true,
 browserCannotCreatePayableBalance:true,
 browserCannotTriggerUnverifiedPayout:true,
 webhookMustBeSignatureVerified:true,
 webhookMustBeIdempotent:true,
 priceAndCurrencyMustBeServerValidated:true,
 splitContractMustBeServerValidated:true,
 refundsDisputesAndChargebacksCanReverseLedger:true,
 rankedRewardsRequireIndependentServerValidation:true,
} as const

export const revenueEntitlementKind=(source:FlywheelRevenueEvent['source'])=>{
 switch(source){
  case 'ticket':return 'event-access'
  case 'ppv':return 'ppv-access'
  case 'subscription':return 'membership-access'
  case 'digital-item':return 'digital-item'
  case 'tournament-entry':return 'tournament-entry'
  default:return null
 }
}

/**
 * Contract shared by Holo Music, LIVE/PK, CrossVerse, All American Showcase,
 * All American Network, Marketplace and future creator/business commerce.
 * Provider-specific webhook handlers must live on the server.
 */
