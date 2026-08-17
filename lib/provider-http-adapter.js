'use strict';
const crypto=require('crypto');
const {adapterConfig}=require('./provider-registry');
const clean=(v,m=2000)=>String(v??'').trim().slice(0,m);
function key(v){return crypto.createHash('sha256').update(String(v)).digest('hex');}
async function callProvider({providerId,path='',method='GET',body,idempotencyKey,timeoutMs=12000,headers={}}={}){
 const cfg=adapterConfig(providerId);const suffix=clean(path,1000);if(suffix.includes('://'))throw new Error('provider_path_must_be_relative');const url=new URL(suffix.replace(/^\//,''),`${cfg.baseUrl}/`);
 if(url.origin!==new URL(cfg.baseUrl).origin)throw new Error('provider_origin_escape_blocked');
 const requestId=key(`${providerId}|${Date.now()}|${Math.random()}`).slice(0,24),idem=clean(idempotencyKey,240)||null;
 const r=await fetch(url,{method:String(method||'GET').toUpperCase(),headers:{accept:'application/json','content-type':'application/json',authorization:`Bearer ${cfg.token}`,'x-tryamm-request-id':requestId,...(idem?{'idempotency-key':idem}:{}),...headers},body:body===undefined?undefined:JSON.stringify(body),signal:AbortSignal.timeout(Math.max(1000,Math.min(30000,Number(timeoutMs)||12000)))});
 const text=await r.text();let data;try{data=text?JSON.parse(text):null}catch{data={raw:text.slice(0,4000)}}
 if(!r.ok){const e=new Error(data?.error||data?.message||`provider_${r.status}`);e.status=r.status;e.provider=providerId;e.requestId=requestId;throw e;}
 return {provider:providerId,requestId,status:r.status,data};
}
function verifyHmacWebhook({rawBody,signature,secret,algorithm='sha256'}={}){if(!rawBody||!signature||!secret)return false;const expected=crypto.createHmac(algorithm,secret).update(rawBody).digest('hex');const supplied=String(signature).replace(/^sha256=/i,'').trim();try{return crypto.timingSafeEqual(Buffer.from(expected,'hex'),Buffer.from(supplied,'hex'))}catch{return false}}
module.exports={callProvider,verifyHmacWebhook};
