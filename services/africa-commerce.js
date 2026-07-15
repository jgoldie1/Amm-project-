const crypto=require('crypto');

const MARKETS={
  NG:{country:'Nigeria',currency:'NGN',providers:['paystack','flutterwave'],channels:['card','bank','bank_transfer','ussd'],languages:['en','pcm','yo','ig','ha'],lowBandwidth:true},
  GH:{country:'Ghana',currency:'GHS',providers:['paystack','flutterwave'],channels:['card','mobile_money','bank_transfer'],languages:['en','tw'],lowBandwidth:true},
  KE:{country:'Kenya',currency:'KES',providers:['paystack','flutterwave'],channels:['card','mobile_money','bank_transfer'],languages:['en','sw'],lowBandwidth:true},
  ZA:{country:'South Africa',currency:'ZAR',providers:['paystack','flutterwave'],channels:['card','bank_transfer'],languages:['en','zu','xh','af'],lowBandwidth:false}
};

function id(prefix){return `${prefix}_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;}
function clean(value,max=500){return String(value||'').replace(/\s+/g,' ').trim().slice(0,max);}
function market(code='NG'){return MARKETS[String(code).toUpperCase()]||MARKETS.NG;}
function providerFor({country='NG',requested,operation='checkout'}={}){
  const profile=market(country);const preferred=String(requested||'').toLowerCase();
  if(profile.providers.includes(preferred))return preferred;
  if(country==='NG'&&operation==='checkout')return 'paystack';
  return profile.providers[0];
}
function checkoutPlan(input={}){
  const country=String(input.country||'NG').toUpperCase();const profile=market(country);
  const amount=Number(input.amount);if(!Number.isFinite(amount)||amount<=0)throw new Error('A positive amount is required.');
  const channel=clean(input.channel,40)||profile.channels[0];
  if(!profile.channels.includes(channel))throw new Error(`${channel} is not enabled for ${profile.country}.`);
  return {id:id('afr_checkout'),country,market:profile.country,currency:clean(input.currency,3).toUpperCase()||profile.currency,amount,provider:providerFor({country,requested:input.provider}),channel,status:'requires-provider-initialization',customer:{email:clean(input.email,320),phone:clean(input.phone,40),name:clean(input.name,160)},purpose:clean(input.purpose,120)||'marketplace',metadata:input.metadata||{},lowBandwidthMode:input.lowBandwidthMode!==false&&profile.lowBandwidth,webhookRequired:true,createdAt:new Date().toISOString()};
}
function creatorSettlement(input={}){
  const country=String(input.country||'NG').toUpperCase();const profile=market(country);const gross=Number(input.grossAmount);
  if(!Number.isFinite(gross)||gross<=0)throw new Error('A positive gross amount is required.');
  const platformRate=Math.max(0,Math.min(Number(input.platformRate)||0.1,0.5));const taxWithholding=Math.max(0,Math.min(Number(input.taxWithholdingRate)||0,0.5));
  const platformFee=Math.round(gross*platformRate*100)/100;const withholding=Math.round(gross*taxWithholding*100)/100;
  return {id:id('afr_settlement'),ownerId:clean(input.ownerId,120),country,currency:profile.currency,grossAmount:gross,platformFee,withholding,netAmount:Math.round((gross-platformFee-withholding)*100)/100,provider:providerFor({country,requested:input.provider,operation:'payout'}),payoutMethod:clean(input.payoutMethod,40)||'bank',status:'pending-compliance-and-webhook',periodStart:input.periodStart||null,periodEnd:input.periodEnd||null,createdAt:new Date().toISOString()};
}
function businessProfile(input={}){
  const country=String(input.country||'NG').toUpperCase();const profile=market(country);
  return {id:id('afr_business'),ownerId:clean(input.ownerId,120),businessName:clean(input.businessName,180),country,currency:profile.currency,market:profile.country,businessType:clean(input.businessType,80)||'creator',registrationStatus:'unverified',taxStatus:'not-reviewed',kycStatus:'not-started',payoutStatus:'blocked-until-verified',languages:profile.languages,lowBandwidthMode:profile.lowBandwidth,createdAt:new Date().toISOString()};
}
function complianceGate(input={}){const reasons=[];if(input.kycStatus!=='verified')reasons.push('kyc-not-verified');if(input.registrationRequired&&input.registrationStatus!=='verified')reasons.push('business-registration-not-verified');if(input.payoutAccountStatus!=='verified')reasons.push('payout-account-not-verified');if(input.sanctionsStatus&&input.sanctionsStatus!=='clear')reasons.push('sanctions-review-required');return{eligible:reasons.length===0,reasons,manualReview:reasons.length>0};}
function experienceConfig(country='NG'){const profile=market(country);return{country:String(country).toUpperCase(),currency:profile.currency,languages:profile.languages,channels:profile.channels,lowBandwidth:{enabled:profile.lowBandwidth,imageQuality:'adaptive',videoAutoplay:false,offlineQueue:true,textFirstCheckout:true},commerce:{localPricing:true,localCreatorDiscovery:true,regionalDrops:true,bankFriendlyCheckout:true},accessibility:{voicePrompts:true,largeControls:true,oneHandedCheckout:true}};}

module.exports={MARKETS,market,providerFor,checkoutPlan,creatorSettlement,businessProfile,complianceGate,experienceConfig};
