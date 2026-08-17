import{appBaseUrl,twilioApi,twilioConfigured}from'../_lib/twilio.js'

export default async function handler(req,res){
  if(req.method!=='POST')return res.status(405).json({error:'method_not_allowed'})
  if(!twilioConfigured())return res.status(503).json({error:'twilio_not_configured'})
  const expected=process.env.TRYAMM_TEST_CALL_SECRET
  const supplied=String(req.headers['x-tryamm-test-call-secret']||'')
  if(!expected||supplied!==expected)return res.status(401).json({error:'test_call_locked'})
  const allowed=String(process.env.TRYAMM_TEST_CALL_DESTINATION||'').trim()
  if(!allowed)return res.status(503).json({error:'test_destination_not_configured'})
  const requested=String(req.body?.to||allowed).trim()
  if(requested!==allowed)return res.status(403).json({error:'destination_not_authorized'})
  const base=appBaseUrl(req)
  try{
    const call=await twilioApi('/Calls.json',{
      To:allowed,
      From:process.env.TWILIO_PHONE_NUMBER,
      Url:`${base}/api/telephony/twilio/voice`,
      Method:'POST',
      StatusCallback:`${base}/api/telephony/twilio/status`,
      StatusCallbackMethod:'POST',
      StatusCallbackEvent:'initiated ringing answered completed'
    })
    return res.status(201).json({ok:true,provider:'twilio',callSid:call.sid,status:call.status||'queued'})
  }catch(error){
    return res.status(502).json({error:'twilio_test_call_failed',detail:String(error?.message||error).slice(0,200)})
  }
}
