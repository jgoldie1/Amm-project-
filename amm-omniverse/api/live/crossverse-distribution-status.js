// Server-only configuration inventory. Never expose RTMP URLs containing keys or secrets.
const TARGETS=[
  {id:'youtube',label:'YouTube Live',flag:'TRYAMM_STREAM_YOUTUBE_ENABLED',credential:'TRYAMM_STREAM_YOUTUBE_KEY'},
  {id:'twitch',label:'Twitch',flag:'TRYAMM_STREAM_TWITCH_ENABLED',credential:'TRYAMM_STREAM_TWITCH_KEY'},
  {id:'facebook',label:'Facebook Live',flag:'TRYAMM_STREAM_FACEBOOK_ENABLED',credential:'TRYAMM_STREAM_FACEBOOK_KEY'},
  {id:'instagram',label:'Instagram Live',flag:'TRYAMM_STREAM_INSTAGRAM_ENABLED',credential:'TRYAMM_STREAM_INSTAGRAM_KEY'},
  {id:'tiktok',label:'TikTok LIVE',flag:'TRYAMM_STREAM_TIKTOK_ENABLED',credential:'TRYAMM_STREAM_TIKTOK_KEY'},
  {id:'custom-rtmp',label:'Approved RTMP relay',flag:'TRYAMM_STREAM_CUSTOM_ENABLED',credential:'TRYAMM_STREAM_CUSTOM_KEY'},
]
const enabled=value=>String(value||'').toLowerCase()==='true'
export default function handler(req,res){
  res.setHeader('Cache-Control','no-store')
  res.setHeader('X-Content-Type-Options','nosniff')
  if(req.method!=='GET'){
    res.setHeader('Allow','GET')
    return res.status(405).json({error:'Method not allowed'})
  }
  // A boolean configuration check is NOT a test of delivery, provider access,
  // account permissions, ingest health, OBS connection, or streaming success.
  const destinations=TARGETS.map(t=>{
    const configured=enabled(process.env[t.flag])&&Boolean(String(process.env[t.credential]||'').trim())
    return{id:t.id,label:t.label,configured,verified:false,state:configured?'configuration-only':'not-configured'}
  })
  return res.status(200).json({
    mode:'configuration-inventory',
    acceptingIngest:false,
    activeRelay:false,
    automatedPublishing:false,
    liveProviderVerification:false,
    destinationCount:destinations.filter(d=>d.configured).length,
    destinations,
    sourceModes:['obs-landscape','obs-vertical','browser-live','local-video-upload'],
    next:'An authenticated server-side ingest/egress relay, provider verification, and real broadcast evidence are required before a destination can be marked verified.',
  })
}
