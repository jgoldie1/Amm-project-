'use strict';
const crypto=require('node:crypto');
const clean=(value,max)=>String(value??'').replace(/[\x00-\x1f\x7f]/g,' ').trim().slice(0,max);
const idPattern=/^[0-9a-f-]{36}$/i;
const emailPattern=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const checks=Object.freeze(['ownerApproval','mediaRights','claimProof','captionReview','accessibility','landingPage','contactPath','trackingConsent','renderQA','publicationApproval']);
function validateCampaign(input={}){
 const projectId=clean(input.projectId,40),name=clean(input.name,120),offer=clean(input.offer,200),landingUrl=clean(input.landingUrl,500);
 if(!idPattern.test(projectId))throw Object.assign(new Error('Saved website project required'),{status:400});
 if(!name||!offer)throw Object.assign(new Error('Campaign name and offer required'),{status:400});
 let url;try{url=new URL(landingUrl)}catch{throw Object.assign(new Error('Valid HTTPS storefront URL required'),{status:400})}
 if(url.protocol!=='https:'||url.username||url.password||url.port||url.hash||!url.hostname.includes('.')||/^(localhost|.*\.local|.*\.internal|.*\.test|.*\.invalid)$/i.test(url.hostname))
 throw Object.assign(new Error('Public HTTPS storefront URL required'),{status:400});
 return {projectId,name,offer,landingUrl:url.href,source:clean(input.source||'holo-reel',40),status:'draft'};
}
function gate(record={}){
 const evidence=record.evidence||{};
 const details=checks.map(key=>({key,passed:evidence[key]?.passed===true&&typeof evidence[key]?.reference==='string'&&evidence[key].reference.trim().length>=8}));
 return {ready:details.every(x=>x.passed),passed:details.filter(x=>x.passed).length,total:details.length,details};
}
function validateLead(input={}){
 if(input.consent!==true)throw Object.assign(new Error('Privacy consent required'),{status:400});
 if(input.website!=='')throw Object.assign(new Error('Request rejected'),{status:400}); // honeypot
 const email=clean(input.email,200).toLowerCase(),interest=clean(input.interest,500);
 if(!emailPattern.test(email)||!interest)throw Object.assign(new Error('Valid email and inquiry required'),{status:400});
 return {email,interest,marketingOptIn:input.marketingOptIn===true};
}
function measurements({visits=0,leads=0,quotes=0,paidSales=0,verifiedGrossCents=0}={}){
 const safe=n=>Number.isSafeInteger(n)&&n>=0?n:0;
 const v=safe(visits),l=safe(leads),q=safe(quotes),s=safe(paidSales),gross=safe(verifiedGrossCents);
 return {visits:v,leads:l,approvedQuotes:q,verifiedSales:s,verifiedGrossCents:gross,
  visitorToLeadRate:v?l/v:null,leadToPaidRate:l?s/l:null,
  notice:'Only first-party consented visits, durable leads, owner-approved quotes and provider-verified payments may count.'};
}
function newCampaign(ownerId,input){
 const checked=validateCampaign(input);
 return {id:crypto.randomUUID(),owner_id:ownerId,...checked,rights_reviewed:false,evidence:{},created_at:new Date().toISOString()};
}
module.exports={validateCampaign,validateLead,gate,measurements,newCampaign,checks};
