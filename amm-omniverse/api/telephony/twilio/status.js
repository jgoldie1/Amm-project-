import{formBody,twilioConfigured,validateTwilio}from'../../_lib/twilio.js'

export default async function handler(req,res){
  if(req.method!=='POST')return res.status(405).json({error:'method_not_allowed'})
  if(!twilioConfigured())return res.status(503).json({error:'twilio_not_configured'})
  const form=formBody(req)
  if(!validateTwilio(req,form))return res.status(401).json({error:'invalid_twilio_signature'})
  const event={
    provider:'twilio',
    callSid:form.CallSid||null,
    messageSid:form.MessageSid||null,
    status:form.CallStatus||form.MessageStatus||'unknown',
    direction:form.Direction||null,
    from:form.From||null,
    to:form.To||null,
    timestamp:new Date().toISOString()
  }
  console.info('TRYAMM_TWILIO_STATUS',JSON.stringify(event))
  res.setHeader('Cache-Control','no-store')
  return res.status(204).end()
}
