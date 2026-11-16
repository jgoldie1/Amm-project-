// TRYAMM 3PL Quote Comparison — planning/sandbox only.
// Inputs must be comparable vendor quotes; this module never orders warehouse services,
// changes real inventory, quotes carrier transit time or executes payment.
export const STORAGE_CLASSES=Object.freeze(['ambient','refrigerated','frozen']);
export const PILOT_HUBS=Object.freeze([
 {id:'memphis-tn',city:'Memphis',state:'TN',role:'inland fulfillment candidate'},
 {id:'atlanta-ga',city:'Atlanta',state:'GA',role:'southeast fulfillment candidate'},
 {id:'savannah-ga',city:'Savannah',state:'GA',role:'import receiving candidate'},
 {id:'chicago-il',city:'Chicago',state:'IL',role:'local demand and grocery candidate'}
]);
const money=x=>Number.isSafeInteger(x)&&x>=0;
const pos=x=>Number.isSafeInteger(x)&&x>=0;
export function validateScenario(s){
 const e=[];
 if(!s||typeof s!=='object')return ['scenario_missing'];
 for(const k of ['monthlyOrders','monthlyInboundPallets','averageStoragePallets','monthlyReturns'])if(!pos(s[k]))e.push(k+'_invalid');
 if(!STORAGE_CLASSES.includes(s?.storageClass))e.push('storage_class_invalid');
 if(s?.category==='grocery'&&s?.storageClass!=='ambient'&&s?.foodColdChainRequired!==true)e.push('grocery_cold_chain_required');
 if(s?.monthlyReturns>s?.monthlyOrders)e.push('returns_exceed_orders');
 return e;
}
export function validateQuote(q,s){
 const errors=validateScenario(s);
 if(!q||typeof q!=='object')return [...errors,'quote_missing'];
 if(typeof q.id!=='string'||!q.id.trim())errors.push('quote_id_missing');
 if(!PILOT_HUBS.some(h=>h.id===q.hubId))errors.push('unknown_hub');
 for(const k of ['monthlyMinimumCents','onboardingCents','receivingPalletCents','storagePalletCents','pickPackOrderCents','shippingPerOrderCents','packagingPerOrderCents','returnHandlingCents','insurancePerMonthCents','otherMonthlyCents'])if(!money(q[k]))errors.push(k+'_invalid');
 if(q.quoteVerified!==true)errors.push('quote_unverified');
 if(q.currency!=='USD')errors.push('currency_must_be_USD');
 if(s?.storageClass!=='ambient'&&(q.coldChainCertified!==true||q.temperatureMonitoring!==true||q.recallSupport!==true))errors.push('cold_chain_ineligible');
 if(s?.category==='grocery'&&q.foodHandlingApproved!==true)errors.push('food_handling_ineligible');
 return errors;
}
export function estimateQuote(q,s){
 const errors=validateQuote(q,s);if(errors.length)return {eligible:false,errors,id:q?.id??null};
 const receiving=s.monthlyInboundPallets*q.receivingPalletCents,storage=s.averageStoragePallets*q.storagePalletCents;
 const picking=s.monthlyOrders*q.pickPackOrderCents,shipping=s.monthlyOrders*q.shippingPerOrderCents;
 const packaging=s.monthlyOrders*q.packagingPerOrderCents,returns=s.monthlyReturns*q.returnHandlingCents;
 const beforeMinimum=receiving+storage+picking+shipping+packaging+returns+q.insurancePerMonthCents+q.otherMonthlyCents;
 const recurringCents=Math.max(beforeMinimum,q.monthlyMinimumCents);
 // Onboarding amortization is shown separately; never silently treat as recurring expense.
 const costPerOrderCents=s.monthlyOrders?Math.ceil(recurringCents/s.monthlyOrders):null;
 return {eligible:true,id:q.id,hubId:q.hubId,recurringCents,onboardingCents:q.onboardingCents,costPerOrderCents,components:{receiving,storage,picking,shipping,packaging,returns,insurance:q.insurancePerMonthCents,other:q.otherMonthlyCents,minimumTopUp:recurringCents-beforeMinimum},source:'vendor_verified_input',isRealOffer:false};
}
export function compareQuotes(quotes,scenario){
 if(!Array.isArray(quotes))throw new TypeError('quotes must be an array');
 const rows=quotes.map(q=>estimateQuote(q,scenario));
 return {scenario,eligible:rows.filter(r=>r.eligible).sort((a,b)=>a.recurringCents-b.recurringCents||a.id.localeCompare(b.id)),ineligible:rows.filter(r=>!r.eligible),notAContract:true};
}
export function assessFulfillmentReadiness(x){
 const errors=[];
 if(x?.agreementSigned!==true)errors.push('warehouse_agreement_unsigned');
 if(x?.warehouseReceiptVerified!==true)errors.push('warehouse_receipt_unverified');
 if(x?.inventoryAuthoritative!==true)errors.push('inventory_not_authoritative');
 if(x?.stockReserved!==true)errors.push('stock_not_reserved');
 if(x?.paymentAuthorized!==true)errors.push('payment_unverified');
 if(x?.carrierServiceApproved!==true)errors.push('carrier_not_approved');
 if(x?.category==='grocery'&&x?.foodHandlingApproved!==true)errors.push('food_handling_not_approved');
 if(x?.storageClass!=='ambient'&&x?.coldChainVerified!==true)errors.push('cold_chain_unverified');
 return {ready:errors.length===0,errors};
}
