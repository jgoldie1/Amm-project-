// Side-effect-free profit decision support. All values are integer minor units.
const cents=(v,name)=>{if(!Number.isSafeInteger(v)||v<0)throw new RangeError(name);return v;};
export function calculateOrderMargin(input){
 if(!input||typeof input!=='object')throw new TypeError('order required');
 const grossMinor=cents(input.grossMinor,'grossMinor'),refundsMinor=cents(input.refundsMinor??0,'refundsMinor'),chargebacksMinor=cents(input.chargebacksMinor??0,'chargebacksMinor'),fulfillmentMinor=cents(input.fulfillmentMinor??0,'fulfillmentMinor'),processorFeesMinor=cents(input.processorFeesMinor??0,'processorFeesMinor'),shippingMinor=cents(input.shippingMinor??0,'shippingMinor'),commissionBps=cents(input.commissionBps??1500,'commissionBps'),reserveTargetMinor=cents(input.reserveTargetMinor??5000,'reserveTargetMinor');
 if(commissionBps>10000||refundsMinor+chargebacksMinor>grossMinor)throw new RangeError('invalid deductions');
 const netReceiptsMinor=grossMinor-refundsMinor-chargebacksMinor,commissionMinor=Math.floor(netReceiptsMinor*commissionBps/10000);
 // Internal cash allocation, not a separately incurred expense.
 const reserveAllocatedMinor=netReceiptsMinor>=5900?Math.min(reserveTargetMinor,Math.max(0,netReceiptsMinor-commissionMinor)):0;
 const directCostsMinor=fulfillmentMinor+processorFeesMinor+shippingMinor+commissionMinor;
 const contributionMinor=netReceiptsMinor-directCostsMinor,unallocatedCashMinor=contributionMinor-reserveAllocatedMinor;
 return {currency:input.currency??'USD',grossMinor,netReceiptsMinor,commissionMinor,directCostsMinor,contributionMinor,reserveAllocatedMinor,unallocatedCashMinor,marginBps:netReceiptsMinor?Math.round(contributionMinor*10000/netReceiptsMinor):0,profitableBeforeOverhead:contributionMinor>0};
}
export function orderActions(order){
 const result=calculateOrderMargin(order),actions=[];
 if(!order.paymentVerified)actions.push('HOLD_FULFILLMENT_UNVERIFIED_PAYMENT');
 if(!order.customerApproved&&!order.fulfilled)actions.push('REQUEST_CUSTOMER_SCOPE_APPROVAL');
 if(result.contributionMinor<=0)actions.push('REPRICE_OR_REVIEW_COSTS');
 if(result.unallocatedCashMinor<0)actions.push('RESERVE_SHORTFALL_REVIEW');
 if(order.refundOpen||order.disputeOpen||!order.deliveryAccepted)actions.push('HOLD_COMMISSION');
 return {financials:result,actions,commissionReleaseApproved:false};
}
export function summarizeOrders(orders){
 if(!Array.isArray(orders))throw new TypeError('orders required');
 const ids=new Set();let netReceiptsMinor=0,contributionMinor=0,reserveAllocatedMinor=0;
 for(const o of orders){if(typeof o.id!=='string'||!o.id.trim()||ids.has(o.id))throw new Error('duplicate or missing order id');ids.add(o.id);const x=calculateOrderMargin(o);if(x.currency!=='USD')throw new Error('currency conversion not supported');netReceiptsMinor+=x.netReceiptsMinor;contributionMinor+=x.contributionMinor;reserveAllocatedMinor+=x.reserveAllocatedMinor;}
 return {orders:ids.size,netReceiptsMinor,contributionMinor,reserveAllocatedMinor};
}