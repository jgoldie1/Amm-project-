/** Newumerica winter / global sales planning; no live inventory, pricing, customs advice or checkout claims. */
export const NEWUMERICA_WINTER_CATALOG=[
 {id:'omni-deck-digital',name:'Omni Holographic Digital Deck',kind:'digital',priority:1,route:'/bj-stubbs-store.html',inventory:'build-first',rights:'original'},
 {id:'qr-holo-cards',name:'QR-Enabled Physical Omni Cards',kind:'physical',priority:2,route:'/bj-stubbs-store.html',inventory:'supplier-and-prototype-required',rights:'original'},
 {id:'creator-gift-fx',name:'Omega Holographic Gift Effects',kind:'digital',priority:3,route:'/omega-celestial-gift-lab.html',inventory:'production-render-required',rights:'original'},
 {id:'xr-avatar-packs',name:'Original XR Avatar & Creature Packs',kind:'digital',priority:4,route:'/bj-stubbs-store.html',inventory:'3d-asset-validation-required',rights:'original'},
 {id:'vr-headset-accessories',name:'VR Headset Accessories',kind:'physical',priority:5,route:'/bj-stubbs-store.html',inventory:'approved-reseller-supplier-required',rights:'brand-authorized'},
 {id:'ar-tabletop-kit',name:'AR Tabletop Starter Kit',kind:'hybrid',priority:6,route:'/bj-stubbs-store.html',inventory:'prototype-and-device-testing-required',rights:'original'},
 {id:'music-creator-bundle',name:'MusicVerse Creator Gift Bundle',kind:'digital',priority:7,route:'/bj-stubbs-store.html',inventory:'music-clearance-required',rights:'licensed'},
 {id:'world-builder',name:'StreetVerse World Builder Pack',kind:'digital',priority:8,route:'/streetverse-business.html',inventory:'asset-delivery-required',rights:'original'},
] as const
export const NEWUMERICA_SEASONAL_CAMPAIGNS=[
 {id:'winter-value',name:'Winter Value Event',audience:'general',window:'Oct–Feb'},
 {id:'black-friday',name:'Black Friday Marketplace Offers',audience:'general',window:'Nov 27 2026'},
 {id:'after-season',name:'New Year Creator Upgrade',audience:'general',window:'Jan–Feb'},
 {id:'hebrew-feasts',name:'Hebrew Feast Community Collection',audience:'opt-in',window:'calendar-verified-per-event'},
] as const
export type SourcingQuote={supplierId:string;itemId:string;currency:'USD';unitCostCents:number;units:number;shippingCents:number;dutyEstimateCents:number;brokerAndFeesCents:number;paymentFeesCents:number;returnsReserveCents:number;otherCents:number;leadTimeDays:number;verification:'quoted'|'verified'}
const finiteNonnegative=(v:number)=>Number.isFinite(v)&&v>=0&&Number.isInteger(v)
export function quantumSourcingCompare(q:SourcingQuote){
 const fields=[q.unitCostCents,q.units,q.shippingCents,q.dutyEstimateCents,q.brokerAndFeesCents,q.paymentFeesCents,q.returnsReserveCents,q.otherCents,q.leadTimeDays]
 if(!fields.every(finiteNonnegative)||q.units===0||q.units>100000||q.currency!=='USD')throw Error('invalid_sourcing_quote')
 const landedTotalCents=q.unitCostCents*q.units+q.shippingCents+q.dutyEstimateCents+q.brokerAndFeesCents+q.paymentFeesCents+q.returnsReserveCents+q.otherCents
 if(!Number.isSafeInteger(landedTotalCents))throw Error('sourcing_total_overflow')
 return {itemId:q.itemId,supplierId:q.supplierId,landedTotalCents,landedPerUnitCents:Math.ceil(landedTotalCents/q.units),leadTimeDays:q.leadTimeDays,customsClassificationVerified:false,tariffLegallyConfirmed:false,estimatedOnly:true}
}
export function estimateUnitContribution(saleCents:number,landedUnitCents:number,fulfillmentCents:number,marketingCents:number){
 if(![saleCents,landedUnitCents,fulfillmentCents,marketingCents].every(finiteNonnegative))throw Error('invalid_margin_inputs')
 const margin=saleCents-landedUnitCents-fulfillmentCents-marketingCents
 return {contributionCents:margin,contributionMargin:saleCents?margin/saleCents:null,notNetProfit:true}
}
export const NEWUMERICA_SOURCING_GATES={supplierIdentityRequired:true,tradeDocumentationRequired:true,customsClassificationRequired:true,countryOfOriginRequired:true,noTariffEvasion:true,noUndervaluation:true,productSafetyTesting:true,resaleRights:true,accessibleDemo:true,preorderOnlyWithTruthfulFulfillment:true,noRealSalesWithoutVerifiedCheckout:true} as const
