'use strict';

const crypto=require('crypto');

const TIMEOUT=Math.max(3000,Math.min(120000,Number(process.env.POYO_TIMEOUT_MS||60000)));
function clean(value,max=5000){return String(value||'').trim().slice(0,max)}
function configured(){return Boolean((process.env.POYO_GENERATE_URL&&process.env.POYO_STATUS_URL)||(process.env.HAPPYHORSE_GENERATE_URL&&process.env.HAPPYHORSE_STATUS_URL&&process.env.HAPPYHORSE_API_KEY)||process.env.COMFYUI_API_URL)}
function adapterStatus(){return {
  poyo:Boolean(process.env.POYO_GENERATE_URL&&process.env.POYO_STATUS_URL),
  happyHorse:Boolean(process.env.HAPPYHORSE_GENERATE_URL&&process.env.HAPPYHORSE_STATUS_URL&&process.env.HAPPYHORSE_API_KEY),
  comfyui:Boolean(process.env.COMFYUI_API_URL),
};}
async function fetchJson(url,options={}){
  const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),TIMEOUT);
  try{const response=await fetch(url,{...options,signal:controller.signal});const text=await response.text();let data={};try{data=text?JSON.parse(text):{}}catch{data={text}};if(!response.ok){const error=new Error(data?.error?.message||data?.message||data?.error||`provider request failed (${response.status})`);error.status=response.status;throw error}return data}finally{clearTimeout(timer)}
}
function authHeaders(key){return {'Content-Type':'application/json',...(key?{Authorization:`Bearer ${key}`}:{})}}
function choose(model){
  const name=String(model||'').toLowerCase();
  if((name.includes('happyhorse')||name.includes('happy-horse'))&&process.env.HAPPYHORSE_GENERATE_URL)return {id:'happy-horse',generate:process.env.HAPPYHORSE_GENERATE_URL,status:process.env.HAPPYHORSE_STATUS_URL,key:process.env.HAPPYHORSE_API_KEY||''};
  if(process.env.POYO_GENERATE_URL)return {id:'poyo',generate:process.env.POYO_GENERATE_URL,status:process.env.POYO_STATUS_URL,key:process.env.POYO_API_KEY||''};
  if(process.env.COMFYUI_API_URL)return {id:'comfyui',generate:String(process.env.COMFYUI_API_URL).replace(/\/$/,'')+'/prompt',status:null,key:process.env.COMFYUI_API_KEY||''};
  return null;
}

module.exports=function registerPoyoRoutes({app,auth}){
  app.get('/api/poyo/health',(_req,res)=>res.json({ok:true,service:'TRYAMM Poyo AI Studio',configured:configured(),adapters:adapterStatus(),time:new Date().toISOString()}));

  app.post('/api/poyo/generate',auth,async(req,res,next)=>{
    try{
      if(req.body?.consent!==true)return res.status(400).json({error:'consent required for referenced people, voices, brands or media'});
      const model=clean(req.body?.model,180);const input=req.body?.input&&typeof req.body.input==='object'?req.body.input:{};
      if(!model)return res.status(400).json({error:'model is required'});
      const adapter=choose(model);if(!adapter)return res.status(503).json({error:'No Poyo/video execution provider is configured',code:'POYO_PROVIDER_NOT_CONFIGURED',adapters:adapterStatus()});
      const requestId=`poyo_${crypto.randomBytes(10).toString('hex')}`;
      const payload={model,input,request_id:requestId,metadata:{source:'tryamm-poyo',user_id:req.user.id}};
      const data=await fetchJson(adapter.generate,{method:'POST',headers:authHeaders(adapter.key),body:JSON.stringify(payload)});
      const task=data.task||data.data||data;
      const taskId=clean(task?.task_id||task?.id||task?.request_id||requestId,220);
      res.status(202).json({ok:true,provider:adapter.id,task:{...task,task_id:taskId,status:task?.status||'submitted'}});
    }catch(error){next(error)}
  });

  app.get('/api/poyo/status',auth,async(req,res,next)=>{
    try{
      const taskId=clean(req.query.taskId,220);const model=clean(req.query.model,180);
      if(!taskId)return res.status(400).json({error:'taskId is required'});
      const adapter=choose(model||'poyo');if(!adapter||!adapter.status)return res.status(503).json({error:'Status adapter is not configured for this provider',code:'POYO_STATUS_NOT_CONFIGURED',adapters:adapterStatus()});
      const separator=adapter.status.includes('?')?'&':'?';
      const data=await fetchJson(`${adapter.status}${separator}taskId=${encodeURIComponent(taskId)}`,{headers:authHeaders(adapter.key)});
      res.json({ok:true,provider:adapter.id,task:data.task||data.data||data});
    }catch(error){next(error)}
  });
};
