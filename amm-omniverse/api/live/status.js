export default function handler(req,res){
  if(req.method!=='GET'){
    res.setHeader('Allow','GET')
    return res.status(405).json({error:'Method not allowed'})
  }
  const url=process.env.LIVEKIT_URL||''
  const apiKey=process.env.LIVEKIT_API_KEY||''
  const apiSecret=process.env.LIVEKIT_API_SECRET||''
  const checks={url:Boolean(url),apiKey:Boolean(apiKey),apiSecret:Boolean(apiSecret)}
  const configured=Object.values(checks).every(Boolean)
  const missing=Object.entries(checks).filter(([,ok])=>!ok).map(([key])=>key)
  // Operator evidence flags are not a LiveKit network-health probe. Never claim
  // an active stream or healthy AI worker from the existence of API keys.
  const verified=name=>String(process.env[name]||'').toLowerCase()==='true'
  const proof={
    hostViewer:verified('TRYAMM_LIVE_HOST_VIEWER_VERIFIED'),
    reconnect:verified('TRYAMM_LIVE_RECONNECT_VERIFIED'),
    moderation:verified('TRYAMM_LIVE_MODERATION_VERIFIED'),
    agentWorker:verified('TRYAMM_LIVE_AGENT_WORKER_VERIFIED'),
  }
  const readyForPublic=configured&&Object.values(proof).every(Boolean)
  res.setHeader('Cache-Control','no-store')
  return res.status(200).json({
    configured,
    readyForPublic,
    provider:'livekit',
    url:configured?url:undefined,
    tokenEndpoint:'/api/live/token',
    checks,
    missing,
    proof,
    evidence:'Presence-only credential flags; actual host/viewer and AI agent health must be verified independently.',
    capabilities:{
      hostViewerRooms:true,
      cameraMic:true,
      adaptiveStreaming:true,
      dynacast:true,
      pkMode:true,
      multiPanelMax:20,
      protectedPause:true,
      giftsHook:true,
      liveShoppingHook:true,
      youthViewerMode:true
    },
    activation:readyForPublic?{state:'operator-evidence-recorded',next:['Continue real room and agent monitoring']}:configured?{
      state:'provider-configured',
      next:['agent-worker health/room join verification','two-device host/viewer verification','PK and panel verification','moderation verification','mobile reconnect/background interruption verification','load test']
    }:{
      state:'credentials-required',
      requiredEnvironment:['LIVEKIT_URL','LIVEKIT_API_KEY','LIVEKIT_API_SECRET'],
      next:['Create or choose a LiveKit project','Add the three provider values to production environment','Redeploy','Run two-device host/viewer verification before public LIVE']
    },
    moneyGate:'LIVE video can be activated independently from paid gifts. Paid gifts/payouts remain disabled until server-authoritative commerce is green.'
  })
}
