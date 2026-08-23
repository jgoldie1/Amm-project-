export default async function handler(req,res){
  res.setHeader('Cache-Control','no-store');
  if(req.method!=='GET')return res.status(405).json({ok:false,error:'Method not allowed'});
  const gemini=Boolean(process.env.GEMINI_API_KEY||process.env.GOOGLE_API_KEY);
  const openai=Boolean(process.env.OPENAI_API_KEY&&process.env.HOLOGPT_OPENAI_MODEL);
  const backend=String(process.env.VITE_API_URL||process.env.AMM_BACKEND_URL||'').trim();
  const backendProxy=Boolean(backend&&/^https?:\/\//.test(backend)&&!backend.includes('your-amm-backend.example.com'));
  const provider=gemini?'gemini':openai?'openai':backendProxy?'amm-backend':'none';
  return res.status(provider==='none'?503:200).json({
    ok:provider!=='none',service:'HoloGPT',provider,
    model:provider==='gemini'?(process.env.HOLOGPT_GEMINI_MODEL||'gemini-2.0-flash'):provider==='openai'?process.env.HOLOGPT_OPENAI_MODEL:null,
    backendProxyConfigured:backendProxy,
    auth:'supabase-when-session-present',
    time:new Date().toISOString()
  });
}
