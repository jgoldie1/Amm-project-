import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {HORIZON_URL,validateDomainName,makeHorizonXml,signHorizonXml,parseHorizonReply,runHorizonSandboxLookup}
 from '../api/_lib/opensrs-horizon.js';
import fs from 'node:fs';

const reply=(code,details)=>'<OPS_envelope><body><data_block><dt_assoc>'+
 '<item key="action">REPLY</item><item key="object">DOMAIN</item>'+
 '<item key="response_code">'+code+'</item><item key="is_success">1</item>'+
 Object.entries(details).map(([k,v])=>'<item key="'+k+'">'+v+'</item>').join('')+
 '</dt_assoc></data_block></body></OPS_envelope>';
const available=reply(210,{status:'available'});
const taken=reply(211,{status:'taken'});
const price=reply(200,{price:'12.35'});
test('only valid DNS names accepted; commands cannot purchase or change DNS',()=>{
 assert.equal(validateDomainName('  MySite.COM '),'mysite.com');
 for(const bad of ['-x.com','x..com','bad.com/evil','example.com?x=1','x.com\n','x.com<tag>','a',''])assert.throws(()=>validateDomainName(bad));
 for(const action of ['SW_REGISTER','REGISTER','SET_DNS','TRANSFER','RENEW','DELETE'])assert.throws(()=>makeHorizonXml(action,'sample.com'),/read_only/);
 assert.match(makeHorizonXml('LOOKUP','my-site.net'),/<item key="action">LOOKUP<\/item>/);
 assert.match(makeHorizonXml('GET_PRICE','my-site.net'),/<item key="period">1<\/item>/);
});
test('OpenSRS legacy signature is double MD5 of exact request and private test key',()=>{
 const payload=makeHorizonXml('LOOKUP','mysite.com'),key='sandbox-test-secret-do-not-use';
 const expected=createHash('md5').update(createHash('md5').update(payload+key).digest('hex')+key).digest('hex');
 assert.equal(signHorizonXml(payload,key),expected);
});
test('lookup uses only Horizon TLS, returns clear TEST result and test wholesale',async()=>{
 const seen=[];
 const mock=async (url,options)=>{
  seen.push({url,options});
  assert.equal(url,HORIZON_URL);
  assert.equal(options.method,'POST');
  assert.equal(options.headers['x-username'],'test-reseller');
  assert.equal(options.cache,'no-store');
  assert.equal(options.redirect,'error');
  assert.ok(/^https:\/\/horizon\.opensrs\.net:55443\/$/.test(url));
  assert.doesNotMatch(options.body,/SW_REGISTER|SET_DNS|TRANSFER/);
  return {ok:true,text:async()=>options.body.includes('GET_PRICE')?price:available};
 };
 const r=await runHorizonSandboxLookup('sample.com',{username:'test-reseller',apiKey:'sandbox-test-secret-do-not-use',transport:mock});
 assert.equal(seen.length,2);
 assert.equal(r.environment,'HORIZON_TEST_ONLY');
 assert.equal(r.availability,'TEST_AVAILABLE');
 assert.equal(r.wholesaleTestCents,1235);
 assert.equal(r.quoteIsLive,false);
 assert.equal(r.paid,false);
 assert.equal(r.registered,false);
 assert.equal(r.dnsChanged,false);
 assert.ok(!JSON.stringify(r).includes('sandbox-test-secret'));
});
test('taken test domain never triggers price lookup',async()=>{
 let count=0;
 const r=await runHorizonSandboxLookup('sample.com',{username:'test-reseller',apiKey:'sandbox-test-secret-do-not-use',transport:async()=>{count++;return{ok:true,text:async()=>taken}}});
 assert.equal(count,1);
 assert.equal(r.availability,'TEST_TAKEN');
 assert.equal(r.wholesaleTestCents,undefined);
});
test('malformed, contradictory, DTD, premium-unpriced or unauthenticated results fail closed',()=>{
 for(const xml of ['bad','<!DOCTYPE malicious><OPS_envelope></OPS_envelope>',reply(211,{status:'available'}),reply(200,{status:'available'}),reply(211,{status:'gone'})]){
  assert.throws(()=>parseHorizonReply(xml,'LOOKUP'));
 }
 for(const xml of [reply(200,{price:'abc'}),reply(200,{price:'-10'}),reply(200,{status:'available'}),reply(200,{price:'9999999999999'})]){
  assert.throws(()=>parseHorizonReply(xml,'GET_PRICE'));
 }
});
test('endpoint owner-only and never changes real domain records or charges',()=>{
 const code=fs.readFileSync(new URL('../api/domains/horizon-check.js',import.meta.url),'utf8');
 assert.match(code,/RESELLER_ADMIN_REQUIRED/);
 assert.match(code,/TRYAMM_DOMAIN_RESELLER_ADMIN_EMAILS/);
 assert.match(code,/TRYAMM_OPENSRS_HORIZON_ENABLED/);
 assert.match(code,/canCharge:false,canRegister:false,canTransfer:false,canEditDns:false/);
 assert.doesNotMatch(code,/rr-n1-tor\.opensrs\.net|SW_REGISTER|STRIPE_SECRET_KEY|SET_DNS/);
});
