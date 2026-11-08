// Read-only OpenSRS Horizon (test environment) adapter.
// LOOKUP and GET_PRICE ONLY. No live registration, DNS edits, transfers or renewals.
import {createHash} from 'node:crypto';

export const HORIZON_URL='https://horizon.opensrs.net:55443/';
const allowed=new Set(['LOOKUP','GET_PRICE']);
const md5=x=>createHash('md5').update(x,'utf8').digest('hex');

export function validateDomainName(input){
 const d=String(input||'').trim().toLowerCase();
 if(d.length>253||d.length<4||d.endsWith('.')||d.includes('..'))throw Error('invalid_domain');
 const parts=d.split('.');
 if(parts.length<2||parts.some(p=>p.length<1||p.length>63||!/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(p))||
    !/^[a-z][a-z0-9-]{1,62}$/.test(parts.at(-1)))throw Error('invalid_domain');
 return d;
}
export function makeHorizonXml(action,domain){
 const a=String(action).toUpperCase(),d=validateDomainName(domain);
 if(!allowed.has(a))throw Error('read_only_actions_only');
 const extra=a==='GET_PRICE'?
  '<item key="period">1</item><item key="reg_type">new</item>':'<item key="no_cache">0</item>';
 return '<?xml version="1.0" encoding="UTF-8"?>'+
  '<OPS_envelope><header><version>0.9</version></header><body><data_block><dt_assoc>'+
  '<item key="protocol">XCP</item><item key="object">DOMAIN</item>'+
  '<item key="action">'+a+'</item><item key="attributes"><dt_assoc>'+
  '<item key="domain">'+d+'</item>'+extra+
  '</dt_assoc></item></dt_assoc></data_block></body></OPS_envelope>';
}
export function signHorizonXml(xml,apiKey){
 if(typeof apiKey!=='string'||apiKey.length<8)throw Error('sandbox_key_missing');
 // Required by the legacy OpenSRS XML protocol, which must travel over HTTPS.
 return md5(md5(xml+apiKey)+apiKey);
}
function item(xml,key){
 const m=xml.match(new RegExp('<item\\s+key=["\\x27]'+key+'["\\x27]\\s*>([^<]{0,400})<\\/item>','i'));
 return m?.[1]?.trim()??null;
}
export function parseHorizonReply(xml,action){
 if(typeof xml!=='string'||xml.length>64000||!/<OPS_envelope>/i.test(xml)||/<!ENTITY|<!DOCTYPE/i.test(xml))throw Error('unexpected_horizon_response');
 const success=item(xml,'is_success'),code=item(xml,'response_code');
 if(success!=='1'||!/^\d{3}$/.test(code||''))throw Error('horizon_query_failed');
 if(action==='LOOKUP'){
  const status=item(xml,'status');
  if(!['available','taken'].includes(status)||!['210','211'].includes(code))throw Error('horizon_lookup_unrecognized');
  if((status==='available')!==(code==='210'))throw Error('horizon_lookup_conflicting');
  return {status,availability:status==='available'?'TEST_AVAILABLE':'TEST_TAKEN'};
 }
 if(action==='GET_PRICE'){
  const price=item(xml,'price');
  if(!price||!/^\d{1,7}(?:\.\d{1,2})?$/.test(price))throw Error('horizon_price_unrecognized');
  const cents=Math.round(Number(price)*100);
  if(!Number.isSafeInteger(cents)||cents<0)throw Error('horizon_price_unrecognized');
  return {wholesaleTestCents:cents,unit:'USD',quoteIsLive:false};
 }
 throw Error('read_only_actions_only');
}
export async function runHorizonSandboxLookup(domain,{username,apiKey,transport=fetch,timeoutMs=10000}={}){
 const d=validateDomainName(domain);
 if(typeof username!=='string'||!/^[a-zA-Z0-9._-]{2,100}$/.test(username))throw Error('sandbox_username_missing');
 if(typeof apiKey!=='string'||apiKey.length<8)throw Error('sandbox_key_missing');
 async function call(action){
  const xml=makeHorizonXml(action,d),signature=signHorizonXml(xml,apiKey);
  const response=await transport(HORIZON_URL,{
   method:'POST',
   headers:{'content-type':'text/xml','x-username':username,'x-signature':signature},
   body:xml,signal:AbortSignal.timeout(Math.max(1000,Math.min(timeoutMs,15000))),
   redirect:'error',cache:'no-store'
  });
  if(!response.ok)throw Error('horizon_network_failure');
  const body=await response.text();
  return parseHorizonReply(body,action);
 }
 const lookup=await call('LOOKUP');
 const price=lookup.status==='available'?await call('GET_PRICE'):null;
 return {domain:d,environment:'HORIZON_TEST_ONLY',...lookup,...price,
  registered:false,paid:false,dnsChanged:false,quoteIsLive:false};
}
