export default function handler(req,res){
  if(req.method!=='GET'){
    res.setHeader('Allow','GET')
    return res.status(405).json({error:'Method not allowed'})
  }
  const url=process.env.LIVEKIT_URL||''
  const apiKey=process.env.LIVEKIT_API_KEY||''
  const apiSecret=process.env.LIVEKIT_API_SECRET||''
  const supabaseUrl=process.env.SUPABASE_URL||process.env.NEXT_PUBLIC_SUPABASE_URL||process.env.VITE_SUPABASE_URL||''
  const supabaseAdminKey=process.env.SUPABASE_SERVICE_ROLE_KEY||''
  // LIVE is not operational with only a WebRTC account. Room ownership and
  // status require the matching server-side Supabase API as well.
  const checks={
    url:Boolean(url)&&/^wss:\/\//i.test(String(url)),
    apiKey:Boolean(apiKey),
    apiSecret:Boolean(apiSecret),
    supabaseUrl:Boolean(supabaseUrl),
    supabaseAdminKey:Boolean(supabaseAdminKey),
  }
  const configured=Object.values(checks).every(Boolean)
  const missing=Object.entries(checks).filter(([,ok])=>!ok).map(([key])=>key)
  res.setHeader('Cache-Control','no-store')
  return res.status(200).json({
    configured,
    readyForPublic:configured&&process.env.LIVE_PUBLIC_VERIFIED==='true',
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
      guestPublishing:false,
      guestStageApproval:'awaiting-authorized-publish-implementation',
      protectedPause:true,
      giftsHook:true,
      liveShoppingHook:true,
      youthViewerMode:true
    },
    activation:configured?{
      state:'server-prerequisites-configured',
      next:['two-device host/viewer verification','PK and panel verification','moderation verification','mobile reconnect/background interruption verification','load test']
    }:{
      state:'credentials-required',
      requiredEnvironment:['LIVEKIT_URL','LIVEKIT_API_KEY','LIVEKIT_API_SECRET','SUPABASE_URL (or VITE_SUPABASE_URL on server)','SUPABASE_SERVICE_ROLE_KEY'],
      next:['Check Vercel deployment and /api/live/status route','Configure private LiveKit server credentials','Configure Supabase URL and server-only service-role key','Redeploy and verify provider room status','Complete two-device host/viewer checks before public LIVE']
    },
    moneyGate:'LIVE video can be activated independently from paid gifts. Paid gifts/payouts remain disabled until server-authoritative commerce is green.'
  })
}
