'use strict'

function splitBudget(grossCents,nodeBps,platformBps){
  const gross=Math.max(0,Math.trunc(Number(grossCents)||0))
  const node=Math.floor(gross*Math.max(0,Math.min(10000,Number(nodeBps)||0))/10000)
  const platform=Math.floor(gross*Math.max(0,Math.min(10000,Number(platformBps)||0))/10000)
  const reserve=Math.max(0,gross-node-platform)
  return{gross,node,platform,reserve}
}

async function createPendingEdgeEarnings({supabase,job,nodeId,userId}){
  if(!job?.work_order_id)return{earningEligible:false,receipt:null}
  const {data:order,error:orderError}=await supabase
    .from('tryamm_edge_work_orders')
    .select('id,gross_budget_cents,node_share_bps,platform_share_bps,reserve_share_bps,currency,status,expires_at')
    .eq('id',job.work_order_id)
    .maybeSingle()
  if(orderError)throw orderError
  if(!order||!['funded','dispatching'].includes(order.status))return{earningEligible:false,receipt:null}
  if(new Date(order.expires_at).getTime()<=Date.now())return{earningEligible:false,receipt:null}

  const parts=splitBudget(order.gross_budget_cents,order.node_share_bps,order.platform_share_bps)
  const row={
    work_order_id:order.id,
    edge_job_id:job.id,
    owner_user_id:userId,
    node_id:nodeId,
    gross_cents:parts.gross,
    node_earnings_cents:parts.node,
    platform_revenue_cents:parts.platform,
    reserve_cents:parts.reserve,
    currency:String(order.currency||'USD').toUpperCase(),
    verification_status:'pending',
    payout_status:'blocked',
    evidence:{source:'edge-job-completion',self_reported_payable:false},
  }
  const {data,error}=await supabase.from('tryamm_edge_earnings_ledger')
    .upsert(row,{onConflict:'edge_job_id'})
    .select('id,gross_cents,node_earnings_cents,platform_revenue_cents,reserve_cents,currency,verification_status,payout_status,created_at')
    .single()
  if(error)throw error
  return{earningEligible:true,receipt:data}
}

async function getEdgeEarningsSummary({supabase,userId}){
  const {data,error}=await supabase.from('tryamm_edge_earnings_ledger')
    .select('node_earnings_cents,currency,verification_status,payout_status,created_at')
    .eq('owner_user_id',userId)
    .order('created_at',{ascending:false})
    .limit(500)
  if(error)throw error
  const rows=data||[]
  const sum=statuses=>rows.filter(r=>statuses(r)).reduce((n,r)=>n+Number(r.node_earnings_cents||0),0)
  return{
    currency:'USD',
    pendingCents:sum(r=>r.verification_status==='pending'),
    payableCents:sum(r=>r.verification_status==='verified'&&r.payout_status==='payable'),
    processingCents:sum(r=>r.payout_status==='processing'),
    paidCents:sum(r=>r.payout_status==='paid'),
    reversedCents:sum(r=>r.payout_status==='reversed'||r.verification_status==='reversed'),
    receiptCount:rows.length,
    guaranteed:false,
    note:'Earnings depend on funded customer demand and independent verification. Pending receipts are not payable cash.',
  }
}

module.exports={splitBudget,createPendingEdgeEarnings,getEdgeEarningsSummary}
