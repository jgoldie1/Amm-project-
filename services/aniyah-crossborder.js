const crypto=require('crypto');
function id(prefix){return `${prefix}_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;}
function clean(v,max=500){return String(v||'').replace(/\s+/g,' ').trim().slice(0,max);}
const CORRIDORS={
  'US-NG':{from:'USD',to:'NGN',providers:['flutterwave','paystack','approved-bank-partner'],methods:['bank','card','wallet'],requires:['kyc','sanctions','purpose-of-payment']},
  'NG-US':{from:'NGN',to:'USD',providers:['flutterwave','approved-bank-partner'],methods:['bank','wallet'],requires:['kyc','aml-review','source-of-funds']},
  'GB-NG':{from:'GBP',to:'NGN',providers:['flutterwave','approved-bank-partner'],methods:['bank','card'],requires:['kyc','sanctions']},
  'EU-NG':{from:'EUR',to:'NGN',providers:['flutterwave','approved-bank-partner'],methods:['bank','card'],requires:['kyc','sanctions']},
  'NG-GH':{from:'NGN',to:'GHS',providers:['flutterwave','approved-bank-partner'],methods:['bank','mobile-money'],requires:['kyc','aml-review']},
  'NG-KE':{from:'NGN',to:'KES',providers:['flutterwave','approved-bank-partner'],methods:['bank','mobile-money'],requires:['kyc','aml-review']}
};
function corridor(input={}){
  const key=`${clean(input.fromCountry,2).toUpperCase()}-${clean(input.toCountry,2).toUpperCase()}`;
  return {key,config:CORRIDORS[key]||null,supported:Boolean(CORRIDORS[key]),notice:'Availability, currencies, limits and methods require current provider and regulatory confirmation.'};
}
function quote(input={}){
  const sourceAmount=Number(input.sourceAmount);
  const rate=Number(input.fxRate);
  if(!Number.isFinite(sourceAmount)||sourceAmount<=0)throw new Error('A positive source amount is required.');
  if(!Number.isFinite(rate)||rate<=0)throw new Error('A positive provider FX rate is required.');
  const feeRate=Math.max(0,Math.min(Number(input.feeRate)||.015,.15));
  const fixedFee=Math.max(0,Number(input.fixedFee)||0);
  const fee=sourceAmount*feeRate+fixedFee;
  const convertible=Math.max(0,sourceAmount-fee);
  return {id:id('quote'),sourceCurrency:clean(input.sourceCurrency,3).toUpperCase(),destinationCurrency:clean(input.destinationCurrency,3).toUpperCase(),sourceAmount,fxRate:rate,fee:Number(fee.toFixed(2)),destinationAmount:Number((convertible*rate).toFixed(2)),expiresAt:new Date(Date.now()+10*60*1000).toISOString(),providerRateRequired:true,createdAt:new Date().toISOString()};
}
function transfer(input={}){
  const amount=Number(input.sourceAmount);
  if(!Number.isFinite(amount)||amount<=0)throw new Error('A positive transfer amount is required.');
  return {id:id('xfer'),ownerId:clean(input.ownerId,120),recipientId:clean(input.recipientId,120)||null,fromCountry:clean(input.fromCountry,2).toUpperCase(),toCountry:clean(input.toCountry,2).toUpperCase(),sourceCurrency:clean(input.sourceCurrency,3).toUpperCase(),destinationCurrency:clean(input.destinationCurrency,3).toUpperCase(),sourceAmount:amount,purpose:clean(input.purpose,160),provider:clean(input.provider,80)||'unselected',providerReference:null,status:'compliance-review',escrowRequired:Boolean(input.escrowRequired),travelRuleDataRequired:Boolean(input.travelRuleDataRequired),createdAt:new Date().toISOString()};
}
function complianceGate(input={}){
  const reasons=[];
  if(input.kycStatus!=='verified')reasons.push('sender-kyc-required');
  if(input.recipientStatus!=='verified')reasons.push('recipient-verification-required');
  if(input.sanctionsStatus!=='clear')reasons.push('sanctions-screening-required');
  if(!input.purpose)reasons.push('payment-purpose-required');
  if(Number(input.amount)>=Number(input.enhancedDueDiligenceThreshold||10000)&&input.sourceOfFundsStatus!=='verified')reasons.push('source-of-funds-required');
  return {eligible:reasons.length===0,reasons,manualReview:reasons.some(r=>r.includes('sanctions')||r.includes('source-of-funds')),notice:'This gate supports compliance workflows and does not itself authorize money transmission.'};
}
function recipient(input={}){
  return {id:id('recipient'),ownerId:clean(input.ownerId,120),type:['individual','business','creator','vendor'].includes(input.type)?input.type:'individual',displayName:clean(input.displayName,160),country:clean(input.country,2).toUpperCase(),currency:clean(input.currency,3).toUpperCase(),payoutMethod:clean(input.payoutMethod,40),providerRecipientReference:clean(input.providerRecipientReference,180)||null,status:'pending-verification',rawBankDataStored:false,createdAt:new Date().toISOString()};
}
module.exports={CORRIDORS,corridor,quote,transfer,complianceGate,recipient};