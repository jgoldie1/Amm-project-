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
const { postCheckoutToTreasury, postInvoiceToTreasury, postRefundToTreasury, postDisputeToTreasury } = require('./lib/treasury-ledger')
const signLanguage = require('./signLanguageService')

const app = express()

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) throw new Error('SUPABASE_URL and SUPABASE_SERVICE_KEY are required')
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null

app.disable('x-powered-by')
app.use(cors({ origin:['https://tryamm.online','https://www.tryamm.online','https://amm-omniverse.vercel.app','http://localhost:5173',process.env.FRONTEND_URL].filter(Boolean), credentials:true }))
app.use('/api/stripe/webhook', express.raw({ type:'application/json' }))
app.use(express.json({ limit:'2mb' }))

app.get('/', (_req,res)=>res.json({ name:'AMM Omniverse Backend', status:'online', version:'1.11.0-release-control', systems:['stripe','supabase','livekit','living-worlds','ai-cafe','workforce','middleverse','kingdoms-press','app-store','stubbs-ai','hologpt','holo-services','holo-core','all-american-university','family-legacy','heirs-legacy-kids','omni-treasury','financial-truth','release-control','release-observability','reserve-buckets','auto-ledger','sign-language','tryamm-live','moderation-reporting'] }))
app.get('/api/health', async (_req,res)=>{
  let database=false
  let releaseRegistry=false
  let releaseHealth=false
  try { const { error }=await supabase.from('worlds').select('id').limit(1); database=!error } catch(_) {}
  try { const { error }=await supabase.from('release_registry').select('id').limit(1); releaseRegistry=!error } catch(_) {}
  try { const { error }=await supabase.from('release_health_samples').select('id').limit(1); releaseHealth=!error } catch(_) {}
  res.json({ ok:true, ts:Date.now(), version:'1.11.0-release-control', services:{ supabase:Boolean(process.env.SUPABASE_URL), livingWorldsSchema:database, stripe:Boolean(stripe), livekit:Boolean(process.env.LIVEKIT_API_KEY&&process.env.LIVEKIT_API_SECRET&&process.env.LIVEKIT_URL), gemini:Boolean(process.env.GEMINI_API_KEY), holoCore:true, hologpt:true, university:true, familyLegacy:true, heirsLegacy:true, omniTreasury:true, financialTruth:true, releaseControl:true, releaseRegistry, releaseHealth, autoLedger:true, signLanguage:true, signRecognitionProvider:Boolean(process.env.SIGN_LANGUAGE_PROVIDER_URL), tryammLive:true, moderationReporting:true, workforce:true, middleverse:true, repoWorkstation:true } })
})

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
app.use('/api/middleverse', createMiddleverseRouter({ supabase }))
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
app.get('/api/music/tracks',async(req,res)=>{ try{ const {genre,creatorId}=req.query; let q=supabase.from('tracks').select('*').order('created_at',{ascending:false}); if(genre)q=q.eq('genre',String(genre).slice(0,80)); if(creatorId)q=q.eq('creator_id',creatorId); const {data,error}=await q.limit(100); if(error)throw error; res.json({tracks:data||[]}) }catch(err){res.status(500).json({error:err.message})} })

const PORT=process.env.PORT||4000
app.listen(PORT,()=>{
  console.log(`\n✅ AMM Backend running on port ${PORT}`)
  console.log(`   Stripe: ${stripe?'✅ connected':'❌ STRIPE_SECRET_KEY missing'}`)
  console.log('   Supabase: ✅ connected')
  console.log(`   LiveKit: ${process.env.LIVEKIT_API_KEY&&process.env.LIVEKIT_API_SECRET&&process.env.LIVEKIT_URL?'✅ connected':'❌ LiveKit configuration incomplete'}`)
  console.log(`   Stubbs AI/HoloGPT: ${process.env.GEMINI_API_KEY?'✅ connected':'⚠️ local fallback'}`)
  console.log(`   Sign language: ${process.env.SIGN_LANGUAGE_PROVIDER_URL?'✅ provider configured':'⚠️ fallback translation only'}`)
  console.log('   LIVE API: /api/live/*')
  console.log('   Moderation API: /api/moderation/*')
  console.log('   Workforce API: /api/workforce/*')
  console.log('   Middleverse API: /api/middleverse/*')
  console.log('   Omniverse API: /api/omniverse/*')
  console.log('   Holo Core API: /api/holo-core/*')
  console.log('   University API: /api/university/*')
  console.log('   Family Legacy API: /api/family/*')
  console.log('   Heirs & Legacy Kids API: /api/legacy/*')
  console.log('   Omni Treasury API: /api/treasury/*')
  console.log('   Financial Truth API: /api/financial-truth/*')
  console.log('   Release Control API: /api/release-control/*')
  console.log('   Sign Language API: /api/accessibility/sign/*')
  console.log('   HoloGPT / Stubbs AI API: POST /api/ai/answer\n')
})
