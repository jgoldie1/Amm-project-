'use strict';
// Prices are calculated from real quoted costs. This module does not issue quotations.
function quote(input) {
  const keys=['product','privateLabel','packaging','freightDuty','fulfillment','paymentFees','returnsReserve','affiliate','supportReserve'];
  for(const k of keys) if(!Number.isFinite(input[k])||input[k]<0) throw Error('Invalid nonnegative cost: '+k);
  const target=input.targetMargin;
  if(!Number.isFinite(target)||target<0||target>=1) throw Error('Margin must be between 0 and 1');
  const fixed=keys.reduce((a,k)=>a+input[k],0);
  const selling=fixed/(1-target);
  return {estimatedSalePrice:Math.ceil(selling*100)/100,totalVariableCost:fixed,
    estimatedContribution:Math.ceil(selling*100)/100-fixed,
    achievedContributionMargin:(Math.ceil(selling*100)/100-fixed)/(Math.ceil(selling*100)/100||1),
    note:'Illustrative contribution only; excludes omitted overhead, taxes, unexpected costs, and warranty exposure.'};
}
module.exports={quote};
