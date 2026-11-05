'use strict';
/**
 * TRYAMM 11/11 evidence gate. Never interprets a file or planned product as live.
 * Intake accepts the existing 30-site inventory; never regenerates or renames it.
 */
const TARGET=30;
const TEMPLATE_TARGET=500;
const GATES=Object.freeze([
  ['inventory','Existing 30-site inventory mapped and preserved'],
  ['free_offer','Free website scope and terms approved'],
  ['templates','500-template catalog audited'],
  ['lead_intake','Customer inquiry and consent tested'],
  ['sales','Approved quote and lead-to-order journey tested'],
  ['payments','Stripe test checkout, webhook and refund reconciled'],
  ['storage','Durable database persistence and isolation tested'],
  ['chain','Verified sale-to-Layer-2 receipt tested after audit'],
  ['ai','Ollama/StubbsAI quality, fallback and spending limits tested'],
  ['international','Language, price, policy and country compliance reviewed'],
  ['launch','Security, accessibility, mobile, uptime and public deployment tested']
]);
function validSite(s){
  return s&&typeof s==='object'&&typeof s.id==='string'&&s.id.trim()&&typeof s.name==='string'&&s.name.trim();
}
function inventoryAudit(sites){
 const items=Array.isArray(sites)?sites:[];
 const ids=new Set(),names=new Set();
 const errors=[];
 for(const site of items){
  if(!validSite(site)){errors.push('invalid_site_record');continue}
  const id=site.id.trim().toLowerCase(),name=site.name.trim().toLowerCase();
  if(ids.has(id))errors.push('duplicate_site_id:'+id);
  if(names.has(name))errors.push('duplicate_site_name:'+name);
  ids.add(id);names.add(name);
 }
 const publicVerified=items.filter(x=>x?.evidence?.publicUrlVerified===true&&x?.evidence?.mobileTestPassed===true&&x?.evidence?.customerJourneyTestPassed===true).length;
 return {target:TARGET,recordCount:items.length,publicVerified,remainingToVerify:Math.max(0,TARGET-publicVerified),valid:items.length===TARGET&&errors.length===0,errors};
}
function templateAudit(templates){
 const items=Array.isArray(templates)?templates:[];
 const ids=new Set(),errors=[];
 let verified=0;
 for(const item of items){
   const id=typeof item?.id==='string'?item.id.trim().toLowerCase():'';
   if(!id){errors.push('missing_template_id');continue}
   if(ids.has(id)){errors.push('duplicate_template_id:'+id);continue}
   ids.add(id);
   if(item?.evidence?.buildPassed===true&&item?.evidence?.previewPassed===true&&item?.evidence?.licenseReviewed===true&&item?.evidence?.accessibilityPassed===true)verified++;
 }
 return {target:TEMPLATE_TARGET,recordCount:items.length,verified,remaining:Math.max(0,TEMPLATE_TARGET-verified),valid:items.length===TEMPLATE_TARGET&&verified===TEMPLATE_TARGET&&errors.length===0,errors};
}
function evidencePassed(value){
 return value?.passed===true&&
  typeof value.reference==='string'&&value.reference.trim().length>=8&&
  typeof value.verifiedAt==='string'&&!Number.isNaN(Date.parse(value.verifiedAt))&&
  Date.parse(value.verifiedAt)<=Date.now();
}
function auditRelease({sites=[],templates=[],evidence={}}={}){
 const templateInventory=templateAudit(templates);
 const inventory=inventoryAudit(sites);
 const gates=GATES.map(([id,label])=>{
  const record=evidence[id];
  const passed=evidencePassed(record)&&(id!=='inventory'||inventory.valid)&&(id!=='templates'||templateInventory.valid);
  return {id,label,status:passed?'PASS':'BLOCKED',reference:passed?record.reference:null};
 });
 const earned=gates.filter(g=>g.status==='PASS').length;
 return {standard:'TRYAMM 11/11',earned,outOf:11,productionCertified:earned===11&&inventory.valid&&inventory.publicVerified===TARGET&&templateInventory.valid,inventory,templateInventory,gates,checkedAt:new Date().toISOString()};
}
module.exports={GATES,inventoryAudit,templateAudit,auditRelease};
