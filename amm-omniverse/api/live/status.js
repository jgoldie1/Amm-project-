export default function handler(req,res){
  if(req.method!=='GET'){
    res.setHeader('Allow','GET')
    return res.status(405).json({error:'Method not allowed'})
  }
  const url=process.env.LIVEKIT_URL||process.env.LIVEKIT_WS_URL||''
  const apiKey=process.env.LIVEKIT_API_KEY||''
  const apiSecret=process.env.LIVEKIT_API_SECRET||''
  const checks={url:Boolean(url),apiKey:Boolean(apiKey),apiSecret:Boolean(apiSecret)}
  const configured=Object.values(checks).every(Boolean)
  const missing=Object.entries(checks).filter(([,ok])=>!ok).map(([key])=>key)
  // A configured account is not a certified two-device LIVE service. These flags
  // must be set only after real acceptance evidence is collected and reviewed.
  const verified=name=>String(process.env[name]||'').toLowerCase()==='true'
  const proof={
    hostViewer:verified('TRYAMM_LIVE_HOST_VIEWER_VERIFIED'),
    reconnect:verified('TRYAMM_LIVE_RECONNECT_VERIFIED'),
    moderation:verified('TRYAMM_LIVE_MODERATION_VERIFIED'),
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
    evidence:'Credentials are presence-only checks, not a network connection or agent health probe.',
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
    activation:readyForPublic?{state:'verified-for-public-by-operator',next:['Continue host/viewer monitoring','Track service errors and verify fresh deployments']}:
    configured?{
      state:'provider-configured',
      next:['two-device host/viewer verification','PK and panel verification','moderation verification','mobile reconnect/background interruption verification','load test']
    }:{
      state:'credentials-required',
      requiredEnvironment:['LIVEKIT_URL','LIVEKIT_API_KEY','LIVEKIT_API_SECRET'],
      next:['Create or choose a LiveKit project','Add the three provider values to production environment','Redeploy','Run two-device host/viewer verification before public LIVE']
    },
    moneyGate:'LIVE video can be activated independently from paid gifts. Paid gifts/payouts remain disabled until server-authoritative commerce is green.'
  })
}
