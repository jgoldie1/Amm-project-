'use strict';

const gates=require('../config/world-certification-gates.json');

const ORDER=new Map(gates.statuses.map((status,index)=>[status,index]));

function normalizeEvidence(evidence=[]){
  return new Set((evidence||[]).map(item=>String(item).trim()).filter(Boolean));
}

function requiredFor(status){
  if(!ORDER.has(status)) throw new Error(`Unknown certification status: ${status}`);
  return gates.requiredEvidence[status]||[];
}

function evaluatePromotion({fromStatus,toStatus,evidence=[],flags={}}){
  if(!ORDER.has(fromStatus)||!ORDER.has(toStatus)) throw new Error('Invalid certification status');
  if(ORDER.get(toStatus)!==ORDER.get(fromStatus)+1) return {allowed:false,reason:'PROMOTION_MUST_BE_SEQUENTIAL',missing:[]};
  const supplied=normalizeEvidence(evidence);
  const missing=requiredFor(toStatus).filter(item=>!supplied.has(item));
  const hardBlocks=[];
  for(const [name,enabled] of Object.entries(gates.hardBlocks)) if(enabled&&flags[name]===true) hardBlocks.push(name);
  if(hardBlocks.length) return {allowed:false,reason:'HARD_BLOCK',hardBlocks,missing};
  if(missing.length) return {allowed:false,reason:'MISSING_EVIDENCE',missing,hardBlocks:[]};
  return {allowed:true,reason:'EVIDENCE_SATISFIED',missing:[],hardBlocks:[]};
}

function certificationScore(evidence=[]){
  const supplied=normalizeEvidence(evidence);
  const all=[...new Set(Object.values(gates.requiredEvidence).flat())];
  const satisfied=all.filter(item=>supplied.has(item)).length;
  return {satisfied,total:all.length,percent:all.length?Math.round((satisfied/all.length)*100):100};
}

module.exports={gates,requiredFor,evaluatePromotion,certificationScore};
