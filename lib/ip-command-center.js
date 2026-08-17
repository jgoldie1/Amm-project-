'use strict';
const crypto=require('crypto');
const clean=(v,m=1000)=>String(v??'').replace(/\s+/g,' ').trim().slice(0,m);
const id=p=>`${p}_${crypto.randomBytes(8).toString('hex')}`;
const TYPES=new Set(['patent-candidate','design-patent','trade-secret','trademark','copyright','defensive-publication','review-required']);
const STATUSES=new Set(['draft','confidential','searching-prior-art','attorney-review','approved-to-file','filed','abandoned','licensed']);
function createInvention(input={}){
 if(!clean(input.title,200))throw new Error('title_required');
 return {id:input.id||id('inv'),title:clean(input.title,200),summary:clean(input.summary,8000),inventors:Array.isArray(input.inventors)?input.inventors.map(x=>clean(x,160)).filter(Boolean):[],contributors:Array.isArray(input.contributors)?input.contributors.map(x=>clean(x,160)).filter(Boolean):[],type:TYPES.has(input.type)?input.type:'review-required',status:STATUSES.has(input.status)?input.status:'confidential',publicDisclosure:input.publicDisclosure===true,disclosureDate:clean(input.disclosureDate,40)||null,sourceRefs:Array.isArray(input.sourceRefs)?input.sourceRefs.slice(0,100):[],createdAt:new Date().toISOString(),controls:{confidential:true,externalAiAllowed:false,publicMarketingAllowed:false,legalReviewRequired:true}};
}
function triage(invention={}){
 const flags=[]; if(invention.publicDisclosure)flags.push('PUBLIC_DISCLOSURE_REVIEW_URGENT'); if(!invention.inventors?.length)flags.push('INVENTORSHIP_REQUIRED'); if(!invention.summary)flags.push('TECHNICAL_DISCLOSURE_INCOMPLETE');
 const route=invention.type==='trade-secret'?'TRADE_SECRET_CONTROLS':invention.type==='trademark'?'TRADEMARK_SEARCH':invention.type==='copyright'?'COPYRIGHT_REVIEW':'PRIOR_ART_SEARCH';
 return {inventionId:invention.id,route,flags,actions:['preserve evidence','record human conception/contributions','search prior art','classify protection strategy','legal review before filing/public disclosure'],automatedFilingAllowed:false};
}
function priorArtQueries(invention={}){const text=`${invention.title||''} ${invention.summary||''}`.toLowerCase();const words=[...new Set(text.replace(/[^a-z0-9 ]/g,' ').split(/\s+/).filter(w=>w.length>4))].slice(0,18);return {googlePatents:words.slice(0,10).join(' '),uspto:words.slice(0,12).join(' '),keywords:words,includeClaims:true,includeCpc:true,includeNonPatentLiterature:true};}
function protectionPlan(items=[]){return items.map(i=>{const inv=i.id?i:createInvention(i);return {invention:inv,triage:triage(inv),search:priorArtQueries(inv)}})}
module.exports={TYPES,STATUSES,createInvention,triage,priorArtQueries,protectionPlan};
