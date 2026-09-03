export default function handler(req,res){
  if(req.method!=='GET'){
    res.setHeader('Allow','GET')
    return res.status(405).json({error:'Method not allowed'})
  }
  const url=process.env.LIVEKIT_URL||process.env.LIVEKIT_WS_URL||''
  const apiKey=process.env.LIVEKIT_API_KEY||''
  const apiSecret=process.env.LIVEKIT_API_SECRET||''
  const configured=Boolean(url&&apiKey&&apiSecret)
  res.setHeader('Cache-Control','no-store')
  return res.status(200).json({
    configured,
    url:configured?url:undefined,
    tokenEndpoint:'/api/live/token',
    provider:'livekit',
    checks:{url:Boolean(url),apiKey:Boolean(apiKey),apiSecret:Boolean(apiSecret)},
  })
}
