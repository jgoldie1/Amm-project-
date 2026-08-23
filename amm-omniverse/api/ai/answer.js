import {requireUser} from '../_lib/security.js';

const clean=(v,n=12000)=>String(v||'').trim().slice(0,n);
const timeoutMs=()=>Math.max(3000,Math.min(60000,Number(process.env.HOLOGPT_TIMEOUT_MS||25000)));

async function fetchJson(url,options={}){
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),timeoutMs());
  try{
    const r=await fetch(url,{...options,signal:controller.signal});
    const text=await r.text();let data={};try{data=text?JSON.parse(text):{}}catch{data={text}}
    if(!r.ok)throw new Error(data?.error?.message||data?.error||data?.message||`provider_${r.status}`);
    return data;
  }finally{clearTimeout(timer)}
}

function systemPrompt(){return `You are HoloGPT, the intelligent assistant inside TRYAMM / AMM Omniverse. Give complete, useful, specific answers instead of canned marketing text. You understand the platform's Holoverse, HoloCore, HoloServices, creator tools, games, marketplace, streaming, accessibility, security, deployment and development workflow. Distinguish BUILT, DEMO/BETA, PLANNED and VERIFIED LIVE. Never claim a payment, deployment, medical result, hardware capability, legal status or external action happened without evidence. When asked why something is broken, diagnose it and provide the next concrete repair step. Keep the user's intent central and do not invent repository state.`}

async function gemini(question,history){
  const key=process.env.GEMINI_API_KEY||process.env.GOOGLE_API_KEY;
  if(!key)return null;
  const model=process.env.HOLOGPT_GEMINI_MODEL||'gemini-2.0-flash';
  const contents=[];
  for(const m of history.slice(-10))contents.push({role:m.role==='assistant'?'model':'user',parts:[{text:clean(m.content,3000)}]});
  contents.push({role:'user',parts:[{text:question}]});
  const data=await fetchJson(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(key)}`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({systemInstruction:{parts:[{text:systemPrompt()}]},contents,generationConfig:{temperature:.35,maxOutputTokens:1800}})});
  const answer=clean(data?.candidates?.[0]?.content?.parts?.map(p=>p.text||'').join('\n'),20000);
  if(!answer)throw new Error('gemini_empty_response');
  return {answer,provider:'gemini',model};
}

async function openai(question,history){
  const key=process.env.OPENAI_API_KEY;if(!key)return null;
  const model=process.env.HOLOGPT_OPENAI_MODEL;if(!model)throw new Error('HOLOGPT_OPENAI_MODEL is required when OPENAI_API_KEY is configured');
  const input=[...history.slice(-10).map(m=>({role:m.role==='assistant'?'assistant':'user',content:clean(m.content,3000)})),{role:'user',content:question}];
  const data=await fetchJson('https://api.openai.com/v1/responses',{method:'POST',headers:{'content-type':'application/json',authorization:`Bearer ${key}`},body:JSON.stringify({model,instructions:systemPrompt(),input,max_output_tokens:1800,store:false})});
  let answer=clean(data.output_text,20000);
  if(!answer)for(const item of data.output||[])for(const part of item.content||[])if(part.text)answer+=part.text;
  answer=clean(answer,20000);if(!answer)throw new Error('openai_empty_response');
  return {answer,provider:'openai',model:data.model||model};
}

function diagnostic(question){return {answer:`HoloGPT is connected to the app, but this production deployment does not currently have an AI model credential configured. The previous assistant was falling back to a fixed keyword-response table, which is why answers felt unintelligent.\n\nYour request: ${question}\n\nRepair status: UI route exists; the intelligent API endpoint now exists; the remaining provider gate is to configure GEMINI_API_KEY/GOOGLE_API_KEY or OPENAI_API_KEY plus HOLOGPT_OPENAI_MODEL in the production environment and redeploy. Until that gate is green, I will report diagnostic mode instead of pretending a real model answered.`,provider:'diagnostic',model:null};}

export default async function handler(req,res){
  res.setHeader('Cache-Control','no-store');
  if(req.method!=='POST')return res.status(405).json({ok:false,error:'Method not allowed'});
  const question=clean(req.body?.question);if(!question)return res.status(400).json({ok:false,error:'question is required'});
  const history=Array.isArray(req.body?.history)?req.body.history.filter(x=>x&&['user','assistant'].includes(x.role)&&x.content).slice(-10):[];
  let user=null;
  if(String(req.headers.authorization||'').startsWith('Bearer ')){
    user=await requireUser(req,res);if(!user)return;
  }
  try{
    const result=await gemini(question,history)||await openai(question,history)||diagnostic(question);
    return res.status(200).json({ok:true,...result,degraded:result.provider==='diagnostic',authenticated:Boolean(user),userId:user?.id||null,time:new Date().toISOString()});
  }catch(error){
    const fallback=diagnostic(question);
    return res.status(200).json({ok:true,...fallback,degraded:true,providerError:clean(error?.message,500),authenticated:Boolean(user),userId:user?.id||null,time:new Date().toISOString()});
  }
}
