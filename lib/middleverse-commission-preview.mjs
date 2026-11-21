// Side-effect-free financial preview: DO NOT use as a replacement for a signed Stripe webhook.
export function allocation({grossMinor,refundedMinor=0,rateBps=1500,reserveMinor=5000}) {
 for (const [name,value] of Object.entries({grossMinor,refundedMinor,rateBps,reserveMinor})) {
  if (!Number.isSafeInteger(value)||value<0) throw new RangeError(name);
 }
 if (refundedMinor>grossMinor||rateBps>10000) throw new RangeError('invalid amounts');
 const eligibleMinor=grossMinor-refundedMinor;
 const commissionMinor=Math.floor(eligibleMinor*rateBps/10000);
 const savedReserveMinor=eligibleMinor>=5900?Math.min(reserveMinor,eligibleMinor-commissionMinor):0;
 return {eligibleMinor,commissionMinor,reserveMinor:savedReserveMinor,remainingMinor:eligibleMinor-commissionMinor-savedReserveMinor};
}
export function releaseEligible(x){return x.paid===true&&x.fulfilled===true&&x.reviewed===true&&x.refundHoldElapsed===true&&x.marketCleared===true&&x.disputed!==true;}
