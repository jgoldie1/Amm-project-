const present=(name)=>Boolean(process.env[name]&&String(process.env[name]).trim())
const httpsUrl=(name)=>/^https:\/\//.test(String(process.env[name]||''))
const livekitUrl=/^(wss|https):\/\//.test(String(process.env.LIVEKIT_URL||''))

const rows=[
  {gate:'migration-013',status:process.env.TRYAMM_MIGRATION_013_VERIFIED==='1'?'GREEN':'YELLOW',evidence:'live database verification required'},
  {gate:'environment',status:httpsUrl('VITE_APP_URL')&&httpsUrl('VITE_API_URL')&&present('SUPABASE_SERVICE_ROLE_KEY')?'GREEN':'YELLOW',evidence:'production environment contract'},
  {gate:'auth-device',status:process.env.TRYAMM_AUTH_DEVICE_PROOF==='1'?'GREEN':'YELLOW',evidence:'real supported Auth session proof'},
  {gate:'live-two-device',status:process.env.TRYAMM_LIVE_TWO_DEVICE_PROOF==='1'&&livekitUrl&&present('LIVEKIT_API_KEY')&&present('LIVEKIT_API_SECRET')?'GREEN':'YELLOW',evidence:'two isolated clients + audio/video evidence'},
  {gate:'chat-gifts',status:process.env.TRYAMM_CHAT_GIFT_PROOF==='1'?'GREEN':'YELLOW',evidence:'realtime chat + server-authoritative gift evidence'},
  {gate:'money-engine',status:process.env.TRYAMM_MONEY_SANDBOX_PROOF==='1'?'GREEN':'YELLOW',evidence:'balanced/idempotent/refund/provider sandbox evidence'},
  {gate:'internal-chain',status:process.env.TRYAMM_INTERNAL_CHAIN_PROOF==='1'?'GREEN':'YELLOW',evidence:'receipt + previous-hash linkage proof'},
  {gate:'quantum-sandbox',status:process.env.TRYAMM_QUANTUM_SANDBOX_PROOF==='1'?'GREEN':'YELLOW',evidence:'fault-suite evidence'},
  {gate:'recording-reels',status:process.env.TRYAMM_RECORDING_REEL_PROOF==='1'?'GREEN':'YELLOW',evidence:'record -> private store -> process -> replay/reel'},
  {gate:'deployed-smoke',status:process.env.TRYAMM_DEPLOYED_SMOKE_PROOF==='1'?'GREEN':'YELLOW',evidence:'production route smoke evidence'},
  {gate:'accessibility-global-network',status:process.env.TRYAMM_GLOBAL_A11Y_NETWORK_PROOF==='1'?'GREEN':'YELLOW',evidence:'mobile/a11y/localization/constrained-network proof'},
]

const overall=rows.some(r=>r.status==='RED')?'RED':rows.every(r=>r.status==='GREEN')?'GREEN':'YELLOW'
console.log(JSON.stringify({overall,generatedAt:new Date().toISOString(),rows},null,2))
if(process.env.REQUIRE_GREEN==='1'&&overall!=='GREEN') process.exit(2)
