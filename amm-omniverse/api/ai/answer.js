import {generateText} from 'ai';
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

function systemPrompt(){return `You are HoloGPT, the orchestration intelligence inside TRYAMM / AMM Omniverse. Give complete, useful, specific answers instead of canned marketing text.

You understand the connected TRYAMM ecosystem: Holoverse, Middleverse, HoloCore, HoloServices, Living Worlds/GameVerse, StreetVerse, SpaceVerse/Time Machine, creator tools, LIVE, Reels/Omni Box, marketplace, music, TV/Drama Box, Holo Credits, Get Paid to Play, advertising/Holo Ads, accessibility, security, deployment and development workflow.

Education/workforce context is first-class. You understand the TRYAMM School Network, All American University (AAU), Student JARVIS, College Book/library, HBCU/college pathways, AI Cafe workforce labs, Jacobie Vision, internships, apprenticeships and the JARVIS Workforce engine. AAU is currently an education platform/program brand unless formal accreditation, degree-granting authority, state approval or institutional partnership is separately obtained and verified. Never call an AAU completion record an accredited degree, professional license or official university credit without verified authority.

Teaching model: Stubbs AI/HoloGPT can explain, tutor, generate practice, adapt lessons, help with accessibility, coach portfolios and support teachers. Real verified instructors retain responsibility where human grading, hands-on supervision, safety oversight, licensure or regulated instruction is required. AI must not impersonate a teacher, licensed professional or complete graded work dishonestly for a student.

Trade-school context includes electrical, HVAC/R, plumbing, carpentry/construction, welding and automotive pathways. Treat hands-on trade labs as supervised training; do not present a learner as licensed or qualified for regulated work without verified credentials and jurisdiction-specific requirements.

Jacobie Vision context includes defensive cybersecurity, application-security QA, privacy/compliance, incident-response training, team leadership and real-estate/house-flipping operations. House-flipping workflows include comp research, ARV ranges, deal analysis, construction/rehab budgets, financing/carrying costs, due diligence, project documentation, property photo/video, 3D scans/digital twins, Holo listings, marketing, property-record security and administrative support. Brokerage, appraisal, lending, contracting, inspection and legal services stay behind qualified/licensed-professional gates where required. Deal models are estimates, not guaranteed returns or appraisals.

Workforce/pay context: learning can progress into labs, evidence, portfolios, internships/apprenticeships and approved paid work. A browser or learner cannot set its own wage, approve its own work or create payable earnings. Approved labor requires evidence, supervisor/client approval, classification/payroll readiness and available operating funds. Restricted player-reward reserves, creator liabilities, customer balances and restricted ministry/legacy allocations must not fund payroll.

Get Paid to Play context: normal gameplay may award XP, reputation, inventory, Game Cash or closed-loop Holo Credits. Real cash rewards require a separately funded eligible program, server-authoritative result/evidence, anti-abuse checks, idempotent claim processing, reserve coverage and money-ledger posting. Chance-based poker is excluded from cash-reward routing unless a separately reviewed lawful structure exists.

Financial context: distinguish gross sale, settlement, fees/taxes/refund reserves, creator/merchant/rightsholder liabilities, operating funds, restricted reward reserves and distributable surplus. Never double allocate the same dollar. Holo Credits are closed-loop platform credits, not guaranteed cash redemption, cryptocurrency, a bank deposit or investment.

Always distinguish BUILT, DEMO/BETA, PLANNED, CONFIGURED and VERIFIED LIVE. Never claim a payment, deployment, accreditation, partnership, employment outcome, medical result, hardware capability, legal status, licensed service or external action happened without evidence. When diagnosing software, behave like an experienced engineer: identify likely cause, evidence, repair, regression risk and verification. Keep the user's intent central and do not invent repository or production state.`}

function normalizeHistory(history=[]){return history.slice(-10).map(m=>({role:m.role==='assistant'?'assistant':'user',content:clean(m.content,3000)}));}

function extractResponseText(data){
  let answer=clean(data?.output_text,20000);
  if(answer)return answer;
  for(const item of data?.output||[])for(const part of item?.content||[])if(part?.text)answer+=part.text;
  return clean(answer,20000);
}

async function aiSdkGateway(question,history){
  const configured=clean(process.env.HOLOGPT_GATEWAY_MODEL,200);
  const models=[configured,'inclusionai/ling-3.0-flash-free','openai/gpt-5.4'].filter((value,index,array)=>value&&array.indexOf(value)===index);
  let lastError=null;
  for(const model of models){
    try{
      const result=await generateText({
        model,
        system:systemPrompt(),
        messages:[...normalizeHistory(history),{role:'user',content:question}],
        maxOutputTokens:2200,
        abortSignal:AbortSignal.timeout(timeoutMs())
      });
      const answer=clean(result?.text,20000);
      if(!answer)throw new Error('ai_sdk_gateway_empty_response');
      return {answer,provider:'vercel-ai-gateway-auto',model};
    }catch(error){lastError=error;}
  }
  throw lastError||new Error('ai_sdk_gateway_failed');
}

async function vercelGateway(question,history){
  const token=process.env.AI_GATEWAY_API_KEY||process.env.VERCEL_OIDC_TOKEN;if(!token)return null;
  const model=process.env.HOLOGPT_GATEWAY_MODEL||'inclusionai/ling-3.0-flash-free';
  const input=[...normalizeHistory(history),{role:'user',content:question}];
  const data=await fetchJson('https://ai-gateway.vercel.sh/v1/responses',{method:'POST',headers:{'content-type':'application/json',authorization:`Bearer ${token}`},body:JSON.stringify({model,instructions:systemPrompt(),input,max_output_tokens:2200,store:false})});
  const answer=extractResponseText(data);if(!answer)throw new Error('gateway_empty_response');
  return {answer,provider:'vercel-ai-gateway',model:data.model||model};
}

async function openai(question,history){
  const key=process.env.OPENAI_API_KEY;if(!key)return null;
  const model=process.env.HOLOGPT_OPENAI_MODEL||process.env.OPENAI_MODEL||'gpt-5.4';
  const input=[...normalizeHistory(history),{role:'user',content:question}];
  const data=await fetchJson('https://api.openai.com/v1/responses',{method:'POST',headers:{'content-type':'application/json',authorization:`Bearer ${key}`},body:JSON.stringify({model,instructions:systemPrompt(),input,max_output_tokens:2200,store:false})});
  const answer=extractResponseText(data);if(!answer)throw new Error('openai_empty_response');
  return {answer,provider:'openai',model:data.model||model};
}

async function gemini(question,history){
  const key=process.env.GEMINI_API_KEY||process.env.GOOGLE_API_KEY;if(!key)return null;
  const model=process.env.HOLOGPT_GEMINI_MODEL||'gemini-2.0-flash';
  const contents=[];
  for(const m of history.slice(-10))contents.push({role:m.role==='assistant'?'model':'user',parts:[{text:clean(m.content,3000)}]});
  contents.push({role:'user',parts:[{text:question}]});
  const data=await fetchJson(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(key)}`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({systemInstruction:{parts:[{text:systemPrompt()}]},contents,generationConfig:{temperature:.35,maxOutputTokens:2200}})});
  const answer=clean(data?.candidates?.[0]?.content?.parts?.map(p=>p.text||'').join('\n'),20000);
  if(!answer)throw new Error('gemini_empty_response');
  return {answer,provider:'gemini',model};
}

async function claude(question,history){
  const key=process.env.ANTHROPIC_API_KEY;if(!key)return null;
  const model=process.env.HOLOGPT_CLAUDE_MODEL;if(!model)return null;
  const messages=[...normalizeHistory(history),{role:'user',content:question}];
  const data=await fetchJson('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'content-type':'application/json','x-api-key':key,'anthropic-version':'2023-06-01'},body:JSON.stringify({model,max_tokens:2200,system:systemPrompt(),messages})});
  const answer=clean((data.content||[]).map(part=>part?.text||'').join('\n'),20000);
  if(!answer)throw new Error('claude_empty_response');
  return {answer,provider:'claude',model:data.model||model};
}

async function deepseek(question,history){
  const key=process.env.DEEPSEEK_API_KEY;if(!key)return null;
  const model=process.env.HOLOGPT_DEEPSEEK_MODEL;if(!model)return null;
  const messages=[{role:'system',content:systemPrompt()},...normalizeHistory(history),{role:'user',content:question}];
  const base=String(process.env.DEEPSEEK_API_BASE||'https://api.deepseek.com').replace(/\/$/,'');
  const data=await fetchJson(`${base}/chat/completions`,{method:'POST',headers:{'content-type':'application/json',authorization:`Bearer ${key}`},body:JSON.stringify({model,messages,temperature:.35,max_tokens:2200})});
  const answer=clean(data?.choices?.[0]?.message?.content,20000);
  if(!answer)throw new Error('deepseek_empty_response');
  return {answer,provider:'deepseek',model:data.model||model};
}

async function ammBackend(question,history,authorization){
  const base=String(process.env.AMM_BACKEND_URL||process.env.VITE_API_URL||'').trim().replace(/\/$/,'');
  if(!base||!/^https?:\/\//.test(base)||base.includes('your-amm-backend.example.com')||base.includes('tryamm.online'))return null;
  const data=await fetchJson(`${base}/api/ai/answer`,{method:'POST',headers:{'content-type':'application/json',...(authorization?{authorization}:{})},body:JSON.stringify({question,history,mode:'hybrid',system:systemPrompt()})});
  const answer=clean(data?.answer||data?.output||data?.text,20000);
  if(!answer)throw new Error('amm_backend_empty_response');
  return {answer,provider:'amm-backend',model:data.model||null};
}

function diagnostic(question,errors=[]){return {answer:`HoloGPT is online in recovery mode, but no generative provider completed this request.\n\nYour request: ${question}\n\nPrimary path: Vercel AI SDK + AI Gateway automatic OIDC. Fallbacks: explicit Vercel AI Gateway, OpenAI, Gemini, Claude, DeepSeek, then the AMM backend.${errors.length?`\n\nProvider diagnostics: ${errors.join(' | ')}`:''}`,provider:'diagnostic',model:null};}

export default async function handler(req,res){
  res.setHeader('Cache-Control','no-store');
  if(req.method!=='POST')return res.status(405).json({ok:false,error:'Method not allowed'});
  const question=clean(req.body?.question);if(!question)return res.status(400).json({ok:false,error:'question is required'});
  const history=Array.isArray(req.body?.history)?req.body.history.filter(x=>x&&['user','assistant'].includes(x.role)&&x.content).slice(-10):[];
  const authorization=String(req.headers.authorization||'');
  let user=null;
  if(authorization.startsWith('Bearer ')){user=await requireUser(req,res);if(!user)return;}
  const errors=[];
  const runners=[
    ()=>aiSdkGateway(question,history),
    ()=>vercelGateway(question,history),
    ()=>openai(question,history),
    ()=>gemini(question,history),
    ()=>claude(question,history),
    ()=>deepseek(question,history),
    ()=>ammBackend(question,history,authorization)
  ];
  for(const runner of runners){
    try{
      const result=await runner();
      if(result)return res.status(200).json({ok:true,...result,degraded:false,authenticated:Boolean(user),userId:user?.id||null,time:new Date().toISOString()});
    }catch(error){errors.push(clean(error?.message,300));}
  }
  const fallback=diagnostic(question,errors);
  return res.status(200).json({ok:true,...fallback,degraded:true,authenticated:Boolean(user),userId:user?.id||null,providerErrors:errors,time:new Date().toISOString()});
}