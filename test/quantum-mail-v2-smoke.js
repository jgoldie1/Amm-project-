'use strict';
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const mail=require('../lib/quantum-mail-v2');
const incoming=require('../lib/quantum-mail-inbound');
const verified=mail.validateDraft({to:['customer@example.com'],subject:'A quote',body:'Hello'});
assert.deepEqual(verified.to_addresses,['customer@example.com']);
assert.throws(()=>mail.validateDraft({to:'not-an-email',subject:'Hi',body:'Body'}),/Invalid recipients/);
assert.throws(()=>mail.validateDraft({to:'customer@example.com',subject:'Bad\r\nHeader',body:'Body'}),/single line/);
assert.equal(mail.sendingReady({status:'verified',outgoing_enabled:true,verified_at:'2026-11-04'}),false,'Never send without explicit server flags');
const key=Buffer.alloc(32,23);
const secret='whsec_'+key.toString('base64');
const now=Date.now();
const stamp=Math.floor(now/1000).toString();
const event={type:'email.received',data:{email_id:'abc123456789',from:'sender@example.com',to:['info@example.com'],subject:'Question'}};
const raw=Buffer.from(JSON.stringify(event));
const id='msg_123456789';
const signature='v1,'+crypto.createHmac('sha256',key).update(id+'.'+stamp+'.').update(raw).digest('base64');
assert.equal(incoming.verifySvix({raw,id,timestamp:stamp,signatures:signature,secret,now}).type,'email.received');
assert.throws(()=>incoming.verifySvix({raw:Buffer.from('changed'),id,timestamp:stamp,signatures:signature,secret,now}),/signature/);
assert.throws(()=>incoming.verifySvix({raw,id,timestamp:String(Number(stamp)-3600),signatures:signature,secret,now}),/expired/);
assert.equal(incoming.safeInbound(event).recipients[0],'info@example.com');
(async()=>{
 const accounts=[{id:'11111111-2222-4333-8444-555555555555',owner_id:'customer_1',address:'info@example.com'}];
 const records=[];
 const fakeDb={
  select:async(table,query)=>{
   if(table==='quantum_mail_accounts')return query.includes('info%40example.com')?accounts:[];
   if(table==='quantum_mail_messages')return records.filter(r=>query.includes(encodeURIComponent(r.provider_event_id)));
   return [];
  },
  insert:async(_table,row)=>{records.push(row);return [row]}
 };
 const fakeFetch=async()=>({ok:true,json:async()=>({text:'Inbound message from customer'})});
 const first=await incoming.processInbound({event,deliveryId:id,db:fakeDb,fetcher:fakeFetch,apiKey:'test'});
 assert.equal(first.accepted,1);assert.equal(records[0].status,'quarantined');assert.equal(records[0].owner_id,'customer_1');
 const duplicate=await incoming.processInbound({event,deliveryId:id,db:fakeDb,fetcher:fakeFetch,apiKey:'test'});
 assert.equal(duplicate.accepted,0);assert.equal(records.length,1);
 const sent={id:'22222222-2222-4222-8222-222222222222',owner_id:'customer_1',account_id:accounts[0].id,direction:'outbound',status:'sent',to_addresses:['contact@example.com'],provider_message_id:'provided_email_12345'};
 const held=[];
 const eventDb={
  select:async(table,query)=>table==='quantum_mail_messages'?[sent]:table==='quantum_mail_suppressions'?held.filter(r=>query.includes(encodeURIComponent(r.recipient))):[],
  update:async(_table,_query,patch)=>{Object.assign(sent,patch);return [sent]},
  insert:async(_table,row)=>{held.push(row);return [row]}
 };
 const handled=await incoming.processDeliveryEvent({event:{type:'email.bounced',data:{email_id:sent.provider_message_id}},db:eventDb});
 assert.equal(handled.status,'bounced');
 assert.equal(held[0].recipient,'contact@example.com');
 const replay=await incoming.processDeliveryEvent({event:{type:'email.bounced',data:{email_id:sent.provider_message_id}},db:eventDb});
 assert.equal(replay.idempotent,true);
 assert.equal(held.length,1);
 console.log('Quantum Mail v2 webhook, isolation, draft, bounce suppression and replay regression: PASS');
})().catch(e=>{console.error(e);process.exitCode=1});
