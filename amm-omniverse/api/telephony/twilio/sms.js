import{formBody,twilioConfigured,twiml,validateTwilio,xmlEscape}from'../../../_lib/twilio.js'

const STOP=new Set(['stop','quit','end','revoke','opt out','optout','cancel','unsubscribe'])
const HELP=new Set(['help','info'])

export default async function handler(req,res){
  if(req.method!=='POST')return res.status(405).json({error:'method_not_allowed'})
  if(!twilioConfigured())return res.status(503).json({error:'twilio_not_configured'})
  const form=formBody(req)
  if(!validateTwilio(req,form))return res.status(401).json({error:'invalid_twilio_signature'})
  const body=String(form.Body||'').trim().toLowerCase().replace(/\s+/g,' ')
  let reply='Thank you. TRYAMM received your message.'
  if(STOP.has(body)){
    reply='You have requested to stop TRYAMM marketing texts. Your request must be honored. Reply HELP for support.'
    console.info('TRYAMM_SMS_OPTOUT',JSON.stringify({from:form.From||null,messageSid:form.MessageSid||null,at:new Date().toISOString()}))
  }else if(HELP.has(body)){
    reply='TRYAMM support is available through the app and published support channels. Reply STOP to stop marketing texts.'
  }
  return twiml(res,`<Message>${xmlEscape(reply)}</Message>`)
}
