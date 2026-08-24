'use strict'

const express = require('express')

function bearer(req){
  const header=String(req.headers.authorization||'')
  return header.startsWith('Bearer ')?header.slice(7):null
}

function hasOperatorRole(user){
  const role=String(user?.app_metadata?.role||user?.user_metadata?.role||'').toLowerCase()
  return ['owner','admin','finance','compliance'].includes(role)
}

function createOwnershipFinanceRouter({supabase}){
  const router=express.Router()

  router.get('/health',async(_req,res)=>{
    const tables=['regulated_assets','fractional_positions','ownership_transactions','asset_distributions','financial_partner_accounts','wallets','wallet_transactions']
    const checks={}
    for(const table of tables){
      const {error}=await supabase.from(table).select('*',{head:true,count:'exact'}).limit(1)
      checks[table]=!error
    }
    res.json({
      ok:Object.values(checks).every(Boolean),
      service:'TRYAMM Ownership + Financial Hub',
      checks,
      bankingModel:'partner-mediated',
      fractionalOwnership:'compliance-gated',
      directBankClaim:false,
      directSecuritiesExchangeClaim:false,
      publicBalances:false,
    })
  })

  async function requireUser(req,res,next){
    const token=bearer(req)
    if(!token)return res.status(401).json({error:'Authentication required'})
    const {data,error}=await supabase.auth.getUser(token)
    if(error||!data?.user)return res.status(401).json({error:'Invalid session'})
    req.user=data.user
    next()
  }

  router.get('/me/positions',requireUser,async(req,res)=>{
    const {data,error}=await supabase.from('fractional_positions')
      .select('id,asset_id,units,pending_units,restricted_units,cost_basis_minor,status,metadata,updated_at,regulated_assets(asset_key,asset_type,title,jurisdiction,classification_status,offering_status,currency,transfer_restricted,custody_provider)')
      .eq('holder_user_id',req.user.id)
      .order('updated_at',{ascending:false})
    if(error)return res.status(500).json({error:'Ownership positions unavailable'})
    res.json({positions:data||[]})
  })

  router.get('/me/partner-accounts',requireUser,async(req,res)=>{
    const {data,error}=await supabase.from('financial_partner_accounts')
      .select('id,provider,account_type,currency,status,capabilities,metadata,created_at,updated_at')
      .eq('user_id',req.user.id)
      .order('created_at',{ascending:false})
    if(error)return res.status(500).json({error:'Financial partner accounts unavailable'})
    res.json({accounts:data||[]})
  })

  async function requireOperator(req,res,next){
    await requireUser(req,res,async()=>{
      if(!hasOperatorRole(req.user))return res.status(403).json({error:'Finance/compliance operator role required'})
      next()
    })
  }

  router.post('/assets',requireOperator,async(req,res)=>{
    const b=req.body||{}
    const assetKey=String(b.assetKey||'').trim()
    const title=String(b.title||'').trim()
    const assetType=String(b.assetType||'').trim()
    const totalUnits=Number(b.totalUnits)
    if(!assetKey||!title||!assetType||!Number.isInteger(totalUnits)||totalUnits<=0)return res.status(400).json({error:'assetKey, title, assetType and positive integer totalUnits required'})
    const row={
      asset_key:assetKey,
      asset_type:assetType,
      title,
      jurisdiction:b.jurisdiction||null,
      issuer_entity:b.issuerEntity||null,
      classification_status:'unclassified',
      offering_status:'draft',
      valuation_minor:Number.isFinite(b.valuationMinor)?Math.trunc(b.valuationMinor):null,
      currency:String(b.currency||'USD').toUpperCase().slice(0,3),
      total_units:totalUnits,
      transfer_restricted:true,
      custody_provider:b.custodyProvider||null,
      metadata:b.metadata&&typeof b.metadata==='object'?b.metadata:{},
    }
    const {data,error}=await supabase.from('regulated_assets').insert(row).select('*').single()
    if(error)return res.status(500).json({error:'Could not register asset'})
    res.status(201).json({asset:data,execution:'Registry only. Asset is not open for investment until classification/compliance approval is recorded.'})
  })

  router.post('/transactions/propose',requireOperator,async(req,res)=>{
    const b=req.body||{}
    const assetId=String(b.assetId||'').trim()
    const holderUserId=String(b.holderUserId||'').trim()
    const canonicalEventId=String(b.canonicalEventId||'').trim()
    const unitsDelta=Number(b.unitsDelta)
    if(!assetId||!holderUserId||!canonicalEventId||!Number.isInteger(unitsDelta)||unitsDelta===0)return res.status(400).json({error:'assetId, holderUserId, canonicalEventId and nonzero integer unitsDelta required'})
    const {data:asset,error:assetError}=await supabase.from('regulated_assets').select('classification_status,offering_status,transfer_restricted').eq('id',assetId).maybeSingle()
    if(assetError||!asset)return res.status(404).json({error:'Asset not found'})
    if(asset.classification_status==='unclassified')return res.status(409).json({error:'Asset classification must be completed before ownership transactions'})
    if(!['approved','open'].includes(asset.offering_status))return res.status(409).json({error:'Asset offering is not approved/open'})
    const row={
      asset_id:assetId,
      holder_user_id:holderUserId,
      event_type:String(b.eventType||'purchase'),
      units_delta:unitsDelta,
      gross_minor:Number.isFinite(b.grossMinor)?Math.trunc(b.grossMinor):null,
      currency:String(b.currency||'USD').toUpperCase().slice(0,3),
      canonical_event_id:canonicalEventId,
      wallet_transaction_id:b.walletTransactionId||null,
      ledger_reference:b.ledgerReference||null,
      provider:b.provider||null,
      provider_reference:b.providerReference||null,
      status:'pending',
      compliance_state:'review',
      metadata:b.metadata&&typeof b.metadata==='object'?b.metadata:{},
    }
    const {data,error}=await supabase.from('ownership_transactions').insert(row).select('*').single()
    if(error)return res.status(500).json({error:'Could not propose ownership transaction'})
    res.status(201).json({transaction:data,execution:'Proposal only. No ownership units or funds move until compliance approval and verified ledger settlement.'})
  })

  return router
}

module.exports={createOwnershipFinanceRouter,hasOperatorRole}
