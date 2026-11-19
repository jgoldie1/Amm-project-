export default function handler(req,res){
  if(req.method!=='GET'){
    res.setHeader('Allow','GET')
    return res.status(405).json({error:'Method not allowed'})
  }
  const url=String(process.env.LIVEKIT_URL||process.env.LIVEKIT_WS_URL||'').trim()
  const apiKey=String(process.env.LIVEKIT_API_KEY||'').trim()
  const apiSecret=String(process.env.LIVEKIT_API_SECRET||'').trim()
  const checks={
    LIVEKIT_URL:Boolean(url),
    LIVEKIT_API_KEY:Boolean(apiKey),
    LIVEKIT_API_SECRET:Boolean(apiSecret)
  }
  const configured=Object.values(checks).every(Boolean)
  const missing=Object.entries(checks).filter(([,ok])=>!ok).map(([key])=>key)
  res.setHeader('Cache-Control','no-store')
  return res.status(200).json({
    configured,
    readyForPrivateTest:configured,
    readyForPublic:false,
    provider:'livekit',
    url:configured?url:undefined,
    tokenEndpoint:'/api/live/token',
    checks,
    missing,
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
    activation:configured?{
      state:'provider-configured-needs-device-acceptance',
      next:['two-device host/viewer verification','private OBS ingest verification','recording/egress playback verification','PK and panel verification','moderation verification','mobile reconnect/background interruption verification','load test']
    }:{
      state:'credentials-required',
      requiredEnvironment:['LIVEKIT_URL','LIVEKIT_API_KEY','LIVEKIT_API_SECRET'],
      next:['Open the existing LiveKit Cloud project','Copy Project URL and create/retrieve a server API key/secret','Add the three provider values to Vercel as server-side secrets','Redeploy','Run private two-device and OBS verification before public LIVE']
    },
    moneyGate:'LIVE video can be activated independently from paid gifts. Paid gifts/payouts remain disabled until server-authoritative commerce is green.'
  })
}
