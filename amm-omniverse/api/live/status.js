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
  res.setHeader('Cache-Control','no-store')
  return res.status(200).json({
    configured,
    readyForPublic:configured,
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
