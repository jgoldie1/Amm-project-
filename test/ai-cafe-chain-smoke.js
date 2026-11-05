'use strict';
const assert=require('node:assert/strict');
const {anchorSale}=require('../lib/ai-cafe-chain');
(async()=>{
 const store={aiCafeSales:[{id:'sale_1',verifiedProvider:'stripe'}]};
 const anchor={id:'anchor_1',saleId:'sale_1',status:'PENDING_SERVER_CHAIN_ANCHOR',eventType:'ai-cafe.sale.verified',payloadSha256:'a'.repeat(64)};
 let called=false;
 const mockRpc=async (name,params)=>{called=true;assert.equal(name,'anchor_internal_chain_event');assert.equal(params.p_resource_ref,'sale_1');assert.equal(params.p_payload_hash,anchor.payloadSha256);return {eventId:anchor.id,blockHash:'b'.repeat(64),blockNumber:9,committedAt:'2026-11-04T00:00:00Z'}};
 assert.equal((await anchorSale(store,anchor,{ready:false,rpc:mockRpc})).status,'AUDIT_HOLD');
 assert.equal(called,false);
 assert.equal(anchor.status,'PENDING_SERVER_CHAIN_ANCHOR');
 const result=await anchorSale(store,anchor,{ready:true,rpc:mockRpc});
 assert.equal(result.status,'ANCHORED');
 assert.equal(anchor.blockNumber,9);
 assert.equal((await anchorSale(store,anchor,{ready:true,rpc:mockRpc})).status,'ANCHORED');
 console.log('AI Cafe audited chain anchor smoke: PASS');
})().catch(e=>{console.error(e);process.exitCode=1});
