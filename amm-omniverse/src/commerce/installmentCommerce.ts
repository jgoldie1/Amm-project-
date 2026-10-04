export type InstallmentProviderState='unavailable'|'eligible-check-required'|'offer-ready'
export type InstallmentOffer={
 provider:string
 offerId:string
 amountMinor:number
 currency:string
 installments:number
 totalRepaymentMinor:number
 aprPercent?:number
 feesMinor?:number
 state:InstallmentProviderState
 expiresAt?:string
}

export function validateInstallmentOffer(offer:InstallmentOffer){
 const blockers:string[]=[]
 if(!offer.provider)blockers.push('provider_required')
 if(!offer.offerId)blockers.push('provider_offer_id_required')
 if(offer.amountMinor<=0)blockers.push('amount_invalid')
 if(offer.installments<2)blockers.push('installment_count_invalid')
 if(offer.totalRepaymentMinor<offer.amountMinor)blockers.push('repayment_total_invalid')
 if(offer.state!=='offer-ready')blockers.push('provider_offer_not_ready')
 return{
  eligible:blockers.length===0,
  blockers,
  providerControlled:true,
  clientMayCreateCredit:false
 }
}

export const INSTALLMENT_PRODUCTION_BOUNDARY='TRYAMM does not invent credit terms in the browser. Pay-over-time offers must come from an approved financing/payment provider with required disclosures, eligibility checks and server-verified checkout.'
