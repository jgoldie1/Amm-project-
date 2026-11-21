/** All American Records physical direct-to-fan cost model.
 * No payment authority, tax advice, invented printer quotes or live orders.
 */
export const PHYSICAL_RELEASE_FORMATS=Object.freeze([
 {id:'vinyl-12',label:'12-inch vinyl LP',requiredAssets:['approved audio master','vinyl cutting/pre-master check','side A/B sequence and runtime','jacket artwork and print proof','rights and sample clearances','test-pressing approval']},
 {id:'cd',label:'Audio CD',requiredAssets:['approved audio master','CD-compatible production master','tracklist and printed booklet artwork','ISRC/UPC assignment plan','rights and sample clearances','production proof approval']},
 {id:'bundle',label:'Vinyl + CD bundle',requiredAssets:['approved LP and CD masters','physical inventory and packaging','artwork proofs','rights and sample clearances']}
]);
export function calculateDirectMusicMargin({units,pricePerUnit,manufacturingTotal,artworkTotal,packagingPerUnit,postagePerUnit,paymentFeePercent,paymentFeeFixed,marketingTotal,royaltyPerUnit,refundReservePerUnit}){
 const values=[units,pricePerUnit,manufacturingTotal,artworkTotal,packagingPerUnit,postagePerUnit,paymentFeePercent,paymentFeeFixed,marketingTotal,royaltyPerUnit,refundReservePerUnit].map(Number);
 if(values.some(x=>!Number.isFinite(x)||x<0)||!Number.isInteger(values[0])||values[0]<1||values[0]>100000||values[6]>100)return null;
 const [qty,price,manufacturing,artwork,packaging,postage,feePercent,feeFixed,marketing,royalty,reserve]=values;
 const gross=qty*price,perTransactionFee=price*feePercent/100+feeFixed;
 const variablePerUnit=packaging+postage+perTransactionFee+royalty+reserve;
 const fixed=manufacturing+artwork+marketing;
 const totalCost=fixed+qty*variablePerUnit;
 const net=gross-totalCost;
 const contribution=price-variablePerUnit;
 const breakEvenUnits=contribution>0?Math.ceil(fixed/contribution):null;
 const precision=v=>Math.round((v+Number.EPSILON)*100)/100;
 return {gross:precision(gross),variablePerUnit:precision(variablePerUnit),fixed:precision(fixed),totalCost:precision(totalCost),netBeforeTax:precision(net),breakEvenUnits,marginPercent:gross>0?precision(net/gross*100):null,
  note:'Estimates only. Shipping charged separately, sales taxes, returns, storage, duties, licensing advances, chargebacks and other fees may change results.'};
}
export const FAN_MARKETING_STAGES=Object.freeze([
 {id:'audience',label:'Fan permission',instruction:'Obtain consent for email/SMS; separate purchase receipts from marketing consent. Make opt-out straightforward.'},
 {id:'launch',label:'Artist-owned landing page',instruction:'Release page on TRYAMM with cover art, approved song preview, release story, format options and clear shipping/preorder details.'},
 {id:'reach',label:'Direct demand',instruction:'Use concert QR codes, Holo Reels, artist-owned socials, livestream links, partner shows and permission-based fan email.'},
 {id:'fulfill',label:'Physical production',instruction:'Collect quotes and proofs; confirm masters and rights; place pressing orders only with approved funds and fulfillment terms.'},
 {id:'measure',label:'Fan relationship and reporting',instruction:'Track qualified visits, conversion, delivered orders, refunds, reorder demand, artist earnings and repeat fan purchases.'}
]);
