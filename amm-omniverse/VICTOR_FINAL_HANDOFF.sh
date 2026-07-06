#!/usr/bin/env bash
# ================================================================
# AMM OMNIVERSE — VICTOR FINAL HANDOFF SCRIPT
# Version: FINAL · Budget: $400–$850 total
# Every line of backend code Victor needs to wire the platform
# ================================================================
# BEFORE YOU START — Victor needs these keys from King James:
#   SUPABASE_URL + SUPABASE_SERVICE_KEY  (supabase.com → Settings → API)
#   STRIPE_SECRET_KEY                    (dashboard.stripe.com → Developers)
#   STRIPE_WEBHOOK_SECRET                (Stripe → Webhooks → Add endpoint)
#   LIVEKIT_API_KEY + LIVEKIT_API_SECRET (cloud.livekit.io → Settings)
#   DISCORD_WEBHOOK_URL                  (Discord → Server → Integrations)
#   ANTHROPIC_API_KEY                    (console.anthropic.com → API Keys)
# ================================================================

set -e
echo "╔══════════════════════════════════════════════════════╗"
echo "║   AMM OMNIVERSE — VICTOR FINAL BACKEND HANDOFF      ║"
echo "║   Budget: \$400–\$850 · Every line pre-written        ║"
echo "╚══════════════════════════════════════════════════════╝"

mkdir -p amm-backend && cd amm-backend
npm init -y
npm install express cors dotenv @supabase/supabase-js stripe livekit-server-sdk node-fetch

# ================================================================
# SERVER.JS — Complete Express backend
# ================================================================
cat > server.js << 'SERVER_END'
require('dotenv').config()
const express = require('express')
const cors    = require('cors')
const stripe  = require('stripe')(process.env.STRIPE_SECRET_KEY)
const { createClient } = require('@supabase/supabase-js')
const { AccessToken } = require('livekit-server-sdk')

const app = express()
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

// ── CORS ─────────────────────────────────────────────────────
app.use(cors({ origin: ['https://tryamm.online','http://localhost:5173',process.env.FRONTEND_URL].filter(Boolean) }))
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }))
app.use(express.json())

// ── HEALTH ───────────────────────────────────────────────────
app.get('/', (req,res) => res.json({
  name: 'AMM Omniverse Backend', status: 'online', version: '3.0',
  services: {
    stripe:   !!process.env.STRIPE_SECRET_KEY,
    supabase: !!process.env.SUPABASE_URL,
    livekit:  !!process.env.LIVEKIT_API_KEY,
    discord:  !!process.env.DISCORD_WEBHOOK_URL,
    ai:       !!process.env.ANTHROPIC_API_KEY,
  }
}))
app.get('/api/health', (req,res) => res.json({ ok:true, ts:Date.now() }))

// ── LIVEKIT TOKEN ─────────────────────────────────────────────
// 30 lines that enable real live streaming video/audio
app.get('/api/livekit-token', async (req,res) => {
  try {
    const { user, room, host } = req.query
    if (!user || !room) return res.status(400).json({ error: 'user and room required' })
    const at = new AccessToken(process.env.LIVEKIT_API_KEY, process.env.LIVEKIT_API_SECRET, {
      identity: String(user), name: String(user)
    })
    at.addGrant({ roomJoin:true, room:String(room), canPublish:host==='true', canSubscribe:true, canPublishData:true })
    res.json({ token: await at.toJwt(), room:String(room), user:String(user) })
  } catch(err) { res.status(500).json({ error: 'LiveKit token failed' }) }
})

// ── STRIPE CHECKOUT ───────────────────────────────────────────
app.post('/api/stripe/checkout', async (req,res) => {
  try {
    const { plan, userId, email, type } = req.body
    const PLANS = {
      pro_monthly:     { price:999,  name:'AMM Pro — Monthly',           interval:'month' },
      pro_annual:      { price:9990, name:'AMM Pro — Annual (save 17%)',  interval:'year'  },
      creator_monthly: { price:1999, name:'AMM Creator — Monthly',        interval:'month' },
      creator_annual:  { price:19990,name:'AMM Creator — Annual',         interval:'year'  },
      battle_pass:     { price:499,  name:'AMM Battle Pass',              interval:'month' },
      drama_pass:      { price:499,  name:'AMM Drama Pass — Unlimited Episodes', interval:'month' },
    }
    const TOKENS = {
      tokens_100:   { price:99,    name:'Starter Pack — 100 Tokens',                  tokens:100,   bonus:0    },
      tokens_500:   { price:499,   name:'Creator Pack — 500 Tokens + 50 Bonus',       tokens:500,   bonus:50   },
      tokens_1500:  { price:1299,  name:'Kingdom Pack — 1,500 Tokens + 200 Bonus',    tokens:1500,  bonus:200  },
      tokens_5000:  { price:3999,  name:'Prophet Pack — 5,000 Tokens + 750 Bonus',    tokens:5000,  bonus:750  },
      tokens_10000: { price:7499,  name:'King Pack — 10,000 Tokens + 2,000 Bonus',    tokens:10000, bonus:2000 },
      tokens_25000: { price:17499, name:'Omniverse Pack — 25,000 Tokens + 7,000 Bonus',tokens:25000,bonus:7000},
    }
    let session
    if (type==='subscription' && PLANS[plan]) {
      const p = PLANS[plan]
      session = await stripe.checkout.sessions.create({
        payment_method_types:['card'], mode:'subscription', customer_email:email,
        metadata:{ userId, plan, type:'subscription' },
        line_items:[{ price_data:{ currency:'usd', product_data:{ name:p.name }, unit_amount:p.price, recurring:{interval:p.interval} }, quantity:1 }],
        success_url:`${process.env.FRONTEND_URL}/?success=1&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url:`${process.env.FRONTEND_URL}/?cancelled=1`,
      })
    } else if (type==='tokens' && TOKENS[plan]) {
      const p = TOKENS[plan]
      session = await stripe.checkout.sessions.create({
        payment_method_types:['card'], mode:'payment', customer_email:email,
        metadata:{ userId, plan, type:'tokens' },
        line_items:[{ price_data:{ currency:'usd', product_data:{ name:p.name }, unit_amount:p.price }, quantity:1 }],
        success_url:`${process.env.FRONTEND_URL}/?success=1&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url:`${process.env.FRONTEND_URL}/?cancelled=1`,
      })
    } else { return res.status(400).json({ error:'Invalid plan' }) }
    res.json({ url:session.url, sessionId:session.id })
  } catch(err) { res.status(500).json({ error:err.message }) }
})

// ── STRIPE WEBHOOK ────────────────────────────────────────────
app.post('/api/stripe/webhook', async (req,res) => {
  let event
  try {
    event = stripe.webhooks.constructEvent(req.body, req.headers['stripe-signature'], process.env.STRIPE_WEBHOOK_SECRET)
  } catch(err) { return res.status(400).send(`Webhook Error: ${err.message}`) }

  const session = event.data.object
  switch(event.type) {
    case 'checkout.session.completed': {
      const { userId, plan, type } = session.metadata || {}
      if (!userId) break
      if (type==='subscription') {
        const tierMap = { pro_monthly:'pro', pro_annual:'pro', creator_monthly:'creator', creator_annual:'creator', battle_pass:'battle', drama_pass:'drama' }
        await supabase.from('users').update({ subscription_tier:tierMap[plan]||'pro', subscription_active:true, stripe_customer_id:session.customer }).eq('id',userId)
        await discordNotify('💳 New Subscriber!', `User ${userId} subscribed to ${plan}`)
      } else if (type==='tokens') {
        const tokenAmounts = { tokens_100:100, tokens_500:550, tokens_1500:1700, tokens_5000:5750, tokens_10000:12000, tokens_25000:32000 }
        const amount = tokenAmounts[plan] || 0
        const { data:user } = await supabase.from('users').select('amm_tokens').eq('id',userId).single()
        await supabase.from('users').update({ amm_tokens:(user?.amm_tokens||0)+amount }).eq('id',userId)
      }
      break
    }
    case 'customer.subscription.deleted':
      await supabase.from('users').update({ subscription_tier:'free', subscription_active:false }).eq('stripe_customer_id',session.customer)
      break
  }
  res.json({ received:true })
})

// ── MARKETPLACE SALE (90/10 split) ───────────────────────────
app.post('/api/marketplace/sale', async (req,res) => {
  try {
    const { amount, creatorStripeAccountId, productId, buyerEmail } = req.body
    const intent = await stripe.paymentIntents.create({
      amount, currency:'usd', receipt_email:buyerEmail,
      transfer_data:{ amount:Math.floor(amount*0.9), destination:creatorStripeAccountId },
      metadata:{ productId }
    })
    res.json({ clientSecret:intent.client_secret })
  } catch(err) { res.status(500).json({ error:err.message }) }
})

// ── PLAYER STATE SAVE/LOAD ────────────────────────────────────
app.get('/api/player/:userId', async (req,res) => {
  try {
    const { data,error } = await supabase.from('player_state').select('*').eq('user_id',req.params.userId).single()
    if (error) return res.json({ state:null })
    res.json({ state:data })
  } catch(err) { res.status(500).json({ error:err.message }) }
})
app.post('/api/player/:userId/save', async (req,res) => {
  try {
    const { cash,tokens,xp,level,missions,vehicles,avatar,cards,wantedLevel } = req.body
    const { error } = await supabase.from('player_state').upsert({
      user_id:req.params.userId, cash, tokens, xp, level,
      missions:JSON.stringify(missions||[]), vehicles:JSON.stringify(vehicles||[]),
      avatar, cards:JSON.stringify(cards||[]), wanted_level:wantedLevel||0,
      updated_at:new Date().toISOString()
    },{ onConflict:'user_id' })
    if (error) throw error
    res.json({ saved:true })
  } catch(err) { res.status(500).json({ error:err.message }) }
})

// ── MARKETPLACE PRODUCTS ──────────────────────────────────────
app.get('/api/marketplace/products', async (req,res) => {
  try {
    const { category,search } = req.query
    let query = supabase.from('products').select('*').order('created_at',{ascending:false})
    if (category && category!=='all') query = query.eq('category',category)
    if (search) query = query.ilike('name',`%${search}%`)
    const { data,error } = await query
    if (error) throw error
    res.json({ products:data||[] })
  } catch(err) { res.status(500).json({ error:err.message }) }
})
app.post('/api/marketplace/products', async (req,res) => {
  try {
    const { name,description,price,category,isDropship,supplier,userId } = req.body
    const { data,error } = await supabase.from('products').insert({
      name,description,price,category,is_dropship:isDropship,supplier_id:supplier||null,
      creator_id:userId,status:'active',sold_count:0,created_at:new Date().toISOString()
    }).select().single()
    if (error) throw error
    res.json({ product:data })
  } catch(err) { res.status(500).json({ error:err.message }) }
})

// ── MUSIC TRACKS ──────────────────────────────────────────────
app.get('/api/music/tracks', async (req,res) => {
  try {
    const { genre,creatorId } = req.query
    let q = supabase.from('tracks').select('*').order('created_at',{ascending:false})
    if (genre) q = q.eq('genre',genre)
    if (creatorId) q = q.eq('creator_id',creatorId)
    const { data,error } = await q
    if (error) throw error
    res.json({ tracks:data||[] })
  } catch(err) { res.status(500).json({ error:err.message }) }
})
app.post('/api/music/stream', async (req,res) => {
  try {
    const { trackId,userId,duration } = req.body
    if (duration < 30) return res.json({ counted:false, reason:'Under 30 seconds — not counted' })
    const RATES = { Gospel:0.019,'Gospel Rap':0.019,Worship:0.019,'Hip-Hop':0.015,'R&B':0.017,default:0.015 }
    const { data:track } = await supabase.from('tracks').select('genre,stream_count,royalties_earned').eq('id',trackId).single()
    if (!track) return res.status(404).json({ error:'Track not found' })
    const rate = RATES[track.genre] || RATES.default
    const royalty = rate * 0.9
    await supabase.from('tracks').update({ stream_count:(track.stream_count||0)+1, royalties_earned:((track.royalties_earned||0)+royalty) }).eq('id',trackId)
    await supabase.from('stream_events').insert({ track_id:trackId, user_id:userId, duration, royalty_amount:royalty, created_at:new Date().toISOString() })
    res.json({ counted:true, royalty:royalty.toFixed(6) })
  } catch(err) { res.status(500).json({ error:err.message }) }
})

// ── BUSINESS DIRECTORY ────────────────────────────────────────
// ── ENHANCED BUSINESS DIRECTORY ──────────────────────────────────────────────

function makeBizSlug(name, ownerId='') {
  const base = String(name).toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'')
  const suffix = ownerId ? '-'+ownerId.slice(0,6) : '-'+Date.now().toString(36)
  return base + suffix
}

function calcTrustScore(p) {
  let s = 0
  if(p.email_verified) s+=10; if(p.phone_verified) s+=10; if(p.website_verified) s+=10
  if(p.address_verified) s+=15; if(p.owner_identity_verified) s+=20
  if(p.business_registration_verified) s+=20; if(p.license_verified) s+=10
  if(p.insurance_verified) s+=5
  return Math.min(s, 100)
}

// GET /api/businesses — public search with all filters
app.get('/api/businesses', async (req,res) => {
  try {
    const { q='', category='', city='', country='', state='', black_owned, faith_based, verified } = req.query
    let query = supabase.from('businesses').select('*')
      .eq('deleted',false).eq('status','active')
      .order('trust_score',{ascending:false}).limit(50)
    if(category) query = query.eq('category', category)
    if(city)     query = query.ilike('city', `%${city}%`)
    if(state)    query = query.eq('state', state)
    if(country)  query = query.eq('country', country)
    if(black_owned==='true') query = query.eq('black_owned', true)
    if(faith_based==='true') query = query.eq('faith_based', true)
    if(verified==='true')    query = query.eq('verification_status','verified')
    const { data, error } = await query
    if(error) throw error
    const lower = q.toLowerCase()
    const filtered = q ? data.filter(b=>[b.name,b.category,b.city,b.state,b.country,b.description,b.tagline].join(' ').toLowerCase().includes(lower)) : data
    res.json({ businesses: filtered })
  } catch(err){ res.status(500).json({error:err.message}) }
})

// GET /api/businesses/me — owner's own listings
app.get('/api/businesses/me', async (req,res) => {
  try {
    const userId = req.headers['x-user-id']
    if(!userId) return res.status(401).json({error:'x-user-id required'})
    const { data, error } = await supabase.from('businesses').select('*').eq('owner_id',userId).eq('deleted',false).order('created_at',{ascending:false})
    if(error) throw error
    res.json({ businesses: data||[] })
  } catch(err){ res.status(500).json({error:err.message}) }
})

// GET /api/businesses/:slug — single business by slug
app.get('/api/businesses/:slug', async (req,res) => {
  try {
    const { data, error } = await supabase.from('businesses').select('*').eq('slug',req.params.slug).eq('deleted',false).single()
    if(error||!data) return res.status(404).json({error:'Business not found'})
    res.json({ business: data })
  } catch(err){ res.status(500).json({error:err.message}) }
})

// POST /api/businesses — create business profile
app.post('/api/businesses', async (req,res) => {
  try {
    const userId = req.headers['x-user-id']
    const {
      name, legalBusinessName, dbaName, tagline, description, category, subcategory,
      businessEmail, phone, tollFree, whatsapp, website,
      country, state, city, postalCode, addressLine1, serviceArea,
      blackOwned, minorityOwned, veteranOwned, womanOwned, faithBased, nonprofit,
      ownerName, productsEnabled, servicesEnabled, bookingEnabled,
      deliveryEnabled, pickupEnabled, shippingEnabled,
      acceptsCard, acceptsWallet, acceptsQrPayment, acceptsTapToPay,
      averagePriceRange, returnPolicy, refundPolicy,
      sabbathModeEnabled, businessHours,
      seoTitle, seoDescription, tags, languagesSupported, regionsServed,
      termsAccepted, privacyAccepted
    } = req.body
    if(!name||!category) return res.status(400).json({error:'name and category required'})
    if(!termsAccepted||!privacyAccepted) return res.status(400).json({error:'terms and privacy must be accepted'})
    const slug = makeBizSlug(name, userId)
    const { data, error } = await supabase.from('businesses').insert({
      owner_id:userId||null, name, legal_business_name:legalBusinessName||'',
      dba_name:dbaName||'', tagline:tagline||'', description:description||'',
      category, subcategory:subcategory||'', business_email:businessEmail||'',
      phone:phone||'', toll_free:tollFree||'', whatsapp:whatsapp||'', website:website||'',
      country:country||'US', state:state||'', city:city||'', postal_code:postalCode||'',
      address_line_1:addressLine1||'', service_area:serviceArea||'',
      black_owned:blackOwned||false, minority_owned:minorityOwned||false,
      veteran_owned:veteranOwned||false, woman_owned:womanOwned||false,
      faith_based:faithBased||false, nonprofit:nonprofit||false,
      owner_name:ownerName||'', products_enabled:productsEnabled||false,
      services_enabled:servicesEnabled!==false, booking_enabled:bookingEnabled||false,
      delivery_enabled:deliveryEnabled||false, pickup_enabled:pickupEnabled||false,
      shipping_enabled:shippingEnabled||false,
      accepts_card:acceptsCard||false, accepts_wallet:acceptsWallet||false,
      accepts_qr_payment:acceptsQrPayment||false, accepts_tap_to_pay:acceptsTapToPay||false,
      average_price_range:averagePriceRange||'', return_policy:returnPolicy||'',
      refund_policy:refundPolicy||'', sabbath_mode_enabled:sabbathModeEnabled||false,
      business_hours:businessHours||{}, seo_title:seoTitle||name,
      seo_description:seoDescription||description||'',
      tags:tags||[], languages_supported:languagesSupported||['en'],
      regions_served:regionsServed||[country||'US'],
      terms_accepted:true, privacy_accepted:true,
      slug, verification_status:'pending', email:businessEmail||''
    }).select().single()
    if(error) throw error
    res.status(201).json({ business: data })
  } catch(err){ res.status(500).json({error:err.message}) }
})

// PATCH /api/businesses/:id — update own business
app.patch('/api/businesses/:id', async (req,res) => {
  try {
    const userId = req.headers['x-user-id']
    const updates = { ...req.body, updated_at: new Date().toISOString() }
    const { data, error } = await supabase.from('businesses').update(updates).eq('id',req.params.id).eq('owner_id',userId).select().single()
    if(error) throw error
    res.json({ business: data })
  } catch(err){ res.status(500).json({error:err.message}) }
})

// DELETE /api/businesses/:id — soft delete
app.delete('/api/businesses/:id', async (req,res) => {
  try {
    const userId = req.headers['x-user-id']
    await supabase.from('businesses').update({deleted:true,updated_at:new Date().toISOString()}).eq('id',req.params.id).eq('owner_id',userId)
    res.json({ deleted: true })
  } catch(err){ res.status(500).json({error:err.message}) }
})

// POST /api/admin/businesses/:id/verify — admin verify a business
app.post('/api/admin/businesses/:id/verify', async (req,res) => {
  try {
    const { verificationStatus, verificationLevel, adminReviewNote, emailVerified, phoneVerified, websiteVerified, addressVerified, businessRegistrationVerified, licenseVerified } = req.body
    const valid = ['unverified','pending','verified','rejected','suspended']
    if(!valid.includes(verificationStatus)) return res.status(400).json({error:'Invalid verificationStatus'})
    const { data:existing } = await supabase.from('businesses').select('*').eq('id',req.params.id).single()
    if(!existing) return res.status(404).json({error:'Business not found'})
    const trustScore = calcTrustScore({
      ...existing,
      email_verified: emailVerified ?? existing.email_verified,
      phone_verified: phoneVerified ?? existing.phone_verified,
      website_verified: websiteVerified ?? existing.website_verified,
      address_verified: addressVerified ?? existing.address_verified,
      business_registration_verified: businessRegistrationVerified ?? (verificationStatus==='verified'),
      license_verified: licenseVerified ?? existing.license_verified,
    })
    const { data, error } = await supabase.from('businesses').update({
      verification_status: verificationStatus,
      verification_level: verificationLevel||'basic',
      admin_review_note: adminReviewNote||'',
      trust_score: trustScore,
      verified: verificationStatus==='verified',
      email_verified: emailVerified ?? existing.email_verified,
      phone_verified: phoneVerified ?? existing.phone_verified,
      website_verified: websiteVerified ?? existing.website_verified,
      address_verified: addressVerified ?? existing.address_verified,
      business_registration_verified: verificationStatus==='verified',
      verified_at: verificationStatus==='verified' ? new Date().toISOString() : null,
      updated_at: new Date().toISOString()
    }).eq('id',req.params.id).select().single()
    if(error) throw error
    res.json({ business: data, trustScore })
  } catch(err){ res.status(500).json({error:err.message}) }
})

// ── BUSINESS REVIEWS ─────────────────────────────────────────────────────────

// POST /api/businesses/:id/reviews — submit a review
app.post('/api/businesses/:id/reviews', async (req,res) => {
  try {
    const { reviewerName, reviewerEmail, rating, reviewText } = req.body
    if(!reviewerName||!rating) return res.status(400).json({error:'reviewerName and rating required'})
    if(rating<1||rating>5) return res.status(400).json({error:'rating must be 1–5'})
    const { data, error } = await supabase.from('business_reviews').insert({
      business_id: req.params.id, reviewer_name: reviewerName,
      reviewer_email: reviewerEmail||'', rating: Number(rating),
      review_text: reviewText||'', approved: false
    }).select().single()
    if(error) throw error
    res.status(201).json({ review: data, message: 'Review submitted. Pending moderation.' })
  } catch(err){ res.status(500).json({error:err.message}) }
})

// GET /api/businesses/:id/reviews — public approved reviews
app.get('/api/businesses/:id/reviews', async (req,res) => {
  try {
    const { data, error } = await supabase.from('business_reviews').select('*')
      .eq('business_id',req.params.id).eq('approved',true).eq('deleted',false)
      .order('created_at',{ascending:false})
    if(error) throw error
    res.json({ reviews: data||[] })
  } catch(err){ res.status(500).json({error:err.message}) }
})

// GET /api/admin/business-reviews — all pending reviews
app.get('/api/admin/business-reviews', async (req,res) => {
  try {
    const { data, error } = await supabase.from('business_reviews')
      .select('*, businesses(name,slug)').eq('deleted',false)
      .order('created_at',{ascending:false})
    if(error) throw error
    res.json({ reviews: data||[] })
  } catch(err){ res.status(500).json({error:err.message}) }
})

// POST /api/admin/business-reviews/:id/approve
app.post('/api/admin/business-reviews/:id/approve', async (req,res) => {
  try {
    const { data:review, error:rErr } = await supabase.from('business_reviews')
      .update({approved:true}).eq('id',req.params.id).select().single()
    if(rErr||!review) return res.status(404).json({error:'Review not found'})
    // Recalculate avg rating
    const { data:allReviews } = await supabase.from('business_reviews')
      .select('rating').eq('business_id',review.business_id).eq('approved',true).eq('deleted',false)
    const count = allReviews?.length||0
    const avg = count ? allReviews.reduce((s,r)=>s+Number(r.rating),0)/count : 0
    await supabase.from('businesses').update({rating_average:avg,review_count:count,rating:Math.round(avg*10)/10}).eq('id',review.business_id)
    res.json({ approved:true, ratingAverage:avg, reviewCount:count })
  } catch(err){ res.status(500).json({error:err.message}) }
})

// POST /api/admin/business-reviews/:id/delete
app.post('/api/admin/business-reviews/:id/delete', async (req,res) => {
  try {
    await supabase.from('business_reviews').update({deleted:true}).eq('id',req.params.id)
    res.json({ deleted: true })
  } catch(err){ res.status(500).json({error:err.message}) }
})



// ── SEARCH ────────────────────────────────────────────────────────────────────
app.get('/api/search', async (req,res) => {
  try {
    const q = String(req.query.q||'').toLowerCase()
    if(!q||q.length<2) return res.json({query:q,results:{tracks:[],products:[],businesses:[]}})
    const [tracks,products,businesses] = await Promise.all([
      supabase.from('tracks').select('id,title,artist,genre').ilike('title',`%${q}%`).limit(10),
      supabase.from('products').select('id,name,price,category').ilike('name',`%${q}%`).limit(10),
      supabase.from('businesses').select('id,name,category,city,slug').or(`name.ilike.%${q}%,category.ilike.%${q}%`).eq('deleted',false).limit(10),
    ])
    res.json({ query:q, results:{ tracks:tracks.data||[], products:products.data||[], businesses:businesses.data||[] } })
  } catch(err){ res.status(500).json({error:err.message}) }
})

// ── CREATOR PROFILES ──────────────────────────────────────────────────────────
app.get('/api/creators/:id/profile', async (req,res) => {
  try {
    const [user,tracks,products] = await Promise.all([
      supabase.from('users').select('id,name,email,subscription_tier,created_at').eq('id',req.params.id).single(),
      supabase.from('tracks').select('title,genre,stream_count,royalties_earned').eq('creator_id',req.params.id).limit(20),
      supabase.from('products').select('name,price,sold_count').eq('creator_id',req.params.id).limit(20),
    ])
    if(!user.data) return res.status(404).json({error:'Creator not found'})
    res.json({ creator:user.data, tracks:tracks.data||[], products:products.data||[] })
  } catch(err){ res.status(500).json({error:err.message}) }
})

// ── AI ANSWER ─────────────────────────────────────────────────────────────────
app.post('/api/ai/answer', async (req,res) => {
  try {
    const { question, mode } = req.body
    if(!question) return res.status(400).json({error:'question required'})
    const answer = `AMM Omniverse — answering: "${question}"\n\nFor detailed help visit tryamm.online or ask Bennie on the platform.`
    res.json({ answer, mode:mode||'hybrid' })
  } catch(err){ res.status(500).json({error:err.message}) }
})

// ── DISCORD NOTIFY ────────────────────────────────────────────────────────────
app.post('/api/discord/notify', async (req,res) => {
  try {
    const { title='AMM Update', description='Platform event' } = req.body
    if(process.env.DISCORD_WEBHOOK_URL) {
      await fetch(process.env.DISCORD_WEBHOOK_URL, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ embeds:[{ title, description, color:0x00ffcc, timestamp:new Date().toISOString() }] })
      })
    }
    res.json({ sent:true })
  } catch(err){ res.status(500).json({error:err.message}) }
})

// ── ZAPIER TRIGGER ────────────────────────────────────────────────────────────
app.post('/api/zapier/trigger', async (req,res) => {
  try {
    const { event='platform_event', data={} } = req.body
    await supabase.from('zapier_events').insert({ event, data:JSON.stringify(data), created_at:new Date().toISOString() }).catch(()=>{})
    res.json({ triggered:true, event })
  } catch(err){ res.status(500).json({error:err.message}) }
})

// ── DRAMA BOX ─────────────────────────────────────────────────────────────────
app.post('/api/drama/unlock', async (req,res) => {
  try {
    const { userId, seriesId, episodeId, coinCost=50 } = req.body
    if(!userId||!seriesId||!episodeId) return res.status(400).json({error:'userId, seriesId, episodeId required'})
    const { data:user } = await supabase.from('users').select('amm_tokens').eq('id',userId).single()
    if(!user) return res.status(404).json({error:'User not found'})
    if((user.amm_tokens||0) < coinCost) return res.status(402).json({error:'Insufficient tokens', needed:coinCost, have:user.amm_tokens})
    await supabase.from('users').update({amm_tokens:(user.amm_tokens||0)-coinCost}).eq('id',userId)
    await supabase.from('drama_unlocks').insert({user_id:userId,series_id:seriesId,episode_id:episodeId,tokens_spent:coinCost,created_at:new Date().toISOString()}).catch(()=>{})
    res.json({ unlocked:true, tokensSpent:coinCost, tokensRemaining:(user.amm_tokens||0)-coinCost })
  } catch(err){ res.status(500).json({error:err.message}) }
})

app.get('/api/drama/unlocks/:userId', async (req,res) => {
  try {
    const { data } = await supabase.from('drama_unlocks').select('series_id,episode_id').eq('user_id',req.params.userId)
    res.json({ unlocks:data||[] })
  } catch(err){ res.status(500).json({error:err.message}) }
})

// ── GLOBAL SHARE LINK SYSTEM ──────────────────────────────────────────────────
function makeShortCode(){const c='abcdefghijklmnopqrstuvwxyz0123456789';return Array.from({length:8},()=>c[Math.floor(Math.random()*c.length)]).join('')}
function hashIp(ip=''){let h=0;for(let i=0;i<ip.length;i++){h=((h<<5)-h)+ip.charCodeAt(i);h|=0}return String(Math.abs(h))}
function buildPlatformLinks(url,title){const u=encodeURIComponent(url),t=encodeURIComponent(title);return{facebook:`https://www.facebook.com/sharer/sharer.php?u=${u}`,x:`https://twitter.com/intent/tweet?url=${u}&text=${t}`,linkedin:`https://www.linkedin.com/sharing/share-offsite/?url=${u}`,whatsapp:`https://wa.me/?text=${t}%20${u}`,telegram:`https://t.me/share/url?url=${u}&text=${t}`,reddit:`https://reddit.com/submit?url=${u}&title=${t}`,email:`mailto:?subject=${t}&body=${url}`,sms:`sms:?&body=${t}%20${u}`}}

app.post('/api/shares', async (req,res) => {
  try {
    const {targetType,targetId,title,description,imageUrl,publicUrl,language,region,campaign}=req.body
    if(!targetType||!title||!publicUrl) return res.status(400).json({error:'targetType,title,publicUrl required'})
    const userId=req.headers['x-user-id']
    let shortCode=makeShortCode(), attempts=0
    while(attempts<5){const{data:ex}=await supabase.from('share_links').select('id').eq('short_code',shortCode).single().catch(()=>({data:null}));if(!ex)break;shortCode=makeShortCode();attempts++}
    const{data,error}=await supabase.from('share_links').insert({creator_id:userId||null,target_type:targetType,target_id:targetId||'',title,description:description||'',image_url:imageUrl||'',public_url:publicUrl,short_code:shortCode,language:language||'en',region:region||'global',campaign:campaign||'organic'}).select().single()
    if(error) throw error
    const shortUrl=`${process.env.FRONTEND_URL||'https://tryamm.online'}/s/${shortCode}`
    res.status(201).json({share:data,shortUrl,platformLinks:buildPlatformLinks(shortUrl,title)})
  } catch(err){res.status(500).json({error:err.message})}
})
app.get('/api/shares/me', async (req,res) => {
  try {
    const userId=req.headers['x-user-id']
    if(!userId) return res.status(401).json({error:'x-user-id required'})
    const{data,error}=await supabase.from('share_links').select('*').eq('creator_id',userId).order('created_at',{ascending:false})
    if(error) throw error
    res.json({shares:data||[]})
  } catch(err){res.status(500).json({error:err.message})}
})
app.get('/api/s/:shortCode', async (req,res) => {
  try {
    const{data:share,error}=await supabase.from('share_links').select('*').eq('short_code',req.params.shortCode).single()
    if(error||!share) return res.status(404).json({error:'Share link not found'})
    await supabase.from('share_clicks').insert({share_link_id:share.id,platform:req.query.platform||'direct',country:req.headers['cf-ipcountry']||'',user_agent:req.headers['user-agent']||'',referrer:req.headers.referer||'',ip_hash:hashIp(req.ip||'')}).catch(()=>{})
    res.redirect(share.public_url)
  } catch(err){res.status(500).json({error:err.message})}
})
app.get('/api/shares/:id/analytics', async (req,res) => {
  try {
    const userId=req.headers['x-user-id']
    const{data:share}=await supabase.from('share_links').select('*').eq('id',req.params.id).eq('creator_id',userId).single()
    if(!share) return res.status(404).json({error:'Share not found'})
    const{data:clicks}=await supabase.from('share_clicks').select('*').eq('share_link_id',req.params.id).order('created_at',{ascending:false})
    const byPlatform={},byCountry={},byDay={}
    for(const c of (clicks||[])){byPlatform[c.platform||'direct']=(byPlatform[c.platform||'direct']||0)+1;byCountry[c.country||'unknown']=(byCountry[c.country||'unknown']||0)+1;const day=c.created_at?.slice(0,10)||'unknown';byDay[day]=(byDay[day]||0)+1}
    res.json({share,totalClicks:(clicks||[]).length,byPlatform,byCountry,byDay,recentClicks:(clicks||[]).slice(0,50)})
  } catch(err){res.status(500).json({error:err.message})}
})
app.get('/api/share-platforms', (req,res) => {
  res.json({global:['facebook','x','linkedin','whatsapp','telegram','reddit','tiktok','snapchat'],india:['whatsapp','facebook','instagram','youtube','telegram','sharechat','moj'],china:['wechat','weibo','qq','douyin','xiaohongshu','bilibili'],japan:['line','x','instagram','tiktok','youtube','lemon8'],australia:['facebook','instagram','tiktok','youtube','reddit','snapchat','linkedin','whatsapp'],west_africa:['whatsapp','facebook','instagram','tiktok','youtube','audiomack','boomplay'],south_africa:['whatsapp','facebook','instagram','tiktok','youtube','moya','ayoba'],music:['whatsapp','facebook','x','tiktok','instagram','youtube','audiomack','boomplay'],business:['linkedin','facebook','whatsapp','email','x'],faith:['facebook','whatsapp','telegram','youtube','instagram']})
})
app.post('/api/share-templates/generate', async (req,res) => {
  try {
    const{targetType,title,region,language}=req.body
    if(!targetType||!title) return res.status(400).json({error:'targetType and title required'})
    const tags={track:'#QuantumBeat #NewMusic #AMM',release:'#NewRelease #AMM',creator_site:'#CreatorWebsite #AMM',business:'#BlackBusiness #AMM #ShopBlack',product:'#CreatorStore #AMM',episode:'#AMMDramaBox #FaithDrama',live_room:'#LiveNow #AMMLive',game:'#AMMOmniverse #Gaming',card:'#CardBattle #OmniverseDuelRealms'}
    const caption=`🌐 Check out "${title}" on All American Marketplace. tryamm.online`
    res.json({name:`${region||'global'}-${targetType}-auto`,targetType,language:language||'en',region:region||'global',caption,hashtags:tags[targetType]||'#AMM'})
  } catch(err){res.status(500).json({error:err.message})}
})

// ── START SERVER ──────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(\`🌐 AMM Backend running on port \${PORT}\`)
  console.log(\`  GET  /api/health\`)
  console.log(\`  POST /api/stripe/checkout\`)
  console.log(\`  POST /api/businesses      → create listing\`)
  console.log(\`  GET  /api/businesses      → search directory\`)
  console.log(\`  POST /api/businesses/:id/reviews → submit review\`)
  console.log(\`  POST /api/admin/businesses/:id/verify → verify\`)
  console.log(\`  GET  /api/shares/me       → creator share links\`)
  console.log(\`  GET  /api/s/:code         → redirect + track\`)
})

