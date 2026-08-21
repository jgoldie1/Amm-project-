import {requireUser} from '../_lib/security.js';

const jsonHeaders={'content-type':'application/json'};
const timeoutMs=Number(process.env.HOLOGPT_PROVIDER_TIMEOUT_MS||25000);
async function post(url,options){const c=new AbortController(),timer=setTimeout(()=>c.abort(),timeoutMs);try{return await fetch(url,{...options,signal:c.signal})}finally{clearTimeout(timer)}}

async function openai(input){
 const key=process.env.OPENAI_API_KEY;if(!key)throw new Error('OPENAI_NOT_CONFIGURED');
 const model=process.env.OPENAI_MODEL||'gpt-5.6-luna';
 const r=await post('https://api.openai.com/v1/responses',{method:'POST',headers:{...jsonHeaders,authorization:`Bearer ${key}`},body:JSON.stringify({model,input})});
 const body=await r.json().catch(()=>({}));if(!r.ok)throw new Error(`OPENAI_${r.status}`);
 const text=body.output_text||body.output?.flatMap?.(x=>x.content||[])?.find?.(x=>x.type==='output_text')?.text||'';
 if(!text)throw new Error('OPENAI_EMPTY');return {answer:text,provider:'openai',model};
}
async function anthropic(input){
 const key=process.env.ANTHROPIC_API_KEY;if(!key)throw new Error('ANTHROPIC_NOT_CONFIGURED');
 const model=process.env.ANTHROPIC_MODEL||'claude-sonnet-4-5';
 const r=await post('https://api.anthropic.com/v1/messages',{method:'POST',headers:{...jsonHeaders,'x-api-key':key,'anthropic-version':'2023-06-01'},body:JSON.stringify({model,max_tokens:1400,messages:[{role:'user',content:input}]})});
 const body=await r.json().catch(()=>({}));if(!r.ok)throw new Error(`ANTHROPIC_${r.status}`);
 const text=(body.content||[]).filter(x=>x.type==='text').map(x=>x.text).join('\n');if(!text)throw new Error('ANTHROPIC_EMPTY');return {answer:text,provider:'anthropic',model};
}
async function deepseek(input){
 const key=process.env.DEEPSEEK_API_KEY;if(!key)throw new Error('DEEPSEEK_NOT_CONFIGURED');
 const model=process.env.DEEPSEEK_MODEL||'deepseek-chat';
 const base=(process.env.DEEPSEEK_BASE_URL||'https://api.deepseek.com').replace(/\/$/,'');
 const r=await post(`${base}/chat/completions`,{method:'POST',headers:{...jsonHeaders,authorization:`Bearer ${key}`},body:JSON.stringify({model,messages:[{role:'user',content:input}],stream:false})});
 const body=await r.json().catch(()=>({}));if(!r.ok)throw new Error(`DEEPSEEK_${r.status}`);
 const text=body.choices?.[0]?.message?.content||'';if(!text)throw new Error('DEEPSEEK_EMPTY');return {answer:text,provider:'deepseek',model};
}
const providers={openai,anthropic,deepseek};
export default async function handler(req,res){
 if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'});
 const user=await requireUser(req,res);if(!user)return;
 const question=String(req.body?.question||'').trim();if(!question)return res.status(400).json({error:'question required'});if(question.length>12000)return res.status(413).json({error:'question too large'});
 const context=req.body?.context&&typeof req.body.context==='object'?req.body.context:{};
 const input=`You are HoloGPT / Stubbs AI inside TRYAMM. Be useful, concise, evidence-aware, and do not claim an external action succeeded unless evidence confirms it.\n\nUser question:\n${question}\n\nTRYAMM context:\n${JSON.stringify(context).slice(0,12000)}`;
 const requested=String(req.body?.provider||'auto').toLowerCase();
 const order=requested!=='auto'&&providers[requested]?[requested]:String(process.env.HOLOGPT_PROVIDER_ORDER||'openai,anthropic,deepseek').split(',').map(x=>x.trim().toLowerCase()).filter(x=>providers[x]);
 const failures=[];
 for(const name of order){try{return res.status(200).json({...await providers[name](input),ok:true})}catch(error){failures.push({provider:name,error:error instanceof Error?error.message:'failed'})}}
 return res.status(503).json({error:'No HoloGPT provider is currently available',failures});
}
