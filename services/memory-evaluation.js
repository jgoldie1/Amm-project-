function normalize(value){return String(value||'').toLowerCase().replace(/\s+/g,' ').trim();}
function unique(items){return [...new Set(items)];}
function evaluateMemory(memory={},related=[]){
  const findings=[];
  const content=normalize(memory.content);
  const facts=Array.isArray(memory.facts)?memory.facts.map(normalize).filter(Boolean):[];
  if(!content)findings.push({severity:'high',code:'empty-content',message:'Memory has no usable content.'});
  if(!memory.source_ids?.length&&['semantic','procedural'].includes(memory.tier))findings.push({severity:'medium',code:'missing-source',message:'Knowledge memory has no source identifiers.'});
  if(Number(memory.confidence||0)>0.85&&!memory.source_ids?.length)findings.push({severity:'medium',code:'unsupported-confidence',message:'High confidence is not supported by sources.'});
  if(memory.visibility!=='private'&&!memory.consent)findings.push({severity:'high',code:'missing-consent',message:'Shared or public memory requires explicit consent.'});
  if(/\b(always|never|guaranteed|100% certain)\b/.test(content)&&Number(memory.confidence||0)<1)findings.push({severity:'low',code:'absolute-language',message:'Absolute wording may overstate certainty.'});
  const duplicates=facts.filter((fact,index)=>facts.indexOf(fact)!==index);
  if(duplicates.length)findings.push({severity:'low',code:'duplicate-facts',message:`Duplicate facts: ${unique(duplicates).join(', ')}`});
  for(const other of related){
    if(other.id===memory.id)continue;
    const sameSubject=other.subject_id===memory.subject_id&&other.subject_type===memory.subject_type;
    const sameTitle=normalize(other.title)===normalize(memory.title);
    const different=normalize(other.content)!==content;
    if(sameSubject&&sameTitle&&different)findings.push({severity:'medium',code:'possible-conflict',message:`May conflict with memory ${other.id}.`,relatedMemoryId:other.id});
  }
  const penalties=findings.reduce((sum,item)=>sum+({high:.35,medium:.2,low:.08}[item.severity]||.1),0);
  const score=Math.max(0,Math.min(1,1-penalties));
  return {score,passed:score>=.7,findings};
}
function evaluateAnswer({answer='',memories=[],requiredFacts=[],forbiddenClaims=[]}={}){
  const text=normalize(answer);const findings=[];
  const memoryText=normalize(memories.map(item=>`${item.title||''} ${item.content||''} ${(item.facts||[]).join(' ')}`).join(' '));
  for(const fact of requiredFacts)if(!text.includes(normalize(fact)))findings.push({severity:'medium',code:'missing-required-fact',message:String(fact)});
  for(const claim of forbiddenClaims)if(text.includes(normalize(claim)))findings.push({severity:'high',code:'forbidden-claim',message:String(claim)});
  const unsupportedSentences=String(answer).split(/[.!?]\s+/).filter(sentence=>sentence.length>30&&!memoryText.includes(normalize(sentence).slice(0,60)));
  if(unsupportedSentences.length>3)findings.push({severity:'medium',code:'possible-hallucination',message:'Several claims are not directly supported by retrieved memory.'});
  const penalties=findings.reduce((sum,item)=>sum+({high:.4,medium:.2,low:.08}[item.severity]||.1),0);
  const score=Math.max(0,Math.min(1,1-penalties));
  return {score,passed:score>=.75,findings,unsupportedSentenceCount:unsupportedSentences.length};
}
module.exports={evaluateMemory,evaluateAnswer};