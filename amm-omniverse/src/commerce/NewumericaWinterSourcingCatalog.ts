/** Newumerica 2026-27 winter seasonal catalog — category hypotheses, not sourced stock. */
export const NEWUMERICA_WINTER_CATALOG=[
{id:'omni-deck-digital',name:'Omni Holographic Deck — Digital Edition',lane:'digital',estimatedRetailUSD:19,stock:'not-activated',demo:'/bj-stubbs-store.html'},
{id:'omega-gift-pack',name:'Omega LIVE Holographic Gift Art Pack',lane:'digital',estimatedRetailUSD:12,stock:'not-activated',demo:'/omega-celestial-gift-lab.html'},
{id:'ar-collectible-cards',name:'QR Mixed-Reality Card Starter Kit',lane:'physical-prototype',estimatedRetailUSD:39,stock:'supplier-required',demo:'/bj-stubbs-store.html'},
{id:'vr-comfort-strap',name:'VR Headset Comfort Strap',lane:'accessory',estimatedRetailUSD:39,stock:'supplier-required',demo:'/bj-stubbs-store.html'},
{id:'vr-protective-case',name:'VR Headset Carrying Case',lane:'accessory',estimatedRetailUSD:29,stock:'supplier-required',demo:'/bj-stubbs-store.html'},
{id:'vr-controller-grips',name:'VR Controller Grip Covers',lane:'accessory',estimatedRetailUSD:19,stock:'supplier-required',demo:'/bj-stubbs-store.html'},
{id:'holo-avatar-license',name:'StreetVerse Original Avatar Cosmetic',lane:'digital',estimatedRetailUSD:9,stock:'not-activated',demo:'/bj-stubbs-store.html'},
{id:'creator-site-package',name:'Creator Storefront Demo & Setup',lane:'service',estimatedRetailUSD:149,stock:'booking-required',demo:'/bj-stubbs-store.html'},
] as const
export const NEWUMERICA_CAMPAIGNS=[
{id:'winter-deals',label:'Winter Shopping Event',season:'Nov–Dec 2026',observance:'commercial-only'},
{id:'new-year-upgrades',label:'New Year Creator Upgrade',season:'Jan 2027',observance:'commercial-only'},
{id:'hebrew-festivals',label:'Hebrew Festival Collection',season:'dates-require-calendar-verification',observance:'opt-in-faith'},
{id:'evergreen',label:'Digital Creator Essentials',season:'year-round',observance:'none'},
] as const
/** Scenario estimator only; classification and actual duty quote must come from broker/CBP. */
export function quantumLandedMargin(input:{sale:number;unitCost:number;shipping:number;dutyRate:number;fees:number;returnsReserve:number;marketing:number}){
 const vals=Object.values(input)
 if(vals.some(x=>!Number.isFinite(x)||x<0)||input.dutyRate>5)throw Error('invalid_sourcing_assumptions')
 const duty=input.unitCost*input.dutyRate
 const cost=input.unitCost+input.shipping+duty+input.fees+input.returnsReserve+input.marketing
 return {landedCost:Math.round(cost*100)/100,estimatedContribution:Math.round((input.sale-cost)*100)/100,contributionMarginPct:input.sale?Math.round((input.sale-cost)/input.sale*1000)/10:null,duty,
 requiresBrokerHTSReview:true,notTariffExemption:true}
}
export const SOURCING_GATES={useExisting:'QuantumSourceSupplyChain + QuantumSourcingRuntime',supplierSampleRequired:true,originProofRequired:true,htsClassificationRequired:true,noFalseOrigin:true,noUndervaluation:true,customsBrokerReview:true,productSafetyReview:true,returnsPolicyRequired:true,liveInventoryVerified:true,paidListingOnlyAfterStockAndPaymentValidation:true} as const
