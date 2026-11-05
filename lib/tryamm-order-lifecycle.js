'use strict';
// Website OS order contracts. No browser action may assert payment or delivery.
const crypto=require('node:crypto');
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const STATUSES=new Set(['quote-pending','quote-approved','customer-accepted','payment-pending','paid-verified','building','review-ready','delivered','cancelled','refunded']);
const PACKAGE_PRICE_CENTS=Object.freeze({preview:49900,experience:125000,'digital-twin':250000});
const no=(message,status=400)=>Object.assign(new Error(message),{status});
function requireUuid(value,name){if(!UUID.test(String(value||'')))throw no('Valid '+name+' required');return String(value)}
function validateProposal(input={}){
 const campaignId=requireUuid(input.campaignId,'campaign'),leadId=requireUuid(input.leadId,'lead');
 const packageId=String(input.packageId||'');
 if(!Object.hasOwn(PACKAGE_PRICE_CENTS,packageId))throw no('Choose a supported paid website package');
 const description=String(input.description||'').trim().slice(0,1200);
 if(description.length<20)throw no('Written deliverables and scope required');
 const terms=String(input.terms||'').trim().slice(0,3000);
 if(terms.length<20)throw no('Written delivery, revision, refund and support terms required');
 return {campaignId,leadId,packageId,amount_cents:PACKAGE_PRICE_CENTS[packageId],currency:'usd',description,terms};
}
function newOrder(ownerId,input){
 const x=validateProposal(input);
 return {id:crypto.randomUUID(),owner_id:ownerId,campaign_id:x.campaignId,lead_id:x.leadId,
 package_id:x.packageId,price_cents:x.amount_cents,currency:x.currency,description:x.description,terms:x.terms,
 status:'quote-pending',customer_accepted_at:null,verified_paid_at:null,stripe_session_id:null,
 fulfillment_approved_at:null,delivered_at:null,created_at:new Date().toISOString(),updated_at:new Date().toISOString()};
}
function ownerTransition(order,next,{actorRole='member',verifiedPayment=false,customerAcceptance=false,deliveryEvidence=false}={}){
 if(!order||!STATUSES.has(order.status)||!STATUSES.has(next))throw no('Invalid order state');
 const allowed={
  'quote-pending':['quote-approved','cancelled'],
  'quote-approved':['customer-accepted','cancelled'],
  'customer-accepted':['payment-pending','cancelled'],
  'payment-pending':['paid-verified','cancelled'],
  'paid-verified':['building','refunded'],
  'building':['review-ready','refunded'],
  'review-ready':['delivered','building','refunded'],
  'delivered':['refunded'],
  'cancelled':[],
  'refunded':[]
 };
 if(!allowed[order.status].includes(next))throw no('Invalid order transition',409);
 if(actorRole!=='admin')throw no('Owner permission required',403);
 if(next==='customer-accepted'&&customerAcceptance!==true)throw no('Customer acceptance proof required',403);
 if(next==='paid-verified'&&verifiedPayment!==true)throw no('Provider-verified payment required',403);
 if(next==='delivered'&&(deliveryEvidence!==true||!order.verified_paid_at))throw no('Verified payment and customer delivery evidence required',403);
 const patch={status:next,updated_at:new Date().toISOString()};
 if(next==='paid-verified')patch.verified_paid_at=new Date().toISOString();
 if(next==='delivered')patch.delivered_at=new Date().toISOString();
 return patch;
}
function customerSummary(order){
 return {id:order.id,packageId:order.package_id,priceCents:order.price_cents,currency:order.currency,description:order.description,terms:order.terms,
 status:order.status,customerAcceptedAt:order.customer_accepted_at,paidVerifiedAt:order.verified_paid_at,deliveredAt:order.delivered_at};
}
module.exports={validateProposal,newOrder,ownerTransition,customerSummary,PACKAGE_PRICE_CENTS};
