export default async function handler(req,res){
  res.setHeader('Cache-Control','no-store');
  if(req.method!=='GET')return res.status(405).json({ok:false,error:'Method not allowed'});
  const gemini=Boolean(process.env.GEMINI_API_KEY||process.env.GOOGLE_API_KEY);
  const openai=Boolean(process.env.OPENAI_API_KEY&&process.env.HOLOGPT_OPENAI_MODEL);
  const claude=Boolean(process.env.ANTHROPIC_API_KEY&&process.env.HOLOGPT_CLAUDE_MODEL);
  const deepseek=Boolean(process.env.DEEPSEEK_API_KEY&&process.env.HOLOGPT_DEEPSEEK_MODEL);
  const backend=String(process.env.VITE_API_URL||process.env.AMM_BACKEND_URL||'').trim();
  const backendProxy=Boolean(backend&&/^https?:\/\//.test(backend)&&!backend.includes('your-amm-backend.example.com')&&!backend.includes('tryamm.online'));
  const providers={openai,gemini,claude,deepseek,ammBackend:backendProxy};
  const provider=openai?'openai':gemini?'gemini':claude?'claude':deepseek?'deepseek':backendProxy?'amm-backend':'none';
  return res.status(provider==='none'?503:200).json({
    ok:provider!=='none',service:'HoloGPT',provider,providers,
    model:provider==='gemini'?(process.env.HOLOGPT_GEMINI_MODEL||'configured'):provider==='openai'?process.env.HOLOGPT_OPENAI_MODEL:provider==='claude'?process.env.HOLOGPT_CLAUDE_MODEL:provider==='deepseek'?process.env.HOLOGPT_DEEPSEEK_MODEL:null,
    backendProxyConfigured:backendProxy,
    orchestration:'multi-provider-failover',
    reviewer:'senior-engineer-gate',
    verifier:'evidence-only-green',
    auth:'supabase-when-session-present',
    time:new Date().toISOString()
  });
}
