import {adminRest} from './supabase-admin.js'
import {audit,recentlyAuthenticated} from './security.js'

const nowIso=()=>new Date().toISOString()
const minutesAgo=m=>new Date(Date.now()-m*60*1000).toISOString()
const hoursSince=value=>{const t=Date.parse(String(value||''));return Number.isFinite(t)?Math.max(0,(Date.now()-t)/3600000):Number.POSITIVE_INFINITY}

const clampScore=n=>Math.max(0,Math.min(100,Math.round(n)))

async function recentRiskEvents(userId,minutes=10){
  try{
    const rows=await adminRest('security_audit_events',{query:{
      user_id:'eq.'+userId,
      event_type:'like.fraud_%',
      created_at:'gt.'+minutesAgo(minutes),
      order:'created_at.desc',
      limit:50
    }})
    return Array.isArray(rows)?rows:[]
  }catch{return[]}
}

export async function evaluateFraudRisk(req,user,input={}){
  const reasons=[]
  let score=0
  const action=String(input.action||'payment').toLowerCase()
  const amountMinor=Math.max(0,Math.floor(Number(input.amountMinor||0)))
  const currency=String(input.currency||'USD').toUpperCase()
  const deviceId=String(input.deviceId||req.headers['x-tryamm-device-id']||'').trim()
  const sessionAge=Number(user?.__security?.authAgeSeconds)
  const accountAgeHours=hoursSince(user?.created_at)

  const recent=await recentRiskEvents(user.id,10)
  const attempts=recent.length
  if(attempts>=8){score+=40;reasons.push('high_recent_attempt_velocity')}
  else if(attempts>=4){score+=18;reasons.push('elevated_recent_attempt_velocity')}

  if(amountMinor>=500000){score+=35;reasons.push('very_high_transaction_amount')}
  else if(amountMinor>=250000){score+=22;reasons.push('high_transaction_amount')}
  else if(amountMinor>=100000){score+=10;reasons.push('elevated_transaction_amount')}

  if(['payout','withdrawal','creator-payout','merchant-payout'].includes(action)){score+=18;reasons.push('money_out_action')}
  if(['gift','live-gift'].includes(action)&&amountMinor>=50000){score+=12;reasons.push('high_value_gift')}

  if(accountAgeHours<24){score+=22;reasons.push('new_account_under_24h')}
  else if(accountAgeHours<168){score+=10;reasons.push('new_account_under_7d')}

  if(!deviceId){score+=8;reasons.push('missing_device_continuity_signal')}
  if(!Number.isFinite(sessionAge)||sessionAge>3600){score+=8;reasons.push('stale_authentication')}

  if(input.recipientId&&String(input.recipientId)===String(user.id)){score+=25;reasons.push('self_dealing_recipient')}
  if(input.creatorId&&input.scoutId&&String(input.creatorId)===String(input.scoutId)){score+=15;reasons.push('creator_scout_identity_overlap')}
  if(input.merchantId&&input.scoutId&&String(input.merchantId)===String(input.scoutId)){score+=15;reasons.push('merchant_scout_identity_overlap')}

  if(!/^[A-Z]{3}$/.test(currency)){score+=12;reasons.push('invalid_currency_format')}

  score=clampScore(score)
  let decision='ALLOW'
  if(score>=80)decision='BLOCK'
  else if(score>=55)decision='REVIEW'
  else if(score>=30)decision='STEP_UP'

  if(decision==='STEP_UP'&&recentlyAuthenticated(user,600))decision='ALLOW'

  const result={
    schema:'tryamm.fraud.risk.v1',
    decision,
    score,
    reasons,
    action,
    amountMinor,
    currency,
    checks:{
      recentAttemptCount:attempts,
      accountAgeHours:Number.isFinite(accountAgeHours)?Math.round(accountAgeHours):null,
      recentAuthentication:recentlyAuthenticated(user,600),
      deviceContinuity:Boolean(deviceId),
    },
    evaluatedAt:nowIso()
  }

  await audit(user.id,'fraud_'+decision.toLowerCase(),decision==='BLOCK'?'high':decision==='REVIEW'?'medium':'info',{
    action,amountMinor,currency,score,reasons,deviceContinuity:Boolean(deviceId)
  })

  return result
}

export function fraudDecisionAllowsMoney(decision){
  return decision==='ALLOW'
}
