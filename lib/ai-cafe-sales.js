'use strict';
const crypto=require('node:crypto');
const LOCALES=new Set(['en','es','fr','pt']);
function ensure(store){for(const key of ['aiCafeLeads','aiCafeQuotes','aiCafeSales','aiCafeChainOutbox'])if(!Array.isArray(store[key]))store[key]=[];return store}
function id(prefix){return prefix+'_'+crypto.randomBytes(12).toString('hex')}
function text(value,max=200){return String(value||'').trim().slice(0,max)}
function createLead(store,input={}){
  ensure(store);
  if(input.consent!==true)throw Object.assign(new Error('Privacy consent required'),{status:400});
  const email=text(input.email,200).toLowerCase();
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))throw Object.assign(new Error('Valid email required'),{status:400});
  const interest=text(input.interest,300);
  if(!interest)throw Object.assign(new Error('Service interest required'),{status:400});
  const now=new Date().toISOString();
  const lead={id:id('cafe_lead'),businessId:text(input.businessId,90),email,interest,locale:LOCALES.has(input.locale)?input.locale:'en',country:text(input.country,2).toUpperCase(),campaignId:text(input.campaignId,100),marketingOptIn:input.marketingOptIn===true,consentAt:now,status:'new',createdAt:now};
  store.aiCafeLeads.push(lead);return lead;
}
function approveQuote(store,{leadId,priceCents,currency='usd',description,approvedBy}){
  ensure(store);const lead=store.aiCafeLeads.find(x=>x.id===leadId);
  if(!lead)throw Object.assign(new Error('Lead not found'),{status:404});
  const amount=Number(priceCents),c=text(currency,3).toLowerCase();
  if(!Number.isSafeInteger(amount)||amount<50||amount>100000000)throw Object.assign(new Error('Valid priceCents required'),{status:400});
  if(!['usd'].includes(c))throw Object.assign(new Error('Currency not yet supported for checkout'),{status:400});
  if(store.aiCafeQuotes.some(x=>x.leadId===leadId&&x.status==='approved'))throw Object.assign(new Error('Active quote already exists'),{status:409});
  const quote={id:id('cafe_quote'),leadId,priceCents:amount,currency:c,description:text(description,300)||lead.interest,approvedBy,approvedAt:new Date().toISOString(),status:'approved',stripeSessionId:null};
  store.aiCafeQuotes.push(quote);lead.status='quoted';return quote;
}
function applyVerifiedCafeCheckout(store,session,{eventId=null}={}){
  ensure(store);if(session?.metadata?.kind!=='ai-cafe-service')return {handled:false};
  const sid=text(session.id,200),quote=store.aiCafeQuotes.find(x=>x.id===session.metadata.quoteId);
  if(!sid||!quote||quote.leadId!==session.metadata.leadId)throw Object.assign(new Error('Checkout metadata does not match approved quote'),{status:422});
  if(quote.stripeSessionId!==sid)throw Object.assign(new Error('Checkout session not linked to quote'),{status:422});
  if(session.payment_status!=='paid')return {handled:true,applied:false,reason:'NOT_PAID'};
  if(session.mode!=='payment'||Number(session.amount_total)!==quote.priceCents||session.currency!==quote.currency)throw Object.assign(new Error('Verified payment does not match quote'),{status:422});
  const existing=store.aiCafeSales.find(x=>x.stripeSessionId===sid);
  if(existing)return {handled:true,applied:false,reason:'ALREADY_APPLIED',sale:existing};
  const lead=store.aiCafeLeads.find(x=>x.id===quote.leadId);
  if(!lead)throw Object.assign(new Error('Missing lead'),{status:422});
  const sale={id:id('cafe_sale'),leadId:lead.id,quoteId:quote.id,stripeSessionId:sid,stripeEventId:eventId,amountCents:quote.priceCents,currency:quote.currency,verifiedProvider:'stripe',verifiedAt:new Date().toISOString()};
  const payload={event:'ai-cafe.sale.verified',saleId:sale.id,stripeSessionId:sid,amountCents:sale.amountCents,currency:sale.currency};
  const payloadSha256=crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex');
  const anchor={id:id('cafe_anchor'),saleId:sale.id,eventType:payload.event,payloadSha256,status:'PENDING_SERVER_CHAIN_ANCHOR',createdAt:sale.verifiedAt};
  store.aiCafeSales.push(sale);store.aiCafeChainOutbox.push(anchor);quote.status='paid';lead.status='customer';
  return {handled:true,applied:true,sale,anchor};
}
function summary(store){ensure(store);return {leads:store.aiCafeLeads.length,approvedQuotes:store.aiCafeQuotes.filter(x=>x.status==='approved').length,verifiedSales:store.aiCafeSales.length,verifiedGrossCents:store.aiCafeSales.reduce((s,x)=>s+x.amountCents,0),pendingChainAnchors:store.aiCafeChainOutbox.filter(x=>x.status!=='ANCHORED').length,chainAnchorsVerified:store.aiCafeChainOutbox.filter(x=>x.status==='ANCHORED').length}}
module.exports={createLead,approveQuote,applyVerifiedCafeCheckout,summary,ensure};