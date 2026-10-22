'use strict';
// Quote-only catalog. Never activates services, invoices or commissions.
const PLANS=Object.freeze({
  starter:Object.freeze({label:'Security Starter',monthlyCents:2900,features:['security-onboarding','monthly-summary']}),
  shield:Object.freeze({label:'Business Shield',monthlyCents:7900,features:['security-onboarding','monthly-summary','monitoring-review','backup-check']}),
  ai:Object.freeze({label:'AI and Call Center Shield',monthlyCents:14900,features:['security-onboarding','monthly-summary','ai-data-isolation-review','call-consent-review']})
});
function quote({businessId,planId,approved=false}={}){
  if(typeof businessId!=='string'||!/^[a-z][a-z0-9-]{0,63}$/.test(businessId))return{ok:false,error:'invalid-business'};
  if(!Object.hasOwn(PLANS,String(planId||'')))return{ok:false,error:'invalid-plan'};
  const plan=PLANS[planId];
  return{ok:true,quote:{businessId,provider:'jacobie-vision',planId,monthlyCents:plan.monthlyCents,currency:'USD',features:[...plan.features],status:approved?'awaiting-contract-and-payment':'illustrative-only',activated:false,charged:false}};
}
function verifiedRevenue({quote:quoted,agreementSigned=false,processorVerified=false,settledAmountCents=0}={}){
  if(!quoted||quoted.activated!==false||quoted.provider!=='jacobie-vision'||!Object.hasOwn(PLANS,String(quoted.planId||'')))return{ok:false,error:'invalid-quote'};
  if(agreementSigned!==true||processorVerified!==true)return{ok:false,error:'verification-required'};
  if(!Number.isSafeInteger(settledAmountCents)||settledAmountCents<=0)return{ok:false,error:'invalid-settlement'};
  // This only validates inputs. Never records or pays money.
  return{ok:true,provider:'jacobie-vision',grossVerifiedCents:settledAmountCents,payoutStatus:'not-initiated'};
}
module.exports={PLANS,quote,verifiedRevenue};
