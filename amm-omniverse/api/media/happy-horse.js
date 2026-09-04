import {requireUser} from '../_lib/security.js';

const clean=(value,max=4000)=>String(value||'').trim().slice(0,max);
const apiKey=()=>clean(process.env.HAPPYHORSE_API_KEY||process.env.HAPPY_HORSE_API_KEY,500);
const modelId=()=>clean(process.env.HAPPYHORSE_MODEL_ID||'video:happyhorse-1-1-text-to-video',200);
const baseUrl=()=>clean(process.env.HAPPYHORSE_API_BASE||'https://happyhorseaistudio.com',500).replace(/\/$/,'');
const timeoutMs=()=>Math.max(5000,Math.min(90000,Number(process.env.HAPPYHORSE_TIMEOUT_MS||45000)));

async function fetchJson(url,options={}){
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),timeoutMs());
  try{
    const response=await fetch(url,{...options,signal:controller.signal});
    const text=await response.text();
    let data={};
    try{data=text?JSON.parse(text):{}}catch{data={text}}
    return {response,data};
  }finally{clearTimeout(timer)}
}

export default async function handler(req,res){
  res.setHeader('Cache-Control','no-store');
  if(req.method==='GET'){
    return res.status(200).json({
      ok:true,
      provider:'happyhorse',
      configured:Boolean(apiKey()),
      model:modelId(),
      serverSideSecret:true,
      publicSecrets:false,
      requiresAuthenticatedUser:true,
      billing:'provider-credits',
      time:new Date().toISOString()
    });
  }
  if(req.method!=='POST')return res.status(405).json({ok:false,error:'Method not allowed'});
  const user=await requireUser(req,res);if(!user)return;
  const key=apiKey();
  if(!key)return res.status(503).json({ok:false,provider:'happyhorse',configured:false,error:'Happy Horse provider is registered but HAPPYHORSE_API_KEY is not configured.'});
  const prompt=clean(req.body?.prompt,2000);
  if(!prompt)return res.status(400).json({ok:false,error:'prompt is required'});
  const requestedModel=clean(req.body?.modelId||modelId(),200);
  if(!/^video:(?:happyhorse|fal-alibaba-happy-horse)/.test(requestedModel))return res.status(400).json({ok:false,error:'Only Happy Horse video model IDs are allowed on this route.'});
  const input={prompt};
  const imageUrl=clean(req.body?.imageUrl,2000);if(imageUrl)input.imageUrl=imageUrl;
  const aspectRatio=clean(req.body?.aspectRatio,20);if(aspectRatio)input.aspectRatio=aspectRatio;
  const quality=clean(req.body?.quality,20);if(quality)input.quality=quality;
  const duration=Number(req.body?.duration);if(Number.isFinite(duration)&&duration>=1&&duration<=30)input.duration=duration;
  if(typeof req.body?.generateAudio==='boolean')input.generateAudio=req.body.generateAudio;
  const payload={model:requestedModel,input};
  try{
    const {response,data}=await fetchJson(`${baseUrl()}/api/ai-studio/execute`,{
      method:'POST',
      headers:{'content-type':'application/json',authorization:`Bearer ${key}`},
      body:JSON.stringify({modelId:requestedModel,isPublic:false,payload})
    });
    if(!response.ok||data?.success===false){
      const message=clean(data?.error||data?.message||`Happy Horse provider ${response.status}`,500);
      return res.status(response.status>=400&&response.status<600?response.status:502).json({ok:false,provider:'happyhorse',configured:true,error:message});
    }
    const out=data?.data||data;
    return res.status(200).json({
      ok:true,
      provider:'happyhorse',
      configured:true,
      modelId:out?.modelId||requestedModel,
      generationId:out?.generationId||null,
      taskId:out?.taskId||null,
      state:out?.state||'queued',
      reservedCredits:out?.reservedCredits??null,
      authenticated:true,
      userId:user?.id||null,
      time:new Date().toISOString()
    });
  }catch(error){
    return res.status(502).json({ok:false,provider:'happyhorse',configured:true,error:clean(error?.message||'Happy Horse request failed',500)});
  }
}
