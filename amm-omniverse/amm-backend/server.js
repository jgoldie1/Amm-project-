require('dotenv').config()
const express = require('express')
const cors = require('cors')
const Stripe = require('stripe')
const { createClient } = require('@supabase/supabase-js')
const { createOmniverseRouter } = require('./routes/omniverse')
const { createAIRouter } = require('./routes/ai')
const { createHoloCoreRouter } = require('./routes/holo-core')
const { createUniversityRouter } = require('./routes/university')
const { createFamilyVenturesRouter } = require('./routes/family-ventures')
const { createLegacyHeirsRouter } = require('./routes/legacy-heirs')
const { createLegacySecureRouter } = require('./routes/legacy-secure')
const { createTreasuryRouter } = require('./routes/treasury')
const { createFinancialTruthRouter } = require('./routes/financial-truth')
const { createReleaseControlRouter } = require('./routes/release-control')
const { createLiveRouter } = require('./routes/live')
const { createModerationRouter } = require('./routes/moderation')
const { createWorkforceRouter } = require('./routes/workforce')
const { createMiddleverseRouter } = require('./routes/middleverse')
const { createAssetForgeRouter } = require('./routes/asset-forge')
const { createEdgeNodeRouter } = require('./routes/edge-node')
const { createEdgeGridRouter } = require('./routes/edge-grid')
const { createVehicleRentalRouter } = require('./routes/vehicle-rentals')
const { createVehicleRecoveryRouter } = require('./routes/vehicle-recovery')
const { postCheckoutToTreasury, postInvoiceToTreasury, postRefundToTreasury, postDisputeToTreasury } = require('./lib/treasury-ledger')
const signLanguage = require('./signLanguageService')
const { jacobieSecurityHeaders, noStoreSensitive } = require('./lib/jacobie-security-headers')
const { createRedHatSentinel } = require('./lib/red-hat-sentinel')
const { createRedHatSentinelRouter } = require('./routes/red-hat-sentinel')
const { createJacobieSwarmShield } = require('./lib/jacobie-swarm-shield')
const { createMiddleWearSecurityGateway } = require('./lib/middlewear-security-gateway')
const { createMiddleWearResilience } = require('./lib/middlewear-resilience')
const http = require('http')

const app = express()

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) throw new Error('SUPABASE_URL and SUPABASE_SERVICE_KEY are required')
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY,{maxNetworkRetries:2,timeout:10_000}) : null
const redHatSentinel = createRedHatSentinel({ supabase })
const jacobieSwarmShield = createJacobieSwarmShield()
const middleWearSecurity = createMiddleWearSecurityGateway({ supabase })
const middleWearResilience = createMiddleWearResilience()

app.disable('x-powered-by')
app.set('trust proxy', 1)
app.use(jacobieSecurityHeaders)
app.use(redHatSentinel.middleware)
app.use(jacobieSwarmShield.middleware)
app.use(middleWearResilience.middleware)
app.use(cors({ origin:['https://tryamm.online','https://www.tryamm.online','https://amm-omniverse.vercel.app','http://localhost:5173',process.env.FRONTEND_URL].filter(Boolean), credentials:true }))
app.use('/api/stripe/webhook', noStoreSensitive, express.raw({ type:'application/json' }))
app.use(express.json({ limit:'2mb' }))
for (const path of redHatSentinel.canaryPaths) app.all(path, redHatSentinel.decoyHandler)

app.get('/', (_req,res)=>res.json({ name:'AMM Omniverse Backend', status:'online', version:'1.11.0-release-control', systems:['stripe','supabase','livekit','living-worlds','ai-cafe','workforce','middleverse','kingdoms-press','app-store','stubbs-ai','hologpt','holo-services','holo-core','all-american-university','family-legacy','heirs-legacy-kids','omni-treasury','financial-truth','release-control','release-observability','reserve-buckets','auto-ledger','sign-language','tryamm-live','moderation-reporting'] }))
app.get('/api/livez', (_req,res)=>res.status(200).json({ok:true,service:'amm-backend',processAlive:true,ts:Date.now()}))
app.get('/api/readyz', async (_req,res)=>{
  let database=false
  try{const {error}=await supabase.from('worlds').select('id').limit(1);database=!error}catch(_){database=false}
  const critical={database,serviceKey:Boolean(process.env.SUPABASE_SERVICE_KEY),supabaseUrl:Boolean(process.env.SUPABASE_URL)}
  const ready=Object.values(critical).every(Boolean)
  return res.status(ready?200:503).json({ok:ready,critical,resilience:middleWearResilience.status(),ts:Date.now()})
})
app.get('/api/health', async (_req,res)=>{
  let database=false
  let releaseRegistry=false
  let releaseHealth=false
  try { const { error }=await supabase.from('worlds').select('id').limit(1); database=!error } catch(_) {}
  try { const { error }=await supabase.from('release_registry').select('id').limit(1); releaseRegistry=!error } catch(_) {}
  try { const { error }=await supabase.from('release_health_samples').select('id').limit(1); releaseHealth=!error } catch(_) {}
  res.json({ ok:true, ts:Date.now(), version:'1.11.0-release-control', services:{ supabase:Boolean(process.env.SUPABASE_URL), livingWorldsSchema:database, stripe:Boolean(stripe), livekit:Boolean(process.env.LIVEKIT_API_KEY&&process.env.LIVEKIT_API_SECRET&&process.env.LIVEKIT_URL), gemini:Boolean(process.env.GEMINI_API_KEY), holoCore:true, hologpt:true, university:true, familyLegacy:true, heirsLegacy:true, omniTreasury:true, financialTruth:true, releaseControl:true, releaseRegistry, releaseHealth, autoLedger:true, signLanguage:true, signRecognitionProvider:Boolean(process.env.SIGN_LANGUAGE_PROVIDER_URL), tryammLive:true, moderationReporting:true, workforce:true, middleverse:true, assetForge:true, meshyAssetForge:Boolean(process.env.MESHY_API_KEY), redHatSentinel:true, jacobieQuantumShield:true, jacobieSwarmShield:true, middleWearSecurity:true, middleWearResilience:true, pocketEdgeNode:true, edgeGridMarketplace:true, mobilityRental:true, vehicleRecovery:true, repoWorkstation:true } })
})

app.use('/api/privacy', noStoreSensitive)
app.use('/api/security', noStoreSensitive)
app.use('/api/financial-truth', noStoreSensitive)
app.use('/api/treasury', noStoreSensitive)
app.use('/api/asset-forge', noStoreSensitive)
app.use('/api/edge-node', noStoreSensitive)
app.use('/api/edge-grid', noStoreSensitive)
app.use('/api/middleverse', noStoreSensitive)
app.use('/api/vehicle-rentals', noStoreSensitive)
app.use('/api/vehicle-recovery', noStoreSensitive)

app.use('/api/omniverse', createOmniverseRouter({ supabase }))
app.use('/api/holo-core', createHoloCoreRouter({ supabase, stripe }))
app.use('/api/university', createUniversityRouter({ supabase }))
app.use('/api/family', createFamilyVenturesRouter({ supabase }))
app.use('/api/legacy', createLegacyHeirsRouter({ supabase }))
app.use('/api/treasury', createTreasuryRouter({ supabase }))
app.use('/api/financial-truth', createFinancialTruthRouter({ supabase }))
app.use('/api/release-control', createReleaseControlRouter({ supabase }))
app.use('/api/live', createLiveRouter({ supabase }))
app.use('/api/moderation', createModerationRouter({ supabase }))
app.use('/api/workforce', createWorkforceRouter({ supabase }))
app.use('/api/middleverse', ...middleWearSecurity.middleware(), createMiddleverseRouter({ supabase, middleWearSecurity }))
app.use('/api/asset-forge', createAssetForgeRouter({ supabase }))
app.use('/api/edge-node', createEdgeNodeRouter({ supabase }))
app.use('/api/edge-grid', createEdgeGridRouter({ supabase }))
app.use('/api/vehicle-rentals', createVehicleRentalRouter({ supabase }))
app.use('/api/vehicle-recovery', createVehicleRecoveryRouter({ supabase }))
app.use('/api/security/red-hat', noStoreSensitive, createRedHatSentinelRouter({ supabase, sentinel:redHatSentinel }))
app.use('/api/ai', createAIRouter({ supabase }))
app.use('/api', createLegacySecureRouter({ supabase, stripe }))

const signBuckets = new Map()
app.use('/api/accessibility/sign', (req,res,next)=>{
  const key=req.ip||'unknown'; const now=Date.now(); const entry=signBuckets.get(key)||{start:now,count:0}
  if(now-entry.start>60000){entry.start=now;entry.count=0}
  entry.count+=1; signBuckets.set(key,entry)
  if(entry.count>120) return res.status(429).json({error:'Too many sign-language requests. Try again shortly.'})
  res.setHeader('Cache-Control','no-store')
  next()
})
app.get('/api/accessibility/sign/capabilities',(_req,res)=>res.json(signLanguage.capabilities()))
app.post('/api/accessibility/sign/translate',async(req,res)=>{try{res.json(await signLanguage.translate(req.body||{}))}catch(error){res.status(error.statusCode||500).json({error:error.message||'Sign translation failed'})}})
app.post('/api/accessibility/sign/recognize',async(req,res)=>{try{res.json(await signLanguage.recognize(req.body||{}))}catch(error){res.status(error.statusCode||500).json({error:error.message||'Sign recognition failed'})}})

app.post('/api/stripe/webhook', async (req,res)=>{
  if(!stripe||!process.env.STRIPE_WEBHOOK_SECRET) return res.status(503).json({error:'Stripe webhook is not configured'})
  const sig=req.headers['stripe-signature']; let event
  try { event=stripe.webhooks.constructEvent(req.body,sig,process.env.STRIPE_WEBHOOK_SECRET) } catch(err){ return res.status(400).send(`Webhook Error: ${err.message}`) }
  try {
    const { data:previous }=await supabase.from('stripe_webhook_events').select('status,attempts').eq('event_id',event.id).maybeSingle()
    if(previous?.status==='processed') return res.json({received:true,duplicate:true})
    if(previous) await supabase.from('stripe_webhook_events').update({status:'processing',attempts:Number(previous.attempts||0)+1,last_error:null,updated_at:new Date().toISOString()}).eq('event_id',event.id)
    else { const {error}=await supabase.from('stripe_webhook_events').insert({event_id:event.id,event_type:event.type,status:'processing'}); if(error) throw error }
    const object=event.data.object
    switch(event.type){
      case 'checkout.session.completed': {
        await postCheckoutToTreasury({ supabase, stripe, session: object })
        const {userId,plan,type,holoPaymentIntentId}=object.metadata||{}
        if(!userId) break
        if(type==='subscription'){
          const tierMap={pro_monthly:'pro',creator_monthly:'creator',battle_pass:'battle'}
          await supabase.from('users').update({subscription_tier:tierMap[plan]||'pro',subscription_active:true,subscription_start:new Date().toISOString(),stripe_customer_id:object.customer}).eq('id',userId)
          await supabase.from('entitlements').upsert({user_id:userId,asset_key:plan,asset_type:'subscription',source:'purchase',metadata:{stripe_session_id:object.id}},{onConflict:'user_id,asset_key'})
        } else if(type==='tokens'){
          const tokenAmounts={tokens_100:100,tokens_500:550,tokens_1500:1700,tokens_5000:6000,tokens_10000:12500,tokens_25000:32500}; const amount=tokenAmounts[plan]||0
          if(amount>0){ const {data:user}=await supabase.from('users').select('amm_tokens').eq('id',userId).single(); await supabase.from('users').update({amm_tokens:Number(user?.amm_tokens||0)+amount}).eq('id',userId) }
        } else if(type==='holo-pay'&&holoPaymentIntentId){
          await supabase.from('holo_payment_intents').update({status:'paid',provider_session_id:object.id,updated_at:new Date().toISOString()}).eq('id',holoPaymentIntentId).eq('user_id',userId)
          await supabase.from('platform_events').insert({user_id:userId,event_type:'HOLO_PAYMENT_COMPLETED',source:'stripe-webhook',payload:{holoPaymentIntentId,stripeSessionId:object.id,amountTotal:object.amount_total,currency:object.currency}})
        }
        break
      }
      case 'invoice.payment_succeeded': await postInvoiceToTreasury({ supabase, stripe, invoice: object }); break
      case 'charge.refunded':
      case 'refund.updated': await postRefundToTreasury({ supabase, eventObject: object, eventId: event.id }); break
      case 'charge.dispute.created':
      case 'charge.dispute.funds_withdrawn': await postDisputeToTreasury({ supabase, dispute: object, eventId: event.id }); break
      case 'checkout.session.expired': {
        const {userId,type,holoPaymentIntentId}=object.metadata||{}
        if(type==='holo-pay'&&userId&&holoPaymentIntentId) await supabase.from('holo_payment_intents').update({status:'cancelled',updated_at:new Date().toISOString()}).eq('id',holoPaymentIntentId).eq('user_id',userId)
        break
      }
      case 'customer.subscription.deleted': await supabase.from('users').update({subscription_tier:'free',subscription_active:false}).eq('stripe_customer_id',object.customer); break
      case 'invoice.payment_failed': console.log('Payment failed; Stripe customer notifications remain enabled.'); break
    }
    await supabase.from('stripe_webhook_events').update({status:'processed',processed_at:new Date().toISOString(),updated_at:new Date().toISOString()}).eq('event_id',event.id)
    res.json({received:true})
  } catch(err){
    console.error('Webhook processing error:',err)
    try { await supabase.from('stripe_webhook_events').upsert({event_id:event.id,event_type:event.type,status:'failed',last_error:String(err.message||err).slice(0,1000),updated_at:new Date().toISOString()},{onConflict:'event_id'}) } catch(_) {}
    res.status(500).json({error:'Webhook processing failed'})
  }
})

app.get('/api/marketplace/products',async(req,res)=>{ try{ const {category,search}=req.query; let q=supabase.from('products').select('*').eq('status','active').order('created_at',{ascending:false}); if(category&&category!=='all')q=q.eq('category',category); if(search)q=q.ilike('name',`%${String(search).slice(0,100)}%`); const {data,error}=await q.limit(100); if(error)throw error; res.json({products:data||[]}) }catch(err){res.status(500).json({error:err.message})} })
app.get('/api/businesses',async(req,res)=>{ try{ const {category,city,search}=req.query; let q=supabase.from('businesses').select('*').eq('status','active').order('name'); if(category)q=q.eq('category',String(category).slice(0,80)); if(city)q=q.ilike('city',`%${String(city).slice(0,80)}%`); if(search)q=q.or(`name.ilike.%${String(search).slice(0,100)}%,description.ilike.%${String(search).slice(0,100)}%`); const {data,error}=await q.limit(100); if(error)throw error; res.json({businesses:data||[]}) }catch(err){res.status(500).json({error:err.message})} })
app.get('/api/businesses/:id',async(req,res)=>{ try{ const {data,error}=await supabase.from('businesses').select('*, reviews(*)').eq('id',req.params.id).eq('status','active').maybeSingle(); if(error)throw error; if(!data)return res.status(404).json({error:'Business not found'}); res.json({business:data}) }catch(err){res.status(500).json({error:err.message})} })