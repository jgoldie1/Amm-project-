'use strict';
// Secure Svix signature verification for Resend inbound notifications.
// Metadata only; never interprets external email as instructions.
const crypto=require('node:crypto');
function fail(msg,status=400){return Object.assign(new Error(msg),{status})}
function verifySvix({raw,id,timestamp,signatures,secret,now=Date.now()}){
 if(!Buffer.isBuffer(raw)||!raw.length||raw.length>1024*1024)throw fail('Invalid raw webhook payload');
 if(!/^[a-zA-Z0-9_-]{8,100}$/.test(String(id||'')))throw fail('Invalid webhook event ID');
 if(!/^\d{9,12}$/.test(String(timestamp||'')))throw fail('Invalid webhook timestamp');
 if(Math.abs(now-Number(timestamp)*1000)>5*60*1000)throw fail('Webhook timestamp expired');
 if(!String(secret||'').startsWith('whsec_'))throw fail('Webhook secret unavailable',503);
 let key;try{key=Buffer.from(secret.slice(6),'base64')}catch{throw fail('Invalid webhook secret',503)}
 if(key.length<16)throw fail('Webhook secret is invalid',503);
 const expected=crypto.createHmac('sha256',key).update(id+'.'+timestamp+'.').update(raw).digest();
 const presented=String(signatures||'').split(/\s+/).filter(x=>x.startsWith('v1,')).map(x=>x.slice(3));
 let passed=false;
 for(const item of presented){
  let bytes;try{bytes=Buffer.from(item,'base64')}catch{continue}
  if(bytes.length===expected.length&&crypto.timingSafeEqual(bytes,expected))passed=true;
 }
 if(!passed)throw fail('Webhook signature verification failed',401);
 let event;try{event=JSON.parse(raw.toString('utf8'))}catch{throw fail('Malformed event JSON')}
 if(!event||typeof event!=='object')throw fail('Invalid event');
 return event;
}
function safeInbound(event){
 if(event?.type!=='email.received')return null;
 const p=event.data||{},emailId=String(p.email_id||'');
 if(!/^[a-zA-Z0-9_-]{8,110}$/.test(emailId))throw fail('Invalid provider email id');
 const recipients=Array.isArray(p.to)?p.to.map(x=>String(x).trim().toLowerCase()).filter(x=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(x)):[]; 
 if(!recipients.length||recipients.length>20)throw fail('Invalid inbound recipients');
 return {providerId:emailId,recipients,subject:String(p.subject||'').slice(0,200),sender:String(p.from||'').slice(0,300)};
}
async function processInbound({event,deliveryId,db,fetcher=globalThis.fetch,apiKey=process.env.RESEND_API_KEY}){
 const incoming=safeInbound(event);
 if(!incoming)return {ignored:true};
 if(!apiKey)throw fail('Mail receiving API not configured',503);
 const accounts=[];
 for(const address of incoming.recipients){
  const rows=await db.select('quantum_mail_accounts','address=eq.'+encodeURIComponent(address)+'&incoming_enabled=eq.true&status=eq.verified&select=*&limit=1');
  if(rows?.[0])accounts.push(rows[0]);
 }
 if(!accounts.length)return {ignored:true,reason:'NO_VERIFIED_RECIPIENT'};
 // Provider content must be fetched with server-side credentials after verifying event signature.
 const received=await fetcher('https://api.resend.com/emails/receiving/'+encodeURIComponent(incoming.providerId),{
  headers:{Authorization:'Bearer '+apiKey,'Content-Type':'application/json'}
 });
 if(!received.ok)throw fail('Unable to fetch verified inbound email',502);
 const details=await received.json();
 const bodyText=String(details?.text||'').slice(0,20000);
 let accepted=0;
 for(const account of accounts){
  const eventRef=deliveryId+':'+account.id;
  const exists=await db.select('quantum_mail_messages','provider_event_id=eq.'+encodeURIComponent(eventRef)+'&select=id&limit=1');
  if(exists?.length)continue;
  await db.insert('quantum_mail_messages',{
   owner_id:account.owner_id,account_id:account.id,direction:'inbound',status:'quarantined',
   from_address:incoming.sender,to_addresses:[account.address],subject:incoming.subject,body_text:bodyText,
   provider_message_id:null,provider_event_id:eventRef,threat_status:'unreviewed'
  });
  accepted++;
 }
 return {accepted,quarantined:true,providerId:incoming.providerId};
}
module.exports={verifySvix,safeInbound,processInbound};
