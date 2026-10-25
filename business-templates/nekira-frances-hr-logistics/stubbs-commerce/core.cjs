/* Stubbs AI commerce domain core: dependency-free simulation. Not a payment processor. */
'use strict';
const { randomUUID, createHash } = require('node:crypto');
const catalog = Object.freeze([
 {sku:'LOGISTICS-SITE', name:'Logistics Website', priceCents:19900,license:'single-business'},
 {sku:'HR-SITE', name:'HR & Recruitment Website', priceCents:14900,license:'single-business'},
 {sku:'STORE-SITE',name:'Storefront Starter',priceCents:9900,license:'single-business'}
]);
class Commerce {
 constructor(){this.orders=new Map();this.licenses=new Map();this.events=new Set();this.partners=new Map([['nekira',{label:'Nekira Frances HR Logistics',active:true}],['stubbs',{label:'Stubbs AI',active:true}]]);this.subscriptions=new Map();}
 listCatalog(){return catalog.map(x=>({...x}));}
 createOrder({sku,partnerId='stubbs',scoutId=null,buyerId}){
  const product=catalog.find(x=>x.sku===sku); if(!product)throw Error('Unknown SKU');
  if(!this.partners.get(partnerId)?.active)throw Error('Unauthorized partner');
  if(typeof buyerId!=='string'||!/^[a-zA-Z0-9_-]{3,80}$/.test(buyerId))throw Error('Invalid buyer ID');
  if(scoutId!==null&& !/^[a-zA-Z0-9_-]{3,80}$/.test(scoutId))throw Error('Invalid scout ID');
  const order={id:randomUUID(),sku,amountCents:product.priceCents,currency:'USD',buyerId,partnerId,scoutId,status:'pending',merchantOfRecord:'Stubbs AI',createdAt:new Date().toISOString()};
  this.orders.set(order.id,order);return {...order};
 }
 // Verification flag is an explicit fixture; production MUST replace this function with
 // provider-verified signatures, event ids, expected merchant, amount and settled state.
 simulateSettledPayment({orderId,eventId,amountCents,merchant,verifiedByFixture=false}){
  if(!verifiedByFixture)throw Error('Provider signature verification required');
  const order=this.orders.get(orderId);if(!order)throw Error('Missing order');
  if(this.events.has(eventId))return {idempotent:true,order:{...order}};
  if(order.status!=='pending')throw Error('Order already finalized');
  if(merchant!=='Stubbs AI'||amountCents!==order.amountCents)throw Error('Payment mismatch');
  if(typeof eventId!=='string'||eventId.length<5)throw Error('Invalid event');
  order.status='paid';order.settlementEvent=eventId;this.events.add(eventId);
  const license={id:randomUUID(),orderId,sku:order.sku,buyerId:order.buyerId,type:'single-business',status:'active',issuedAt:new Date().toISOString()};
  this.licenses.set(license.id,license);
  return {idempotent:false,order:{...order},license:{...license}};
 }
 refund({orderId,eventId,verifiedByFixture=false}){
  if(!verifiedByFixture)throw Error('Verified refund event required');
  const order=this.orders.get(orderId);if(!order||order.status!=='paid')throw Error('No settled sale');
  if(this.events.has(eventId))return {idempotent:true};
  if(typeof eventId!=='string'||eventId.length<5)throw Error('Invalid event');
  order.status='refunded';this.events.add(eventId);
  for(const l of this.licenses.values())if(l.orderId===orderId)l.status='revoked';
  return {idempotent:false};
 }
 enableSubscription({buyerId,service,monthlyCents}){
  if(!['hosting','maintenance','ai-call-center'].includes(service))throw Error('Unknown service');
  if(!Number.isInteger(monthlyCents)||monthlyCents<0)throw Error('Bad rate');
  const sub={id:randomUUID(),buyerId,service,monthlyCents,status:'draft-not-billed'};
  this.subscriptions.set(sub.id,sub);return {...sub};
 }
 partnerView(partnerId){if(!this.partners.get(partnerId)?.active)throw Error('Unknown partner');return [...this.orders.values()].filter(o=>o.partnerId===partnerId).map(o=>({id:o.id,sku:o.sku,status:o.status,attribution:{partnerId:o.partnerId,scoutId:o.scoutId},amountCents:o.amountCents}));}
 royaltyLedger(){return [...this.orders.values()].filter(o=>o.status==='paid').map(o=>({orderId:o.id,grossCents:o.amountCents,merchant:'Stubbs AI',partnerId:o.partnerId,scoutId:o.scoutId,commissionStatus:'not-configured',commissionCents:0}));}
}
module.exports={Commerce,catalog};
