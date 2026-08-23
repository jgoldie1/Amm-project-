import{appBaseUrl,formBody,twilioConfigured,twiml,validateTwilio,xmlEscape}from'../../_lib/twilio.js'

export default async function handler(req,res){
  if(req.method!=='POST')return res.status(405).json({error:'method_not_allowed'})
  if(!twilioConfigured())return res.status(503).json({error:'twilio_not_configured'})
  const form=formBody(req)
  if(!validateTwilio(req,form))return res.status(401).json({error:'invalid_twilio_signature'})
  const greeting=process.env.TRYAMM_CALL_CENTER_GREETING||'Welcome to TRYAMM. Middleverse AI and a human agent can assist you.'
  const media=process.env.TRYAMM_MEDIA_STREAM_WSS_URL
  if(media){
    return twiml(res,`<Connect><Stream url="${xmlEscape(media)}"/></Connect>`)
  }
  const speech=String(form.SpeechResult||'').trim()
  if(speech){
    const acknowledgment='Thank you. TRYAMM received your request. A human agent can assist when needed.'
    return twiml(res,`<Say>${xmlEscape(acknowledgment)}</Say>`)
  }
  const action=`${appBaseUrl(req)}/api/telephony/twilio/voice`
  return twiml(res,`<Gather input="speech dtmf" action="${xmlEscape(action)}" method="POST" speechTimeout="auto"><Say>${xmlEscape(greeting)}</Say></Gather><Say>We did not receive a response. Goodbye.</Say>`)
}
