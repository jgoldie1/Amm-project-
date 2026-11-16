// All American Records nationwide distribution and independent chart contracts.
// These are estimation and transparent reporting tools, NOT verified live orders,
// chart accreditation, a payment processor, or a Billboard® partnership.
export const SUGGESTED_DISTRIBUTION_FEE_PERCENT=7;
export const DISTRIBUTION_FEE_MAX_PERCENT=15;
export const PHYSICAL_DISTRIBUTION_POLICY=Object.freeze({
 feeBasis:'physical-merchandise-item-price-before-tax-and-shipping',
 exclusiveWithStudioPlatformShare:true,
 noDoubleFee:true,
 excludedFromFee:['sales tax','fan-paid postage','refunded merchandise'],
 nationalScope:'US domestic service areas only where each approved supplier can deliver',
 conditions:['customer consent for marketing is separate from purchase','supplier manufacturing proof','tracking and return policy','verified payment and refund processing','artist rights and royalty agreement'],
 note:'The default 7% is a proposed price, not an activated platform charge. Merchant/seller terms and processor obligations must be approved first.'
});
const money=n=>Math.round((n+Number.EPSILON)*100)/100;
export function quoteDistributionFee({itemSubtotal,feePercent=SUGGESTED_DISTRIBUTION_FEE_PERCENT,refundedSubtotal=0,alreadyPlatformCharged=false}={}){
 const values=[itemSubtotal,feePercent,refundedSubtotal].map(Number);
 if(values.some(n=>!Number.isFinite(n)||n<0)||feePercent>DISTRIBUTION_FEE_MAX_PERCENT||refundedSubtotal>itemSubtotal)return null;
 const netItemSubtotal=money(itemSubtotal-refundedSubtotal);
 const distributionFee=alreadyPlatformCharged?0:money(netItemSubtotal*feePercent/100);
 return {netItemSubtotal,distributionFee,artistMerchantItemProceedsBeforeOtherCosts:money(netItemSubtotal-distributionFee),feePercent,excluded:['tax','shipping'],alreadyPlatformCharged,estimated:true};
}
export const INDEPENDENT_CHART_CATEGORIES=Object.freeze([
 {id:'physical-albums',title:'Top Physical Albums',metric:'verified delivered non-refunded albums',eligibleFormats:['vinyl','cd','cassette'],defaultWindowDays:7},
 {id:'direct-fan-singles',title:'Direct Fan Singles',metric:'verified unique fulfilled single sales',eligibleFormats:['digital','physical'],defaultWindowDays:7},
 {id:'independent-artists',title:'Independent Artist Momentum',metric:'verified unique purchasers of opt-in independent artists',eligibleFormats:['all'],defaultWindowDays:7},
 {id:'regional',title:'Regional Music Charts',metric:'verified purchased units by consented, coarse geographic region',eligibleFormats:['all'],defaultWindowDays:7}
]);
export function aggregateIndependentMusicCharts(events,{start,end}={}){
 if(!Array.isArray(events)||!Number.isFinite(start)||!Number.isFinite(end)||start>end)return [];
 const saleIds=new Set(),totals=new Map();
 for(const e of events){
  if(!e||!['delivered','refunded','chargeback'].includes(e.status)||!e.trackId||!e.artistId||!e.saleId||!Number.isFinite(e.timestamp)||e.timestamp<start||e.timestamp>end)continue;
  // Candidate sales are verified non-refunded fulfillment records only.
  // Order-level reversals must be applied upstream before chart publication.
  if(e.status!=='delivered'||e.paymentVerified!==true||e.fulfillmentVerified!==true||e.rightsApproved!==true||e.suspicious===true||e.artistOptIn!==true)continue;
  const dedupe=String(e.saleId);
  if(saleIds.has(dedupe))continue;saleIds.add(dedupe);
  const key=String(e.artistId)+'::'+String(e.trackId),now=totals.get(key)||{artistId:e.artistId,trackId:e.trackId,verifiedUnits:0};
  now.verifiedUnits+=1;totals.set(key,now);
 }
 return [...totals.values()].sort((a,b)=>b.verifiedUnits-a.verifiedUnits||String(a.trackId).localeCompare(String(b.trackId)));
}
export const CHART_GOVERNANCE=Object.freeze({
 branding:'All American Independent Music Charts — NOT Billboard charts',
 reporting:'Publish methodology, date window, exclusions, reconciled refunds, artist opt-in and correction process',
 antiFraud:'Exclude self-purchases, bots, fabricated streams and suspicious circular transactions after investigation',
 privacy:'Report aggregates, never customer emails, names or addresses',
 separation:'Advertising and paid placements must not influence editorial ranking',
 status:'Design-only: chart data ingestion, refund reversals, fraud detection and independent verification not yet implemented'
});
