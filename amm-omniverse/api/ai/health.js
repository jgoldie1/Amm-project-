export default async function handler(req,res){
  res.setHeader('Cache-Control','no-store');
  if(req.method!=='GET')return res.status(405).json({ok:false,error:'Method not allowed'});
  const selfHostedBase=String(process.env.HOLOGPT_SELFHOST_BASE||'').trim();
  const selfHosted=Boolean(selfHostedBase);
  const selfHostedPreferred=String(process.env.HOLOGPT_SELFHOST_PREFERRED||'').toLowerCase()==='true';
  const gateway=Boolean(process.env.AI_GATEWAY_API_KEY||process.env.VERCEL_OIDC_TOKEN);
  const gemini=Boolean(process.env.GEMINI_API_KEY||process.env.GOOGLE_API_KEY);
  const openai=Boolean(process.env.OPENAI_API_KEY);
  const claude=Boolean(process.env.ANTHROPIC_API_KEY);
  const glm=Boolean(process.env.ZAI_API_KEY||process.env.GLM_API_KEY);
  const deepseek=Boolean(process.env.DEEPSEEK_API_KEY);
  const backend=String(process.env.VITE_API_URL||process.env.AMM_BACKEND_URL||'').trim();
  const backendProxy=Boolean(backend&&/^https?:\/\//.test(backend)&&!backend.includes('your-amm-backend.example.com')&&!backend.includes('tryamm.online'));
  const providers={selfHosted,vercelGateway:gateway,openai,gemini,claude,glm,deepseek,ammBackend:backendProxy};
  const cloudProvider=gateway?'vercel-ai-gateway':openai?'openai':gemini?'gemini':claude?'claude':glm?'zai-glm':deepseek?'deepseek':backendProxy?'amm-backend':'diagnostic';
  const provider=selfHostedPreferred&&selfHosted?'hologpt-selfhost':cloudProvider==='diagnostic'&&selfHosted?'hologpt-selfhost':cloudProvider;
  const degraded=provider==='diagnostic';
  return res.status(200).json({
    ok:true,service:'HoloGPT',provider,providers,degraded,
    model:provider==='hologpt-selfhost'?(process.env.HOLOGPT_SELFHOST_MODEL||'hologpt-local'):provider==='vercel-ai-gateway'?(process.env.HOLOGPT_GATEWAY_MODEL||'openai/gpt-5.6-sol'):provider==='gemini'?(process.env.HOLOGPT_GEMINI_MODEL||'gemini-2.0-flash'):provider==='openai'?(process.env.HOLOGPT_OPENAI_MODEL||process.env.OPENAI_MODEL||'gpt-5.4'):provider==='claude'?(process.env.HOLOGPT_CLAUDE_MODEL||'configured'):provider==='zai-glm'?(process.env.HOLOGPT_GLM_MODEL||'glm-5.2'):provider==='deepseek'?(process.env.HOLOGPT_DEEPSEEK_MODEL||'configured'):null,
    selfHosted:{configured:selfHosted,preferred:selfHostedPreferred,openAICompatible:true,serverSideEndpoint:true},
    backendProxyConfigured:backendProxy,
    orchestration:'owned-inference-ready-with-cloud-failover',
    reviewer:'senior-engineer-gate',
    verifier:'evidence-only-green',
    auth:'supabase-when-session-present',
    message:degraded?'HoloGPT shell is healthy. No generative provider is reachable yet. It is now ready for an owned OpenAI-compatible inference server, with cloud providers including GLM 5.2 as fallbacks.':'HoloGPT has at least one generative provider configured.',
    time:new Date().toISOString()
  });
}