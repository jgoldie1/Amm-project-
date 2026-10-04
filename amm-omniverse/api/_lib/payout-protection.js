import {adminRest} from './supabase-admin.js'
import {audit,recentlyAuthenticated} from './security.js'
import {evaluateFraudRisk} from './fraud-shield.js'

const hoursSince=value=>{const t=Date.parse(String(value||''));return Number.isFinite(t)?Math.max(0,(Date.now()-t)/3600000):Number.POSITIVE_INFINITY}

async function hasPriorCompletedPayout(userId){
  try{
    const rows=await adminRest('security_audit_events',{query:{
      user_id:'eq.'+userId,
      event_type:'eq.payout_completed',
      order:'created_at.desc',
      limit:1
    }})
    return Boolean(rows?.[0])
  }catch{return false}
}

async function openSellerDisputes(userId){
  try{
    const rows=await adminRest('commerce_disputes',{query:{
      seller_user_id:'eq.'+userId,
      status:'eq.open',
      order:'created_at.desc',
      limit:25
    }})
    return Array.isArray(rows)?rows:[]
  }catch{return[]}
}

export async function evaluatePayoutProtection(req,user,input={}){
  const amountMinor=Math.max(0,Math.floor(Number(input.amountMinor||0)))
  const currency=String(input.currency||'USD').toUpperCase()
  const role=String(input.role||'creator').toLowerCase()
  const priorPayout=await hasPriorCompletedPayout(user.id)
  const disputes=await openSellerDisputes(user.id)
  const accountAgeHours=hoursSince(user?.created_at)

  const fraud=await evaluateFraudRisk(req,user,{
    action:role==='merchant'?'merchant-payout':'creator-payout',
    amountMinor,
    currency,
    recipientId:user.id,
    deviceId:input.deviceId
  })

  const reasons=[...fraud.reasons]
  let decision=fraud.decision
  let holdHours=0
  let requireStepUp=false

  if(disputes.length){
    decision='BLOCK'
    reasons.push('open_seller_dispute')
  }

  if(!priorPayout&&decision!=='BLOCK'){
    holdHours=Math.max(holdHours,24)
    if(decision==='ALLOW')decision='REVIEW'
    reasons.push('first_payout_hold')
  }

  if(accountAgeHours<72&&decision!=='BLOCK'){
    holdHours=Math.max(holdHours,48)
    if(decision==='ALLOW')decision='REVIEW'
    reasons.push('young_account_payout_hold')
  }

  if(amountMinor>=100000&&decision!=='BLOCK'){
    requireStepUp=true
    if(!recentlyAuthenticated(user,600)&&decision==='ALLOW')decision='STEP_UP'
    reasons.push('large_payout_step_up')
  }

  if(amountMinor>=500000&&decision!=='BLOCK'){
    holdHours=Math.max(holdHours,24)
    if(decision==='ALLOW')decision='REVIEW'
    reasons.push('very_large_payout_manual_review')
  }

  const holdUntil=holdHours?new Date(Date.now()+holdHours*3600000).toISOString():null
  const allowed=decision==='ALLOW'&&holdHours===0&&!requireStepUp

  const result={
    schema:'tryamm.payout.protection.v1',
    decision,
    allowed,
    holdHours,
    holdUntil,
    requireStepUp,
    reasons:[...new Set(reasons)],
    amountMinor,
    currency,
    role,
    checks:{
      priorCompletedPayout:priorPayout,
      openSellerDisputes:disputes.length,
      recentAuthentication:recentlyAuthenticated(user,600),
      accountAgeHours:Number.isFinite(accountAgeHours)?Math.round(accountAgeHours):null,
      fraudScore:fraud.score
    }
  }

  await audit(user.id,'payout_protection_'+String(decision).toLowerCase(),decision==='BLOCK'?'high':decision==='REVIEW'?'medium':'info',{
    amountMinor,currency,role,holdHours,requireStepUp,reasons:result.reasons,fraudScore:fraud.score
  })

  return result
}
