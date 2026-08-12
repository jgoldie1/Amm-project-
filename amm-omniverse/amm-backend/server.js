require('dotenv').config()
const express = require('express')
const cors = require('cors')
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const { createClient } = require('@supabase/supabase-js')
const { AccessToken } = require('livekit-server-sdk')
const { createOmniverseRouter } = require('./routes/omniverse')
const { createAIRouter } = require('./routes/ai')
const { createHoloCoreRouter } = require('./routes/holo-core')

const app = express()
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

app.disable('x-powered-by')
app.use(cors({
  origin: [
    'https://tryamm.online',
    'https://www.tryamm.online',
    'https://amm-omniverse.vercel.app',
    'http://localhost:5173',
    process.env.FRONTEND_URL,
  ].filter(Boolean),
  credentials: true,
}))

app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }))
app.use(express.json({ limit: '2mb' }))

app.get('/', (_req, res) => {
  res.json({
    name: 'AMM Omniverse Backend',
    status: 'online',
    version: '1.3.0-holo-core',
    systems: ['stripe','supabase','livekit','living-worlds','ai-cafe','workforce','kingdoms-press','app-store','stubbs-ai','holo-services','holo-core'],
  })
})

app.get('/api/health', async (_req, res) => {
  let database = false
  try {
    const { error } = await supabase.from('worlds').select('id').limit(1)
    database = !error
  } catch (_) {}
  res.json({
    ok: true,
    ts: Date.now(),
    version: '1.3.0-holo-core',
    services: {
      supabase: Boolean(process.env.SUPABASE_URL),
      livingWorldsSchema: database,
      stripe: Boolean(process.env.STRIPE_SECRET_KEY),
      livekit: Boolean(process.env.LIVEKIT_API_KEY),
      gemini: Boolean(process.env.GEMINI_API_KEY),
      holoCore: true,
    },
  })
})

app.use('/api/omniverse', createOmniverseRouter({ supabase }))
app.use('/api/holo-core', createHoloCoreRouter({ supabase, stripe: process.env.STRIPE_SECRET_KEY ? stripe : null }))
app.use('/api/ai', createAIRouter())

app.get('/api/livekit-token', async (req, res) => {
  try {
    const { user, room, host } = req.query
    if (!user || !room) return res.status(400).json({ error: 'user and room required' })
    if (!process.env.LIVEKIT_API_KEY || !process.env.LIVEKIT_API_SECRET) return res.status(503).json({ error: 'LiveKit is not configured' })
    const at = new AccessToken(process.env.LIVEKIT_API_KEY, process.env.LIVEKIT_API_SECRET, { identity: String(user), name: String(user) })
    at.addGrant({ roomJoin: true, room: String(room), canPublish: host === 'true', canSubscribe: true, canPublishData: true })
    const token = await at.toJwt()
    res.json({ token, room: String(room), user: String(user) })
  } catch (err) {
    console.error('LiveKit token error:', err)
    res.status(500).json({ error: 'Failed to generate token' })
  }
})

app.post('/api/stripe/checkout', async (req, res) => {
  try {
    if (!process.env.STRIPE_SECRET_KEY) return res.status(503).json({ error: 'Stripe is not configured' })
    const { plan, userId, email, type } = req.body
    const PLANS = {
      pro_monthly: { price: 999, name: 'AMM Pro — Monthly', interval: 'month' },
      creator_monthly: { price: 1999, name: 'AMM Creator — Monthly', interval: 'month' },
      battle_pass: { price: 499, name: 'AMM Battle Pass', interval: 'month' },
    }
    const TOKEN_PACKS = {
      tokens_100: { price: 99, name: '100 AMM Tokens' },
      tokens_500: { price: 499, name: '500 AMM Tokens + 50 Bonus' },
      tokens_1500: { price: 1299, name: '1,500 AMM Tokens + 200 Bonus' },
      tokens_5000: { price: 3999, name: 'Prophet Pack — 5,000 Tokens' },
      tokens_10000: { price: 7499, name: 'King Pack — 10,000 Tokens (Best Value)' },
      tokens_25000: { price: 17499, name: 'Omniverse Pack — 25,000 Tokens' },
    }

    let session
    if (type === 'subscription' && PLANS[plan]) {
      const p = PLANS[plan]
      session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'], mode: 'subscription', customer_email: email,
        metadata: { userId, plan, type: 'subscription' },
        line_items: [{ price_data: { currency: 'usd', product_data: { name: p.name, description: 'AMM Omniverse Creator Platform' }, unit_amount: p.price, recurring: { interval: p.interval } }, quantity: 1 }],
        success_url: `${process.env.FRONTEND_URL}/?session_id={CHECKOUT_SESSION_ID}&success=1`,
        cancel_url: `${process.env.FRONTEND_URL}/?cancelled=1`,
      })
    } else if (type === 'tokens' && TOKEN_PACKS[plan]) {
      const p = TOKEN_PACKS[plan]
      session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'], mode: 'payment', customer_email: email,
        metadata: { userId, plan, type: 'tokens' },
        line_items: [{ price_data: { currency: 'usd', product_data: { name: p.name, description: 'AMM Omniverse Token Pack' }, unit_amount: p.price }, quantity: 1 }],
        success_url: `${process.env.FRONTEND_URL}/?session_id={CHECKOUT_SESSION_ID}&success=1`,
        cancel_url: `${process.env.FRONTEND_URL}/?cancelled=1`,
      })
    } else {
      return res.status(400).json({ error: 'Invalid plan or type' })
    }
    res.json({ url: session.url, sessionId: session.id })
  } catch (err) {
    console.error('Stripe checkout error:', err)
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/stripe/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature']
  let event
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error('Webhook signature failed:', err.message)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  const object = event.data.object
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const { userId, plan, type, holoPaymentIntentId } = object.metadata || {}
        if (!userId) break
        if (type === 'subscription') {
          const tierMap = { pro_monthly: 'pro', creator_monthly: 'creator', battle_pass: 'battle' }
          await supabase.from('users').update({ subscription_tier: tierMap[plan] || 'pro', subscription_active: true, subscription_start: new Date().toISOString(), stripe_customer_id: object.customer }).eq('id', userId)
          await supabase.from('entitlements').upsert({ user_id: userId, asset_key: plan, asset_type: 'subscription', source: 'purchase', metadata: { stripe_session_id: object.id } }, { onConflict: 'user_id,asset_key' })
        } else if (type === 'tokens') {
          const tokenAmounts = { tokens_100: 100, tokens_500: 550, tokens_1500: 1700, tokens_5000: 6000, tokens_10000: 12500, tokens_25000: 32500 }
          const amount = tokenAmounts[plan] || 0
          if (amount > 0) {
            const { data: user } = await supabase.from('users').select('amm_tokens').eq('id', userId).single()
            await supabase.from('users').update({ amm_tokens: (user?.amm_tokens || 0) + amount }).eq('id', userId)
          }
        } else if (type === 'holo-pay' && holoPaymentIntentId) {
          await supabase.from('holo_payment_intents').update({ status: 'paid', provider_session_id: object.id, updated_at: new Date().toISOString() }).eq('id', holoPaymentIntentId).eq('user_id', userId)
          await supabase.from('platform_events').insert({ user_id: userId, event_type: 'HOLO_PAYMENT_COMPLETED', source: 'stripe-webhook', payload: { holoPaymentIntentId, stripeSessionId: object.id, amountTotal: object.amount_total, currency: object.currency } })
        }
        break
      }
      case 'checkout.session.expired': {
        const { userId, type, holoPaymentIntentId } = object.metadata || {}
        if (type === 'holo-pay' && userId && holoPaymentIntentId) {
          await supabase.from('holo_payment_intents').update({ status: 'cancelled', updated_at: new Date().toISOString() }).eq('id', holoPaymentIntentId).eq('user_id', userId)
        }
        break
      }
      case 'customer.subscription.deleted':
        await supabase.from('users').update({ subscription_tier: 'free', subscription_active: false }).eq('stripe_customer_id', object.customer)
        break
      case 'invoice.payment_failed':
        console.log('Payment failed; Stripe customer notifications remain enabled.')
        break
    }
    res.json({ received: true })
  } catch (err) {
    console.error('Webhook processing error:', err)
    res.status(500).json({ error: 'Webhook processing failed' })
  }
})

app.post('/api/marketplace/sale', async (req, res) => {
  try {
    const { amount, creatorStripeAccountId, productId, buyerEmail } = req.body
    if (!Number.isInteger(amount) || amount <= 0 || !creatorStripeAccountId) return res.status(400).json({ error: 'Valid amount and creatorStripeAccountId required' })
    const ammCut = Math.floor(amount * 0.10)
    const creatorCut = amount - ammCut
    const paymentIntent = await stripe.paymentIntents.create({ amount, currency: 'usd', receipt_email: buyerEmail, transfer_data: { amount: creatorCut, destination: creatorStripeAccountId }, metadata: { productId, ammCut, creatorCut } })
    res.json({ clientSecret: paymentIntent.client_secret })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

app.get('/api/player/:userId', async (req, res) => {
  try {
    const { data, error } = await supabase.from('player_state').select('*').eq('user_id', req.params.userId).single()
    if (error) return res.json({ state: null })
    res.json({ state: data })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

app.post('/api/player/:userId/save', async (req, res) => {
  try {
    const { cash, tokens, xp, level, missions, vehicles, avatar, cards } = req.body
    const { error } = await supabase.from('player_state').upsert({ user_id: req.params.userId, cash, tokens, xp, level, missions: JSON.stringify(missions), vehicles: JSON.stringify(vehicles), avatar, cards: JSON.stringify(cards), updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
    if (error) throw error
    res.json({ saved: true })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

app.get('/api/marketplace/products', async (req, res) => {
  try {
    const { category, search } = req.query
    let query = supabase.from('products').select('*').order('created_at', { ascending: false })
    if (category && category !== 'all') query = query.eq('category', category)
    if (search) query = query.ilike('name', `%${search}%`)
    const { data, error } = await query
    if (error) throw error
    res.json({ products: data || [] })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

app.post('/api/marketplace/products', async (req, res) => {
  try {
    const { name, description, price, category, isDropship, supplier, userId } = req.body
    const { data, error } = await supabase.from('products').insert({ name, description, price, category, is_dropship: isDropship, supplier_id: supplier || null, creator_id: userId, status: 'active', sold_count: 0, created_at: new Date().toISOString() }).select().single()
    if (error) throw error
    res.json({ product: data })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

app.get('/api/businesses', async (req, res) => {
  try {
    const { category, city, search } = req.query
    let query = supabase.from('businesses').select('*').eq('status', 'active').order('name')
    if (category) query = query.eq('category', category)
    if (city) query = query.ilike('city', `%${city}%`)
    if (search) query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    const { data, error } = await query
    if (error) throw error
    res.json({ businesses: data || [] })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

app.post('/api/businesses', async (req, res) => {
  try {
    const { name, description, category, city, state, phone, email, website, hours, ownerId } = req.body
    const { data, error } = await supabase.from('businesses').insert({ name, description, category, city, state, phone, email, website, hours, owner_id: ownerId, status: 'active', rating: 0, review_count: 0, verified: false, created_at: new Date().toISOString() }).select().single()
    if (error) throw error
    res.json({ business: data })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

app.get('/api/businesses/:id', async (req, res) => {
  try {
    const { data, error } = await supabase.from('businesses').select('*, reviews(*)').eq('id', req.params.id).single()
    if (error) throw error
    res.json({ business: data })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

app.get('/api/music/tracks', async (req, res) => {
  try {
    const { genre, creatorId } = req.query
    let query = supabase.from('tracks').select('*').order('created_at', { ascending: false })
    if (genre) query = query.eq('genre', genre)
    if (creatorId) query = query.eq('creator_id', creatorId)
    const { data, error } = await query
    if (error) throw error
    res.json({ tracks: data || [] })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

app.post('/api/music/tracks', async (req, res) => {
  try {
    const { title, genre, scripture, bpm, creatorId, fileUrl, duration } = req.body
    const { data, error } = await supabase.from('tracks').insert({ title, genre, scripture, bpm, creator_id: creatorId, file_url: fileUrl, duration, stream_count: 0, royalties_earned: 0, created_at: new Date().toISOString() }).select().single()
    if (error) throw error
    res.json({ track: data })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

app.post('/api/music/stream', async (req, res) => {
  try {
    const { trackId, userId, duration } = req.body
    const GENRE_RATES = { Gospel: 0.019, 'Gospel Rap': 0.019, Worship: 0.019, 'Hip-Hop': 0.015, 'R&B': 0.017, default: 0.015 }
    if (duration < 30) return res.json({ counted: false, reason: 'Under 30 seconds' })
    const { data: track } = await supabase.from('tracks').select('genre, stream_count, royalties_earned').eq('id', trackId).single()
    if (!track) return res.status(404).json({ error: 'Track not found' })
    const rate = GENRE_RATES[track.genre] || GENRE_RATES.default
    const royalty = rate * 0.9
    await supabase.from('tracks').update({ stream_count: (track.stream_count || 0) + 1, royalties_earned: (track.royalties_earned || 0) + royalty }).eq('id', trackId)
    await supabase.from('stream_events').insert({ track_id: trackId, user_id: userId, duration, royalty_amount: royalty, created_at: new Date().toISOString() })
    res.json({ counted: true, royalty: royalty.toFixed(6) })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

const PORT = process.env.PORT || 4000
app.listen(PORT, () => {
  console.log(`\n✅ AMM Backend running on port ${PORT}`)
  console.log(`   Stripe: ${process.env.STRIPE_SECRET_KEY ? '✅ connected' : '❌ STRIPE_SECRET_KEY missing'}`)
  console.log(`   Supabase: ${process.env.SUPABASE_URL ? '✅ connected' : '❌ SUPABASE_URL missing'}`)
  console.log(`   LiveKit: ${process.env.LIVEKIT_API_KEY ? '✅ connected' : '❌ LIVEKIT_API_KEY missing'}`)
  console.log(`   Stubbs AI/Gemini: ${process.env.GEMINI_API_KEY ? '✅ connected' : '⚠️ local fallback'}`)
  console.log('   Omniverse API: /api/omniverse/*')
  console.log('   Holo Core API: /api/holo-core/*')
  console.log('   Holo C / Stubbs AI API: POST /api/ai/answer\n')
})