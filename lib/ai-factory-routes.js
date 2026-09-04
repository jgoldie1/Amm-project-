'use strict';

const LANE_IDS=['llm','vision_ocr','image','video','audio','world_3d','game_agents'];

function bool(name){return String(process.env[name]||'').toLowerCase()==='true'}
function configured(...names){return names.every(name=>String(process.env[name]||'').trim().length>0)}
function provider({id,name,ownership='cloud',lanes=[],isConfigured=false,model=null}){
  return {id,name,ownership,lanes,configured:Boolean(isConfigured),healthy:null,model:model||null};
}

function providers(){
  const ownedCompat=configured('HOLOGPT_API_URL','HOLOGPT_MODEL');
  const ollama=configured('OLLAMA_BASE_URL','OLLAMA_MODEL');
  const poyo=configured('POYO_GENERATE_URL','POYO_STATUS_URL');
  const happyHorse=configured('HAPPYHORSE_GENERATE_URL','HAPPYHORSE_STATUS_URL','HAPPYHORSE_API_KEY');
  const comfy=Boolean(String(process.env.COMFYUI_API_URL||'').trim());
  const ownedGpu=bool('STUBBS_OWNED_GPU_CONNECTED');
  return [
    provider({id:'owned-openai-compatible',name:'HoloGPT Owned OpenAI-Compatible Runtime',ownership:'owned',lanes:['llm','vision_ocr','game_agents'],isConfigured:ownedGpu&&ownedCompat,model:process.env.HOLOGPT_MODEL}),
    provider({id:'ollama',name:'HoloGPT Ollama Runtime',ownership:'self-hosted',lanes:['llm','game_agents'],isConfigured:ollama,model:process.env.OLLAMA_MODEL}),
    provider({id:'vercel-ai-gateway',name:'Vercel AI Gateway',lanes:['llm','vision_ocr','game_agents'],isConfigured:Boolean(process.env.AI_GATEWAY_API_KEY||process.env.VERCEL_OIDC_TOKEN),model:process.env.HOLOGPT_GATEWAY_MODEL||'openai/gpt-5.6-sol'}),
    provider({id:'openai',name:'OpenAI',lanes:['llm','vision_ocr','image','game_agents'],isConfigured:Boolean(process.env.OPENAI_API_KEY),model:process.env.HOLOGPT_OPENAI_MODEL||null}),
    provider({id:'gemini',name:'Google Gemini',lanes:['llm','vision_ocr','game_agents'],isConfigured:Boolean(process.env.GEMINI_API_KEY||process.env.GOOGLE_API_KEY),model:process.env.HOLOGPT_GEMINI_MODEL||null}),
    provider({id:'anthropic',name:'Anthropic Claude',lanes:['llm','game_agents'],isConfigured:Boolean(process.env.ANTHROPIC_API_KEY),model:process.env.HOLOGPT_CLAUDE_MODEL||null}),
    provider({id:'glm',name:'Z.AI / GLM',lanes:['llm','vision_ocr','game_agents'],isConfigured:Boolean(process.env.ZAI_API_KEY||process.env.GLM_API_KEY),model:process.env.HOLOGPT_GLM_MODEL||'glm-5.2'}),
    provider({id:'deepseek',name:'DeepSeek',lanes:['llm','game_agents'],isConfigured:Boolean(process.env.DEEPSEEK_API_KEY),model:process.env.HOLOGPT_DEEPSEEK_MODEL||null}),
    provider({id:'poyo',name:'Poyo AI Studio Provider',lanes:['image','video','audio','world_3d'],isConfigured:poyo,model:null}),
    provider({id:'happy-horse',name:'Happy Horse Video',lanes:['video'],isConfigured:happyHorse,model:process.env.HAPPYHORSE_MODEL||'video:happyhorse-1-1-text-to-video'}),
    provider({id:'comfyui',name:'ComfyUI Self-Hosted Workflows',ownership:'self-hosted',lanes:['image','video'],isConfigured:comfy,model:null}),
    provider({id:'self-host-vision',name:'Self-Hosted Vision/OCR',ownership:'self-hosted',lanes:['vision_ocr'],isConfigured:configured('STUBBS_VISION_API_URL'),model:process.env.STUBBS_VISION_MODEL||null}),
    provider({id:'self-host-audio',name:'Self-Hosted Audio',ownership:'self-hosted',lanes:['audio'],isConfigured:configured('STUBBS_AUDIO_API_URL'),model:process.env.STUBBS_AUDIO_MODEL||null}),
    provider({id:'self-host-3d',name:'Self-Hosted 3D / World Runtime',ownership:'self-hosted',lanes:['world_3d'],isConfigured:configured('STUBBS_3D_API_URL'),model:process.env.STUBBS_3D_MODEL||null}),
  ];
}

function snapshot(){
  const all=providers();
  const priority={owned:0,'self-hosted':1,cloud:2};
  const lanes=LANE_IDS.map(id=>{
    const candidates=all.filter(p=>p.lanes.includes(id)).sort((a,b)=>priority[a.ownership]-priority[b.ownership]);
    const selected=candidates.find(p=>p.configured)||null;
    return {id,architectureReady:true,execution:selected?'available':'blocked',selectedProvider:selected?.id||null,providers:candidates};
  });
  const required=['llm','vision_ocr','image','video','audio'];
  return {
    service:'Stubbs AI Model Router / AI Factory',
    architectureReady:true,
    ownedGpuConnected:bool('STUBBS_OWNED_GPU_CONNECTED'),
    ownedGpuProvider:bool('STUBBS_OWNED_GPU_CONNECTED')?(process.env.STUBBS_OWNED_GPU_NAME||'HoloGPT GPU Runtime'):null,
    fullMovieRenderReady:required.every(id=>lanes.find(l=>l.id===id)?.execution==='available'),
    lanes,
    checkedAt:new Date().toISOString()
  };
}

module.exports=function registerAiFactoryRoutes({app,auth}){
  app.get('/api/ai-factory/health',(_req,res)=>res.json(snapshot()));
  app.post('/api/ai-factory/route',auth,(req,res)=>{
    const lane=String(req.body?.lane||'').trim();
    if(!LANE_IDS.includes(lane))return res.status(400).json({error:'invalid lane',lanes:LANE_IDS});
    const snap=snapshot();
    const result=snap.lanes.find(item=>item.id===lane);
    if(!result||result.execution!=='available')return res.status(503).json({error:'execution provider not configured',lane,result});
    res.json({ok:true,lane,selectedProvider:result.selectedProvider,provider:result.providers.find(p=>p.id===result.selectedProvider)||null,architectureReady:true,executionReady:true});
  });
};

module.exports.snapshot=snapshot;
