const configured=v=>Boolean(String(v||'').trim())

export default async function handler(req,res){
  res.setHeader('Cache-Control','no-store')
  if(req.method!=='GET')return res.status(405).json({ok:false,error:'Method not allowed'})

  const providers={
    openai:configured(process.env.OPENAI_API_KEY)&&configured(process.env.HOLOGPT_OPENAI_MODEL),
    gemini:configured(process.env.GEMINI_API_KEY||process.env.GOOGLE_API_KEY),
    claude:configured(process.env.ANTHROPIC_API_KEY)&&configured(process.env.HOLOGPT_CLAUDE_MODEL),
    deepseek:configured(process.env.DEEPSEEK_API_KEY)&&configured(process.env.HOLOGPT_DEEPSEEK_MODEL),
    ammBackend:configured(process.env.AMM_BACKEND_URL||process.env.VITE_API_URL)&&!String(process.env.AMM_BACKEND_URL||process.env.VITE_API_URL||'').includes('your-amm-backend.example.com')
  }
  const anyModel=Object.values(providers).some(Boolean)
  const supabase=configured(process.env.VITE_SUPABASE_URL)&&configured(process.env.VITE_SUPABASE_ANON_KEY)
  const serviceRole=configured(process.env.SUPABASE_SERVICE_ROLE_KEY)
  const audioInput=configured(process.env.TRYAMM_STT_ENDPOINT)||anyModel
  const audioOutput=configured(process.env.TRYAMM_TTS_ENDPOINT)
  const middleverseConnectors=configured(process.env.TWILIO_ACCOUNT_SID)||configured(process.env.TRYAMM_MEDIA_STREAM_WSS_URL)

  const components={
    hologpt:{configured:anyModel,status:anyModel?'READY_FOR_RESPONSE_TEST':'BLOCKED_MODEL_PROVIDER',role:'primary orchestrator'},
    stubbsAI:{configured:anyModel||providers.ammBackend,status:(anyModel||providers.ammBackend)?'CONNECTED_RUNTIME':'BLOCKED_PROVIDER',role:'executive reasoning'},
    lyonsTechAI:{configured:anyModel,status:anyModel?'CONNECTED_TO_MODEL_ROUTER':'BLOCKED_PROVIDER',role:'engineering and senior review'},
    middleverseAI:{configured:anyModel,status:anyModel?'AI_READY':'BLOCKED_PROVIDER',connectorsConfigured:middleverseConnectors,role:'operations and service coordination'},
    holoverse:{configured:true,status:supabase?'WORLD_LAYER_WITH_AUTH_STATE':'WORLD_LAYER_DEMO_STATE',role:'application/world experience layer'},
    persistentState:{configured:supabase&&serviceRole,status:supabase&&serviceRole?'SERVER_PERSISTENCE_CONFIGURED':supabase?'BROWSER_AUTH_CONFIGURED_SERVER_WRITE_UNVERIFIED':'BLOCKED_SUPABASE'},
    guardian:{configured:true,status:'POLICY_GATE_ACTIVE',role:'authorization, safety, rollback and evidence gate'}
  }

  const fiveSenseAdapters={
    sight:{status:anyModel?'MODEL_CAPABILITY_DEPENDS_ON_SELECTED_PROVIDER':'BLOCKED_MODEL_PROVIDER',literalSense:false},
    hearing:{status:audioInput?'INPUT_ADAPTER_AVAILABLE_OR_MODEL_CAPABLE':'BLOCKED_AUDIO_INPUT',literalSense:false},
    touch:{status:'BROWSER_DEVICE_EVENTS_AVAILABLE',literalSense:false},
    smell:{status:'EXTERNAL_SENSOR_REQUIRED',literalSense:false},
    taste:{status:'EXTERNAL_SENSOR_REQUIRED',literalSense:false}
  }

  const blockers=[]
  if(!anyModel)blockers.push('No live generative provider is configured for HoloGPT full-response intelligence.')
  if(!supabase)blockers.push('Supabase browser auth configuration is missing.')
  if(!serviceRole)blockers.push('Supabase service-role persistence is not verified server-side.')

  res.status(anyModel?200:503).json({
    ok:anyModel,
    system:'TRYAMM Intelligence Hierarchy',
    literalConsciousness:false,
    selfModel:'operational software self-model only',
    hierarchy:['HoloGPT','Stubbs AI','Lyons Tech AI','Middleverse AI','Guardian Brain'],
    providers,components,fiveSenseAdapters,blockers,
    releaseRule:'COMMITTED -> DEPLOYED -> VERIFIED -> GREEN',
    time:new Date().toISOString()
  })
}
