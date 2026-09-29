'use strict'
const crypto=require('node:crypto')

function pepper(){
  return String(process.env.MIDDLEWEAR_IDEMPOTENCY_PEPPER||process.env.SESSION_TOKEN_PEPPER||'').trim()
}
function digest(value){
  const key=pepper()
  return key
    ?crypto.createHmac('sha256',key).update(String(value)).digest('hex')
    :crypto.createHash('sha256').update(String(value)).digest('hex')
}
function canonicalHandoff(req,userId){
  const body=req.body||{}
  return JSON.stringify({
    userId:String(userId||''),
    routeKey:String(body.routeKey||'').trim(),
    taskSummary:String(body.taskSummary||'').trim().slice(0,4000),
    targetRef:body.targetRef?String(body.targetRef).slice(0,500):null,
    riskBand:String(body.riskBand||'green').toLowerCase(),
  })
}
function requestKey(req,userId){
  const explicit=String(req.headers?.['idempotency-key']||req.body?.clientRequestId||'').trim()
  if(explicit&&explicit.length>=12&&explicit.length<=200)return digest('explicit:'+userId+':'+explicit)
  return digest('derived:'+canonicalHandoff(req,userId))
}

function createMiddleWearIdempotency({supabase,now=()=>Date.now()}={}){
  if(!supabase)throw new Error('MIDDLEWEAR_IDEMPOTENCY_SUPABASE_REQUIRED')

  async function acquire(req,userId,operation='middleverse.handoff.create'){
    const keyHash=requestKey(req,userId)
    const expiresAt=new Date(now()+10*60*1000).toISOString()
    const row={
      user_id:userId,
      operation,
      key_hash:keyHash,
      status:'pending',
      resource_id:null,
      expires_at:expiresAt,
      metadata:{raw_key_stored:false,derived_when_missing:!String(req.headers?.['idempotency-key']||req.body?.clientRequestId||'').trim()},
    }
    const {data,error}=await supabase.from('middlewear_idempotency_keys').insert(row).select('*').maybeSingle()
    if(!error&&data)return{acquired:true,replay:false,row:data,keyHash}
    if(error&&String(error.code||'')!=='23505')throw error

    const {data:existing,error:lookupError}=await supabase
      .from('middlewear_idempotency_keys')
      .select('*')
      .eq('user_id',userId)
      .eq('operation',operation)
      .eq('key_hash',keyHash)
      .gt('expires_at',new Date(now()).toISOString())
      .maybeSingle()
    if(lookupError)throw lookupError
    if(!existing){
      const retry=await supabase.from('middlewear_idempotency_keys').insert(row).select('*').maybeSingle()
      if(retry.error)throw retry.error
      return{acquired:true,replay:false,row:retry.data,keyHash}
    }
    return{
      acquired:false,
      replay:existing.status==='completed'&&Boolean(existing.resource_id),
      pending:existing.status==='pending',
      resourceId:existing.resource_id||null,
      row:existing,
      keyHash,
    }
  }

  async function complete(rowId,resourceId){
    if(!rowId)return
    const {error}=await supabase.from('middlewear_idempotency_keys')
      .update({status:'completed',resource_id:String(resourceId),updated_at:new Date(now()).toISOString()})
      .eq('id',rowId)
    if(error)throw error
  }

  async function fail(rowId){
    if(!rowId)return
    await supabase.from('middlewear_idempotency_keys')
      .update({status:'failed',updated_at:new Date(now()).toISOString()})
      .eq('id',rowId)
  }

  return{acquire,complete,fail,requestKey}
}

module.exports={createMiddleWearIdempotency,requestKey,canonicalHandoff}
