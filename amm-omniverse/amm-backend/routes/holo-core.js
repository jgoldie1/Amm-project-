const express = require('express')
const { createUniversityRouter } = require('./university')

function createHoloCoreRouter({ supabase, stripe }) {
  const router = express.Router()

  async function requireUser(req, res, next) {
    try {
      const auth = req.headers.authorization || ''
      const token = auth.startsWith('Bearer ') ? auth.slice(7) : ''
      if (!token) return res.status(401).json({ error: 'Authentication required' })
      const { data, error } = await supabase.auth.getUser(token)
      if (error || !data?.user) return res.status(401).json({ error: 'Invalid session' })
      req.user = data.user
      next()
    } catch (_error) { return res.status(401).json({ error: 'Authentication failed' }) }
  }

  router.get('/identity', requireUser, async (req,res)=>{
    const {data,error}=await supabase.from('holo_identity_profiles').select('*').eq('user_id',req.user.id).maybeSingle()
    if(error)return res.status(500).json({error:error.message}); res.json({identity:data||null})
  })

  router.get('/work', requireUser, async (req,res)=>{
    const [profile,tasks]=await Promise.all([
      supabase.from('holo_work_profiles').select('*').eq('user_id',req.user.id).maybeSingle(),
      supabase.from('holo_work_tasks').select('*').eq('user_id',req.user.id).order('created_at',{ascending:false})
    ])
    if(profile.error||tasks.error)return res.status(500).json({error:profile.error?.message||tasks.error?.message})
    res.json({profile:profile.data||null,tasks:tasks.data||[]})
  })

  router.get('/education/courses', async (_req,res)=>{
    const {data,error}=await supabase.from('holo_courses').select('*').eq('status','published').order('title')
    if(error)return res.status(500).json({error:error.message}); res.json({courses:data||[]})
  })

  router.use('/university', createUniversityRouter({ supabase }))

  router.get('/creator/projects', requireUser, async (req,res)=>{
    const {data,error}=await supabase.from('holo_creator_projects').select('*').eq('owner_id',req.user.id).order('updated_at',{ascending:false})
    if(error)return res.status(500).json({error:error.message}); res.json({projects:data||[]})
  })

  router.get('/analytics', requireUser, async (req,res)=>{
    const {data,error}=await supabase.from('holo_metric_events').select('metric_key,scope,value,created_at').eq('user_id',req.user.id).order('created_at',{ascending:false}).limit(500)
    if(error)return res.status(500).json({error:error.message})
    const totals={}; for(const row of data||[]) totals[row.metric_key]=(totals[row.metric_key]||0)+Number(row.value||0)
    res.json({totals,events:data||[]})
  })

  router.post('/pay/checkout', requireUser, async (req,res)=>{
    try {
      if (!stripe) return res.status(503).json({ error: 'Stripe is not configured' })
      const { purpose, amountCents, currency='usd', metadata={} }=req.body||{}
      const amount=Number(amountCents)
      if(!purpose || !Number.isInteger(amount) || amount<=0 || amount>1000000) return res.status(400).json({error:'Valid purpose and amountCents required'})
      const {data:intent,error:intentError}=await supabase.from('holo_payment_intents').insert({
        user_id:req.user.id,provider:'stripe',purpose,amount_cents:amount,currency,status:'requires_confirmation',metadata
      }).select('*').single()
      if(intentError)return res.status(500).json({error:intentError.message})
      const session=await stripe.checkout.sessions.create({
        mode:'payment',
        line_items:[{price_data:{currency,product_data:{name:purpose},unit_amount:amount},quantity:1}],
        success_url:`${process.env.FRONTEND_URL}/?holo_pay=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url:`${process.env.FRONTEND_URL}/?holo_pay=cancelled`,
        metadata:{...metadata,userId:req.user.id,holoPaymentIntentId:intent.id,type:'holo-pay'}
      })
      const {data:updated,error:updateError}=await supabase.from('holo_payment_intents').update({status:'checkout_created',provider_session_id:session.id,updated_at:new Date().toISOString()}).eq('id',intent.id).eq('user_id',req.user.id).select('*').single()
      if(updateError)return res.status(500).json({error:updateError.message})
      res.status(201).json({paymentIntent:updated,checkoutUrl:session.url})
    } catch(err){res.status(500).json({error:err.message})}
  })

  router.get('/pay/intents', requireUser, async (req,res)=>{
    const {data,error}=await supabase.from('holo_payment_intents').select('*').eq('user_id',req.user.id).order('created_at',{ascending:false})
    if(error)return res.status(500).json({error:error.message});res.json({intents:data||[]})
  })

  const HOLO_CREDIT_PACKS = {
    holo_100: { credits:100, price:99, name:'100 Holo Credits' },
    holo_550: { credits:550, price:499, name:'550 Holo Credits' },
    holo_1700: { credits:1700, price:1299, name:'1,700 Holo Credits' },
    holo_6000: { credits:6000, price:3999, name:'6,000 Holo Credits' },
    holo_12500: { credits:12500, price:7499, name:'12,500 Holo Credits' },
  }

  router.get('/credits', requireUser, async (req,res)=>{
    try{
      const [wallet,tx]=await Promise.all([
        supabase.from('holo_credit_wallets').select('balance,lifetime_earned,lifetime_spent,updated_at').eq('user_id',req.user.id).maybeSingle(),
        supabase.from('holo_credit_transactions').select('id,amount,transaction_type,description,metadata,created_at').eq('user_id',req.user.id).order('created_at',{ascending:false}).limit(100)
      ])
      if(wallet.error||tx.error) return res.status(500).json({error:wallet.error?.message||tx.error?.message})
      res.json({wallet:wallet.data||{balance:0,lifetime_earned:0,lifetime_spent:0},transactions:tx.data||[],redeemableForCash:false})
    }catch(err){res.status(500).json({error:err.message})}
  })

  router.get('/credits/packs', (_req,res)=>{
    res.json({packs:Object.entries(HOLO_CREDIT_PACKS).map(([id,p])=>({id,...p,currency:'usd'})),redeemableForCash:false})
  })

  router.post('/credits/checkout', requireUser, async (req,res)=>{
    try{
      if(!stripe) return res.status(503).json({error:'Stripe is not configured'})
      const packId=String(req.body?.packId||'')
      const pack=HOLO_CREDIT_PACKS[packId]
      if(!pack) return res.status(400).json({error:'Invalid Holo Credit pack'})
      const base=process.env.FRONTEND_URL||'https://tryamm.online'
      const session=await stripe.checkout.sessions.create({
        mode:'payment',customer_email:req.user.email||undefined,
        line_items:[{price_data:{currency:'usd',product_data:{name:pack.name},unit_amount:pack.price},quantity:1}],
        success_url:`${base}/?holo_credits=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url:`${base}/?holo_credits=cancelled`,
        metadata:{userId:req.user.id,type:'holo-credits',plan:packId,holoCredits:String(pack.credits)}
      })
      res.status(201).json({checkoutUrl:session.url,sessionId:session.id,pack:{id:packId,...pack}})
    }catch(err){res.status(500).json({error:err.message})}
  })

  return router
}

module.exports={createHoloCoreRouter}
