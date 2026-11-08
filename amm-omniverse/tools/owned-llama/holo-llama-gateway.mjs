// TRYAMM HoloGPT owned-model gateway: localhost-only by default.
// Proxy one approved Ollama model to the OpenAI-compatible route already used by HoloGPT.
// Not a public hosting service; expose only through an approved HTTPS authenticated reverse proxy.
import {createServer} from 'node:http';
import {timingSafeEqual} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';

const json=(res,status,payload)=>{
  res.writeHead(status,{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'});
  res.end(JSON.stringify(payload));
};
const safeMatch=(provided,expected)=>{
  const a=Buffer.from(String(provided)),b=Buffer.from(String(expected));
  return a.length===b.length&&timingSafeEqual(a,b);
};
const validMessages=value=>Array.isArray(value)&&value.length>0&&value.length<=20&&value.every(
  m=>m&&['system','user','assistant'].includes(m.role)&&typeof m.content==='string'&&m.content.length<=5000
);
async function readBody(req,max=65536){
  let size=0,parts=[];
  for await(const chunk of req){
    size+=chunk.length;
    if(size>max){const e=new Error('body_too_large');e.status=413;throw e}
    parts.push(chunk);
  }
  try{return JSON.parse(Buffer.concat(parts).toString('utf8'))}
  catch{const e=new Error('invalid_json');e.status=400;throw e}
}
export function createHoloLlamaGateway({
  upstream='http://127.0.0.1:11434',model='llama3.2:1b',token,
  timeoutMs=45000,fetchImpl=fetch
}={}){
  if(typeof token!=='string'||token.length<32)throw new Error('Set a random HOLO_LLAMA_PROXY_TOKEN (32+ characters).');
  if(!/^[a-zA-Z0-9._:-]{2,120}$/.test(model))throw new Error('Invalid fixed model ID.');
  const url=new URL(upstream);
  if(url.protocol!=='http:'||!(['127.0.0.1','localhost','[::1]'].includes(url.hostname)||(process.env.HOLO_LLAMA_PRIVATE_DOCKER_MODE==='true'&&url.hostname==='ollama'))||url.username||url.password||url.search||url.hash)
    throw new Error('OLLAMA_BASE_URL must be a local HTTP endpoint. Never expose Ollama directly.');
  let inflight=0;
  const request=async (pathname,options={})=>{
    const r=await fetchImpl(new URL(pathname,url.origin),{...options,signal:AbortSignal.timeout(timeoutMs)});
    if(!r.ok)throw new Error('upstream_unavailable');
    return await r.json();
  };
  const server=createServer(async(req,res)=>{
    const target=(req.url||'/').split('?')[0];
    if(req.headers.authorization!=='Bearer '+token||
      !safeMatch(String(req.headers.authorization).slice(7),token))
      return json(res,401,{ok:false,error:'unauthorized'});
    if(req.method==='GET'&&target==='/health'){
      try{
        const data=await request('/api/tags');
        const available=Array.isArray(data.models)&&data.models.some(m=>m.name===model||m.model===model);
        return json(res,available?200:503,{ok:available,model,provider:'ollama',status:available?'model-loaded':'model-not-found'});
      }catch{return json(res,503,{ok:false,model,status:'upstream-unreachable'})}
    }
    if(req.method!=='POST'||target!=='/v1/chat/completions')
      return json(res,404,{ok:false,error:'not_found'});
    if(!String(req.headers['content-type']||'').startsWith('application/json'))
      return json(res,415,{ok:false,error:'json_required'});
    if(inflight>=2)return json(res,429,{ok:false,error:'busy'});
    inflight++;
    try{
      const data=await readBody(req);
      if(!data||!validMessages(data.messages)||data.stream===true)
        return json(res,400,{ok:false,error:'invalid_or_streaming_request'});
      if(data.model!==model)return json(res,400,{ok:false,error:'model_mismatch'});
      const maxTokens=Number.isFinite(data.max_tokens)?Math.max(1,Math.min(1024,Math.trunc(data.max_tokens))):512;
      const temperature=Number.isFinite(data.temperature)?Math.max(0,Math.min(1,data.temperature)):0.35;
      const result=await request('/v1/chat/completions',{
        method:'POST',headers:{'content-type':'application/json'},
        body:JSON.stringify({model,messages:data.messages,temperature,max_tokens:maxTokens,stream:false})
      });
      const answer=result?.choices?.[0]?.message?.content;
      if(typeof answer!=='string'||!answer.trim())throw new Error('empty_model_reply');
      return json(res,200,{id:result.id||'hologpt-local',object:'chat.completion',model,
        choices:[{index:0,message:{role:'assistant',content:answer},finish_reason:'stop'}]});
    }catch(e){return json(res,e.status||502,{ok:false,error:e.status?e.message:'inference_unavailable'})}
    finally{inflight--}
  });
  return server;
}
if(process.argv[1]&&fileURLToPath(import.meta.url)===resolve(process.argv[1])){
  // Binding all interfaces is allowed ONLY inside the isolated Docker Compose application network.
  // The compose stack does not publish the gateway or Ollama ports onto the host.
  const privateDocker=process.env.HOLO_LLAMA_PRIVATE_DOCKER_MODE==='true';
  const host=privateDocker?'0.0.0.0':'127.0.0.1';
  const port=Number(process.env.HOLO_LLAMA_GATEWAY_PORT||4117);
  if(!Number.isInteger(port)||port<1024||port>65535)throw new Error('Invalid gateway port.');
  const server=createHoloLlamaGateway({
    token:process.env.HOLO_LLAMA_PROXY_TOKEN,
    model:process.env.HOLOGPT_SELFHOST_MODEL||'llama3.2:1b',
    upstream:process.env.OLLAMA_BASE_URL||'http://127.0.0.1:11434'
  });
  server.listen(port,host,()=>console.log('HoloGPT private gateway ready on '+host+':'+port+' (do not publish this port)'));
}
