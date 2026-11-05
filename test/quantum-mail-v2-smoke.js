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
 console.log('Quantum Mail v2 webhook, isolation, draft, spam-quarantine and replay regression: PASS');
})().catch(e=>{console.error(e);process.exitCode=1});
