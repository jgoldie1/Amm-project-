export type MoneyRail='stripe'|'stripe-connect'|'paystack'|'flutterwave'|'bank'|'iap'|'wallet'|'other'
export type ReconciliationStatus='pending'|'matched'|'mismatch'|'held'|'resolved'|'reversed'

export interface EconomicEvent {
  canonicalEventId:string
  orderId?:string
  provider:MoneyRail
  providerEventId:string
  currency:string
  grossMinor:number
  taxMinor:number
  refundMinor:number
  paymentFeeMinor:number
  cogsMinor:number
  fulfillmentMinor:number
  merchantPayableMinor:number
  creatorPayableMinor:number
  developerPayableMinor:number
  infrastructureMinor:number
}

export interface TreasuryTruth {
  currency:string
  availableCashMinor:number
  pendingCashMinor:number
  merchantPayablesMinor:number
  creatorPayablesMinor:number
  developerPayablesMinor:number
  taxLiabilityMinor:number
  refundChargebackReserveMinor:number
  operatingReserveMinor:number
  manufacturing12dCapitalMinor:number
}

export interface UnitEconomics {
  grossMinor:number
  netGmvMinor:number
  netRevenueBeforeObligationsMinor:number
  contributionProfitMinor:number
  obligationsMinor:number
}

const positive=(v:number)=>Math.max(0,Math.round(Number(v)||0))

export function computeUnitEconomics(event:EconomicEvent):UnitEconomics{
  const grossMinor=positive(event.grossMinor)
  const taxes=positive(event.taxMinor)
  const refunds=positive(event.refundMinor)
  const paymentFees=positive(event.paymentFeeMinor)
  const netGmvMinor=Math.max(0,grossMinor-taxes-refunds-paymentFees)
  const obligationsMinor=[event.cogsMinor,event.fulfillmentMinor,event.merchantPayableMinor,event.creatorPayableMinor,event.developerPayableMinor,event.infrastructureMinor]
    .reduce((sum,v)=>sum+positive(v),0)
  return {
    grossMinor,
    netGmvMinor,
    netRevenueBeforeObligationsMinor:netGmvMinor,
    contributionProfitMinor:Math.max(0,netGmvMinor-obligationsMinor),
    obligationsMinor,
  }
}

export interface CapitalAllocationInput {
  realCashMinor:number
  requiredLiabilitiesMinor:number
  taxesMinor:number
  refundReserveMinor:number
  operatingReserveMinor:number
  growthInventoryMinor:number
  approvedDistributionMinor:number
  requested12dMinor:number
}

export function allocateCapital(input:CapitalAllocationInput){
  let remaining=positive(input.realCashMinor)
  const take=(requested:number)=>{const amount=Math.min(remaining,positive(requested));remaining-=amount;return amount}
  const requiredLiabilitiesMinor=take(input.requiredLiabilitiesMinor)
  const taxesMinor=take(input.taxesMinor)
  const refundReserveMinor=take(input.refundReserveMinor)
  const operatingReserveMinor=take(input.operatingReserveMinor)
  const growthInventoryMinor=take(input.growthInventoryMinor)
  const approvedDistributionMinor=take(input.approvedDistributionMinor)
  const manufacturing12dMinor=take(input.requested12dMinor)
  return {requiredLiabilitiesMinor,taxesMinor,refundReserveMinor,operatingReserveMinor,growthInventoryMinor,approvedDistributionMinor,manufacturing12dMinor,unallocatedMinor:remaining}
}

export function reconciliationKey(provider:string,providerEventId:string){
  if(!provider||!providerEventId)throw new Error('provider and providerEventId are required')
  return `${provider.trim().toLowerCase()}:${providerEventId.trim()}`
}

export const FINANCIAL_TRUTH_FLOW=[
  'REQUEST','AUTHENTICATION','AUTHORIZATION','POLICY','PRICE RECOMPUTATION','PAYMENT VERIFICATION','IDEMPOTENCY','CANONICAL LEDGER','RECONCILIATION','SETTLEMENT','AUDIT',
] as const

export const CAPITAL_FLOW=[
  'REAL CASH','REQUIRED LIABILITIES','TAXES','REFUND RESERVE','OPERATING RESERVE','GROWTH / INVENTORY','APPROVED DISTRIBUTION','12D FUND',
] as const

export const FINANCIAL_TRUTH_RULES={
  oneCanonicalEconomicEvent:true,
  providerWebhooksMustBeVerified:true,
  idempotencyRequired:true,
  clientCannotMintMoney:true,
  clientCannotDeclarePaymentSuccess:true,
  cashOwedToOthersIsNotPlatformCash:true,
  multiCurrencyMustRemainCurrencyScoped:true,
  capitalAllocationAfterLiabilitiesAndReserves:true,
  manufacturing12dUsesApprovedAvailableCashOnly:true,
  aiMayRecommendButCannotBypassDeterministicFinancialPolicy:true,
} as const

export const FINANCIAL_TRUTH_POSITIONING='Every TRYAMM economic subsystem answers to one verified financial truth: one canonical event, one auditable ledger, explicit obligations, reconciled provider settlements, and capital allocation only from genuinely available cash.' as const
