const HIGH_RISK_PHRASES = [
  /gift\s*card/i,
  /wire\s+money/i,
  /send\s+crypto/i,
  /seed\s+phrase/i,
  /remote\s+access/i,
  /social\s+security\s+number/i,
  /act\s+now/i,
  /warrant|arrest|jail/i,
]

function clamp(n,min=0,max=100){ return Math.max(min,Math.min(max,Number(n)||0)) }

function analyzeCommunication(signal={}){
  let score=0
  const reasons=[]
  if(signal.stirShaken==='fail'){ score+=30; reasons.push('caller identity authentication failed') }
  else if(signal.stirShaken==='unknown'){ score+=8; reasons.push('caller identity not authenticated') }
  if(signal.reputation==='known_bad'){ score+=45; reasons.push('number has bad reputation') }
  if(Number(signal.velocityLastHour||0)>20){ score+=20; reasons.push('unusual call/message velocity') }
  if(signal.syntheticVoiceRisk!=null){
    const r=clamp(signal.syntheticVoiceRisk)
    if(r>=80){ score+=30; reasons.push('high synthetic-voice risk') }
    else if(r>=60){ score+=15; reasons.push('elevated synthetic-voice risk') }
  }
  const text=String(signal.transcript||signal.messageText||'')
  for(const pattern of HIGH_RISK_PHRASES){ if(pattern.test(text)){ score+=12; reasons.push(`scam-language signal: ${pattern.source}`) } }
  if(signal.requestsSecret===true){ score+=35; reasons.push('requested credential/secret') }
  if(signal.paymentPressure===true){ score+=25; reasons.push('urgent payment pressure') }
  score=clamp(score)
  const action = score>=80?'block_or_quarantine':score>=55?'verify_then_route':score>=30?'screen_and_warn':'allow'
  return {score,action,reasons:[...new Set(reasons)],confidence: reasons.length>=3?'high':reasons.length>=1?'medium':'low'}
}

function shouldProtectSpend({attemptsLastHour=0,estimatedCostUsd=0,destinationRisk='normal'}={}){
  if(destinationRisk==='premium'||destinationRisk==='restricted') return {allow:false,reason:'destination requires approval'}
  if(Number(attemptsLastHour)>50) return {allow:false,reason:'telecom velocity limit exceeded'}
  if(Number(estimatedCostUsd)>Number(process.env.OMNISHIELD_SINGLE_EVENT_LIMIT_USD||5)) return {allow:false,reason:'single-event spend limit exceeded'}
  return {allow:true}
}

module.exports={analyzeCommunication,shouldProtectSpend}
