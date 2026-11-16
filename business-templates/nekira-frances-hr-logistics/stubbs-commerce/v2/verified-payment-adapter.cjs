'use strict';
const crypto=require('node:crypto');
// Test-fixture signed event adapter; NOT Stripe or real payment verification.
function makeAdapter({secret,engine}){
 if(typeof secret!=='string'||Buffer.byteLength(secret)<32)throw Error('A random 32-byte minimum secret is required');
 if(!engine||typeof engine.confirmFromVerifiedAdapter!=='function')throw Error('Missing commerce engine');
 const sign=raw=>crypto.createHmac('sha256',secret).update(raw).digest('hex');
 function handle(raw,signature){
  if(!Buffer.isBuffer(raw)||raw.length>32768)throw Error('Invalid event payload');
  if(typeof signature!=='string'||!/^[0-9a-f]{64}$/i.test(signature))throw Error('Invalid event signature');
  if(!crypto.timingSafeEqual(Buffer.from(sign(raw)),Buffer.from(signature.toLowerCase())))throw Error('Signature mismatch');
  const event=JSON.parse(raw.toString('utf8'));
  if(!event||!['settled','refunded'].includes(event.kind)||event.merchant!=='Stubbs AI'||event.currency!=='USD')throw Error('Event not allowed');
  if(event.kind==='settled')return engine.confirmFromVerifiedAdapter({id:event.id,orderId:event.orderId,verified:true,merchant:event.merchant,amountCents:event.amountCents,currency:event.currency});
  return engine.revokeFromVerifiedAdapter({id:event.id,orderId:event.orderId,verified:true,merchant:event.merchant});
 }
 return{handle,signTestEvent:obj=>{const raw=Buffer.from(JSON.stringify(obj));return{raw,signature:sign(raw)}}};
}
module.exports={makeAdapter};