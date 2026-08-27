import {generateText} from 'ai';

const timeoutMs=()=>Math.max(3000,Math.min(15000,Number(process.env.HOLOGPT_SELFTEST_TIMEOUT_MS||8000)));

export default async function handler(req,res){
  res.setHeader('Cache-Control','no-store');
  if(req.method!=='GET')return res.status(405).json({ok:false,error:'Method not allowed'});
  const configured=String(process.env.HOLOGPT_GATEWAY_MODEL||'').trim();
  const models=[configured,'openai/gpt-5.4'].filter((v,i,a)=>v&&a.indexOf(v)===i);
  const errors=[];
  for(const model of models){
    try{
      const result=await generateText({
        model,
        system:'You are the TRYAMM HoloGPT production readiness probe. Reply with exactly HOLOGPT_READY.',
        prompt:'Return the readiness token.',
        maxOutputTokens:12,
        abortSignal:AbortSignal.timeout(timeoutMs())
      });
      const text=String(result?.text||'').trim();
      if(!text)throw new Error('empty_response');
      return res.status(200).json({ok:true,degraded:false,provider:'vercel-ai-gateway-auto',model,response:text,time:new Date().toISOString()});
    }catch(error){errors.push(`${model}:${String(error?.message||error).slice(0,240)}`);}
  }
  return res.status(200).json({ok:false,degraded:true,provider:'diagnostic',model:null,errors,time:new Date().toISOString()});
}
