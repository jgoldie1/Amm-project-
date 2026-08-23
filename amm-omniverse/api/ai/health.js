export default async function handler(req,res){
  res.setHeader('Cache-Control','no-store');
  if(req.method!=='GET')return res.status(405).json({ok:false,error:'Method not allowed'});
  const gemini=Boolean(process.env.GEMINI_API_KEY||process.env.GOOGLE_API_KEY);
  const openai=Boolean(process.env.OPENAI_API_KEY);
  const claude=Boolean(process.env.ANTHROPIC_API_KEY);
  const deepseek=Boolean(process.env.DEEPSEEK_API_KEY);
  const backend=String(process.env.VITE_API_URL||process.env.AMM_BACKEND_URL||'').trim();
  const backendProxy=Boolean(backend&&/^https?:\/\//.test(backend)&&!backend.includes('your-amm-backend.example.com')&&!backend.includes('tryamm.online'));
  const providers={openai,gemini,claude,deepseek,ammBackend:backendProxy};
  const provider=openai?'openai':gemini?'gemini':claude?'claude':deepseek?'deepseek':backendProxy?'amm-backend':'diagnostic';
  const degraded=provider==='diagnostic';
  return res.status(200).json({
    ok:true,service:'HoloGPT',provider,providers,degraded,
    model:provider==='gemini'?(process.env.HOLOGPT_GEMINI_MODEL||'gemini-2.0-flash'):provider==='openai'?(process.env.HOLOGPT_OPENAI_MODEL||process.env.OPENAI_MODEL||'gpt-5.4'):provider==='claude'?(process.env.HOLOGPT_CLAUDE_MODEL||'configured'):provider==='deepseek'?(process.env.HOLOGPT_DEEPSEEK_MODEL||'configured'):null,
    backendProxyConfigured:backendProxy,
    orchestration:'multi-provider-failover-with-diagnostic-fallback',
    reviewer:'senior-engineer-gate',
    verifier:'evidence-only-green',
    auth:'supabase-when-session-present',
    message:degraded?'HoloGPT shell is healthy. No external model provider is configured on this deployment, so responses use diagnostic fallback until a provider credential is available.':'HoloGPT provider is configured.',
    time:new Date().toISOString()
  });
}
