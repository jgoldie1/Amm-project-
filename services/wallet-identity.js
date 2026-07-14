const crypto=require('crypto');
function id(prefix){return `${prefix}_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;}
function clean(v,max=500){return String(v||'').replace(/\s+/g,' ').trim().slice(0,max);}
function money(v){const n=Number(v);if(!Number.isFinite(n)||n<0)throw new Error('Amount must be non-negative.');return Math.round(n*100);}

function createWallet(input={}){
  return {id:id('wallet'),ownerId:clean(input.ownerId,120),currency:clean(input.currency,3).toUpperCase()||'USD',cashBalanceMinor:0,tokenBalance:0,status:'active',createdAt:new Date().toISOString()};
}
function ledgerEntry(input={}){
  const type=['credit','debit','hold','release','refund','payout'].includes(input.type)?input.type:'debit';
  return {id:id('ledger'),walletId:clean(input.walletId,120),type,asset:clean(input.asset,20)||'cash',amountMinor:money(input.amount),currency:clean(input.currency,3).toUpperCase()||'USD',provider:clean(input.provider,40)||'internal',providerReference:clean(input.providerReference,180),orderId:clean(input.orderId,120)||null,status:'pending',idempotencyKey:clean(input.idempotencyKey,180)||id('idem'),createdAt:new Date().toISOString()};
}
function marketplacePayment(input={}){
  const amountMinor=money(input.amount);
  return {id:id('pay'),buyerId:clean(input.buyerId,120),sellerId:clean(input.sellerId,120),orderId:clean(input.orderId,120),amountMinor,currency:clean(input.currency,3).toUpperCase()||'USD',method:['stripe','flutterwave','paystack','apple-pay','google-pay','wallet-balance','token-pack'].includes(input.method)?input.method:'stripe',status:'requires-provider-confirmation',capture:'webhook-only',platformFeeMinor:Math.round(amountMinor*Math.max(0,Math.min(Number(input.platformFeeRate)||0.1,0.5))),createdAt:new Date().toISOString()};
}
function identityProfile(input={}){
  return {id:id('identity'),ownerId:clean(input.ownerId,120),legalNameStatus:'unverified',ageStatus:'unknown',country:clean(input.country,2).toUpperCase(),kycProvider:clean(input.kycProvider,80)||null,kycStatus:'not-started',driverCredentialStatus:'not-linked',passportCredentialStatus:'not-linked',governmentIdStored:false,rawBiometricsStored:false,consent:Boolean(input.consent),createdAt:new Date().toISOString()};
}
function credentialRecord(input={}){
  const type=['driver-license','passport','state-id','student-id','creator-id','vendor-id','driver-platform-permit'].includes(input.type)?input.type:'creator-id';
  return {id:id('credential'),ownerId:clean(input.ownerId,120),type,issuer:clean(input.issuer,160),issuerDid:clean(input.issuerDid,300)||null,credentialHash:clean(input.credentialHash,256),status:'pending-verification',expiresAt:input.expiresAt||null,displayInWallet:Boolean(input.displayInWallet),officialGovernmentCredential:Boolean(input.officialGovernmentCredential),createdAt:new Date().toISOString()};
}
function walletPass(input={}){
  return {id:id('pass'),ownerId:clean(input.ownerId,120),passType:['membership','loyalty','event-ticket','creator-id','vendor-id','game-pass'].includes(input.passType)?input.passType:'membership',platforms:['apple-wallet','google-wallet'],status:'requires-provider-signing',barcodePayload:clean(input.barcodePayload,500),nfcEnabled:false,createdAt:new Date().toISOString()};
}
function tapToPayCapability(input={}){
  return {devicePlatform:clean(input.devicePlatform,40),supportedProvider:['stripe-terminal','adyen','square','other-approved'].includes(input.provider)?input.provider:'stripe-terminal',merchantOnboardingRequired:true,deviceAttestationRequired:true,regionEligibilityRequired:true,nfcAccess:'provider-sdk-only',cardDataHandledByTryAMM:false,status:'integration-contract'};
}
function complianceGate({identity,wallet,merchant=false}={}){
  const reasons=[];
  if(!identity?.consent)reasons.push('identity-consent-required');
  if(identity?.kycStatus!=='verified')reasons.push('kyc-not-verified');
  if(wallet?.status!=='active')reasons.push('wallet-not-active');
  if(merchant&&identity?.legalNameStatus!=='verified')reasons.push('merchant-legal-name-not-verified');
  return {eligible:reasons.length===0,reasons,notice:'A TryAMM credential is not a legal replacement for a government-issued driver license or passport unless an authorized government issuer and jurisdiction explicitly support it.'};
}
module.exports={createWallet,ledgerEntry,marketplacePayment,identityProfile,credentialRecord,walletPass,tapToPayCapability,complianceGate};