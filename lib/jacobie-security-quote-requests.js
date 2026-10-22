'use strict';
// Quote requests are separate from customer accounts, payment capture and subscriptions.
// In-memory proof of workflow only. Never accept client-provided "payment verified" flags.
const {quote}=require('./jacobie-security-service-catalog');
function createSecurityQuoteRequests({registry,verifyRequester}={}){
  if(!registry||typeof registry.get!=='function'||typeof verifyRequester!=='function')throw new TypeError('Registry and identity verifier required');
  const requests=new Map();let seq=0;
  function request({businessId,planId,actor}={}){
    const business=registry.get(businessId);
    if(!business)return{ok:false,error:'business-not-registered'};
    if(business.status!=='pending-verification'&&business.status!=='verified')return{ok:false,error:'business-inactive'};
    // verifyRequester must be server-side and verify the session + ownership/authorized delegate.
    if(verifyRequester({actor,business})!==true)return{ok:false,error:'not-authorized'};
    const priced=quote({businessId,planId});
    if(!priced.ok)return priced;
    const id='jq-'+(++seq);
    const record=Object.freeze({id,businessId,planId,monthlyCents:priced.quote.monthlyCents,status:'requested',provider:'jacobie-vision'});
    requests.set(id,record);
    return{ok:true,request:record};
  }
  function get({id,actor}={}){
    const record=requests.get(id);
    if(!record)return{ok:false,error:'not-found'};
    const business=registry.get(record.businessId);
    if(!business||verifyRequester({actor,business})!==true)return{ok:false,error:'not-authorized'};
    return{ok:true,request:record};
  }
  return Object.freeze({request,get});
}
module.exports={createSecurityQuoteRequests};
