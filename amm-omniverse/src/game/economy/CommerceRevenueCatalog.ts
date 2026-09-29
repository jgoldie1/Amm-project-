export type TryammRevenueKind='ticket'|'ppv'|'gift'|'subscription'|'sponsorship'|'merch'|'music'|'tournament-entry'|'digital-item'
export type TryammRevenueChannel='holo-music'|'live-pk'|'crossverse'|'all-american-showcase'|'all-american-network'|'streetverse'|'marketplace'

export interface RevenueOffer {
 id:string
 kind:TryammRevenueKind
 channel:TryammRevenueChannel
 title:string
 sellerKey:string
 amountCents:number
 currency:'USD'
 experienceId?:string
 rightsReference?:string
}

export const REVENUE_ENTITLEMENTS:Record<TryammRevenueKind,string>={
 ticket:'event_access',
 ppv:'ppv_access',
 gift:'gift_receipt',
 subscription:'subscription_access',
 sponsorship:'sponsorship_receipt',
 merch:'merch_purchase',
 music:'music_license',
 'tournament-entry':'tournament_entry',
 'digital-item':'digital_item',
}

export const toCommerceMetadata=(offer:RevenueOffer)=>({
 commerceKind:'revenue',
 revenueKind:offer.kind,
 channel:offer.channel,
 experienceId:offer.experienceId||'',
 rightsReference:offer.rightsReference||'',
 entitlementType:REVENUE_ENTITLEMENTS[offer.kind],
})

export const validateRevenueOffer=(offer:RevenueOffer)=>{
 if(!offer.id||!offer.title||!offer.sellerKey)return false
 if(offer.currency!=='USD')return false
 if(!Number.isSafeInteger(offer.amountCents)||offer.amountCents<50||offer.amountCents>500000)return false
 return true
}

export const REVENUE_COMMERCE_RULES={
 useExistingCommerceCheckout:true,
 stripeWebhookIsPaymentAuthority:true,
 serverPriceValidationRequired:true,
 serverSplitValidationRequired:true,
 entitlementOnlyAfterVerifiedPayment:true,
 ledgerOnlyAfterVerifiedPayment:true,
 clientCannotCreatePayableBalance:true,
 refundsAndChargebacksReverseEligibleEntries:true,
 rightsMetadataRequiredWhenApplicable:true,
} as const

/**
 * Adapter contract only. It does not charge a customer.
 * Eligible offers must be persisted/validated server-side before the existing
 * TRYAMM Stripe checkout is allowed to create a Checkout Session.
 */
