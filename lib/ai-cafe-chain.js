'use strict';
const supabase=require('./supabase-rest');
function auditGate(){
 return process.env.BLOCKCHAIN_ENABLED==='true'&&
   String(process.env.BLOCKCHAIN_AUDIT_STATUS||'').toUpperCase()==='PASSED'&&
   /^[a-f0-9]{64}$/i.test(process.env.BLOCKCHAIN_AUDIT_REPORT_SHA256||'')&&
   String(process.env.BLOCKCHAIN_RELEASE_APPROVED_BY||'').trim().length>=2;
}
async function anchorSale(store,anchor,{rpc=supabase.rpc,ready=auditGate()}={}){
 if(!anchor||anchor.status==='ANCHORED')return {status:anchor?.status||'NOT_FOUND'};
 if(!ready)return {status:'AUDIT_HOLD'};
 if(!supabase.configured()&&rpc===supabase.rpc)return {status:'SUPABASE_NOT_CONFIGURED'};
 if(anchor.status!=='PENDING_SERVER_CHAIN_ANCHOR')return {status:'INVALID_STATE'};
 if(!/^[a-f0-9]{64}$/.test(anchor.payloadSha256))return {status:'INVALID_HASH'};
 const sale=(store.aiCafeSales||[]).find(s=>s.id===anchor.saleId);
 if(!sale||sale.verifiedProvider!=='stripe')return {status:'UNVERIFIED_SALE'};
 const result=await rpc('anchor_internal_chain_event',{
   p_event_id:anchor.id,p_event_type:anchor.eventType,
   p_resource_ref:sale.id,p_payload_hash:anchor.payloadSha256
 });
 const receipt=Array.isArray(result)?result[0]:result;
 if(!receipt||!(/^[a-f0-9]{64}$/i.test(String(receipt.blockHash||'')))||receipt.eventId!==anchor.id)throw Error('Chain returned invalid receipt');
 anchor.status='ANCHORED';anchor.blockHash=receipt.blockHash;anchor.blockNumber=receipt.blockNumber;anchor.committedAt=receipt.committedAt;
 return {status:'ANCHORED',blockHash:anchor.blockHash,blockNumber:anchor.blockNumber};
}
module.exports={auditGate,anchorSale};
