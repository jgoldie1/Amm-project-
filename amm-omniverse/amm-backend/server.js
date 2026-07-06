require('dotenv').config()
const express    = require('express')
const cors       = require('cors')
const stripe     = require('stripe')(process.env.STRIPE_SECRET_KEY)
const { createClient } = require('@supabase/supabase-js')
const { AccessToken } = require('livekit-server-sdk')

const app = express()
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY  // Service key (not anon key) for server-side ops
)

// ── CORS ──────────────────────────────────────────────────────────────
app.use(cors({
  origin: [
    'https://tryamm.online',
    'https://www.tryamm.online',
    'http://localhost:5173',
    process.env.FRONTEND_URL
  ].filter(Boolean)
}))

// ── Raw body for Stripe webhooks (must be before express.json) ────────
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }))
app.use(express.json())

// ── HEALTH CHECK ──────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    name: 'AMM Omniverse Backend',
    status: 'online',
    version: '1.0.0',
    routes: [
      'GET  /api/health',
      'POST /api/stripe/checkout',
      'POST /api/stripe/webhook',
      'GET  /api/livekit-token',
      'GET  /api/player/:userId',
      'POST /api/player/:userId/save',
      'GET  /api/marketplace/products',
      'POST /api/marketplace/products',
      'GET  /api/businesses',
      'POST /api/businesses',
    ]
  })
})

app.get('/api/health', (req, res) => res.json({ ok: true, ts: Date.now() }))

// ── LIVEKIT TOKEN ENDPOINT ────────────────────────────────────────────
// Frontend calls: GET /api/livekit-token?user=KingJames&room=stream_123&host=true
// This is the 30-line endpoint that enables real live streaming
app.get('/api/livekit-token', async (req, res) => {
  try {
    const { user, room, host } = req.query
    if (!user || !room) return res.status(400).json({ error: 'user and room required' })

    const at = new AccessToken(
      process.env.LIVEKIT_API_KEY,
      process.env.LIVEKIT_API_SECRET,
      { identity: String(user), name: String(user) }
    )
    at.addGrant({
      roomJoin: true,
      room: String(room),
      canPublish: host === 'true',     // host can broadcast camera/mic
      canSubscribe: true,               // everyone can watch
      canPublishData: true,             // everyone can send chat messages
    })

    const token = await at.toJwt()
    res.json({ token, room: String(room), user: String(user) })
  } catch (err) {
    console.error('LiveKit token error:', err)
    res.status(500).json({ error: 'Failed to generate token' })
  }
})

// ── STRIPE: CREATE CHECKOUT SESSION ──────────────────────────────────
// Frontend calls this when user clicks Subscribe or Buy Tokens
app.post('/api/stripe/checkout', async (req, res) => {
  try {
    const { plan, userId, email, type } = req.body

    // Subscription plans
    const PLANS = {
      pro_monthly:     { price: 999,  name: 'AMM Pro — Monthly',     interval: 'month' },
      creator_monthly: { price: 1999, name: 'AMM Creator — Monthly', interval: 'month' },
      battle_pass:     { price: 499,  name: 'AMM Battle Pass',       interval: 'month' },
    }

    // Token packs (one-time)
    const TOKEN_PACKS = {
      tokens_100:   { price: 99,    name: '100 AMM Tokens' },
      tokens_500:   { price: 499,   name: '500 AMM Tokens + 50 Bonus' },
      tokens_1500:  { price: 1299,  name: '1,500 AMM Tokens + 200 Bonus' },
      tokens_5000:  { price: 3999,  name: 'Prophet Pack — 5,000 Tokens' },
      tokens_10000: { price: 7499,  name: 'King Pack — 10,000 Tokens (Best Value)' },
      tokens_25000: { price: 17499, name: 'Omniverse Pack — 25,000 Tokens' },
    }

    let session

    if (type === 'subscription' && PLANS[plan]) {
      // Recurring subscription
      const p = PLANS[plan]
      session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'subscription',
        customer_email: email,
        metadata: { userId, plan, type: 'subscription' },
        line_items: [{
          price_data: {
            currency: 'usd',
            product_data: { name: p.name, description: 'AMM Omniverse Creator Platform' },
            unit_amount: p.price,
            recurring: { interval: p.interval },
          },
          quantity: 1,
        }],
        success_url: `${process.env.FRONTEND_URL}/?session_id={CHECKOUT_SESSION_ID}&success=1`,
        cancel_url:  `${process.env.FRONTEND_URL}/?cancelled=1`,
      })
    } else if (type === 'tokens' && TOKEN_PACKS[plan]) {
      // One-time token pack purchase
      const p = TOKEN_PACKS[plan]
      session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        customer_email: email,
        metadata: { userId, plan, type: 'tokens' },
        line_items: [{
          price_data: {
            currency: 'usd',
            product_data: { name: p.name, description: 'AMM Omniverse Token Pack' },
            unit_amount: p.price,
          },
          quantity: 1,
        }],
        success_url: `${process.env.FRONTEND_URL}/?session_id={CHECKOUT_SESSION_ID}&success=1`,
        cancel_url:  `${process.env.FRONTEND_URL}/?cancelled=1`,
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

// ── STRIPE: WEBHOOK (what makes money actually flow) ──────────────────
// Stripe calls this when a payment succeeds
// This is the 30 lines that make subscriptions real
app.post('/api/stripe/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature']
  let event

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error('Webhook signature failed:', err.message)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  const session = event.data.object

  switch (event.type) {
    case 'checkout.session.completed': {
      const { userId, plan, type } = session.metadata || {}
      if (!userId) break

      if (type === 'subscription') {
        // Upgrade user tier in Supabase
        const tierMap = { pro_monthly: 'pro', creator_monthly: 'creator', battle_pass: 'battle' }
        await supabase.from('users').update({
          subscription_tier: tierMap[plan] || 'pro',
          subscription_active: true,
          subscription_start: new Date().toISOString(),
          stripe_customer_id: session.customer,
        }).eq('id', userId)

        console.log(`✅ Subscription activated: ${userId} → ${plan}`)

      } else if (type === 'tokens') {
        // Add tokens to user account
        const tokenAmounts = {
          tokens_100: 100, tokens_500: 550, tokens_1500: 1700,
          tokens_5000: 6000, tokens_10000: 12500, tokens_25000: 32500,
        }
        const amount = tokenAmounts[plan] || 0
        if (amount > 0) {
          const { data: user } = await supabase.from('users').select('amm_tokens').eq('id', userId).single()
          const current = user?.amm_tokens || 0
          await supabase.from('users').update({ amm_tokens: current + amount }).eq('id', userId)
          console.log(`✅ Tokens added: ${userId} → +${amount} (${plan})`)
        }
      }
      break
    }

    case 'customer.subscription.deleted': {
      // Downgrade to free when subscription cancelled
      const customerId = session.customer
      await supabase.from('users').update({
        subscription_tier: 'free',
        subscription_active: false,
      }).eq('stripe_customer_id', customerId)
      console.log(`Subscription cancelled for customer: ${customerId}`)
      break
    }

    case 'invoice.payment_failed': {
      console.log('Payment failed — user will be notified via email by Stripe')
      break
    }
  }

  res.json({ received: true })
})

// ── MARKETPLACE: Stripe Connect for creator payouts ───────────────────
// When a marketplace sale happens, split 90% to creator, 10% to AMM
app.post('/api/marketplace/sale', async (req, res) => {
  try {
    const { amount, creatorStripeAccountId, productId, buyerEmail } = req.body
    const ammCut    = Math.floor(amount * 0.10)  // 10% to AMM
    const creatorCut = Math.floor(amount * 0.90) // 90% to creator

    // Create payment intent with destination charge to creator's Stripe Connect account
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      receipt_email: buyerEmail,
      transfer_data: {
        amount: creatorCut,
        destination: creatorStripeAccountId, // creator's Stripe Connect ID
      },
      metadata: { productId, ammCut, creatorCut }
    })

    res.json({ clientSecret: paymentIntent.client_secret })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── PLAYER STATE: Save and load ───────────────────────────────────────
app.get('/api/player/:userId', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('player_state')
      .select('*')
      .eq('user_id', req.params.userId)
      .single()
    if (error) return res.json({ state: null })
    res.json({ state: data })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/player/:userId/save', async (req, res) => {
  try {
    const { cash, tokens, xp, level, missions, vehicles, avatar, cards } = req.body
    const { error } = await supabase
      .from('player_state')
      .upsert({
        user_id: req.params.userId,
        cash, tokens, xp, level,
        missions: JSON.stringify(missions),
        vehicles: JSON.stringify(vehicles),
        avatar,
        cards: JSON.stringify(cards),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' })
    if (error) throw error
    res.json({ saved: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── MARKETPLACE: Products ─────────────────────────────────────────────
app.get('/api/marketplace/products', async (req, res) => {
  try {
    const { category, search } = req.query
    let query = supabase.from('products').select('*').order('created_at', { ascending: false })
    if (category && category !== 'all') query = query.eq('category', category)
    if (search) query = query.ilike('name', `%${search}%`)
    const { data, error } = await query
    if (error) throw error
    res.json({ products: data || [] })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/marketplace/products', async (req, res) => {
  try {
    const { name, description, price, category, isDropship, supplier, userId } = req.body
    const { data, error } = await supabase.from('products').insert({
      name, description, price, category,
      is_dropship: isDropship,
      supplier_id: supplier || null,
      creator_id: userId,
      status: 'active',
      sold_count: 0,
      created_at: new Date().toISOString(),
    }).select().single()
    if (error) throw error
    res.json({ product: data })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── BUSINESS DIRECTORY (Black-owned business listings) ────────────────
app.get('/api/businesses', async (req, res) => {
  try {
    const { category, city, search } = req.query
    let query = supabase.from('businesses').select('*').eq('status', 'active').order('name')
    if (category) query = query.eq('category', category)
    if (city)     query = query.ilike('city', `%${city}%`)
    if (search)   query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    const { data, error } = await query
    if (error) throw error
    res.json({ businesses: data || [] })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/businesses', async (req, res) => {
  try {
    const { name, description, category, city, state, phone, email, website, hours, ownerId } = req.body
    const { data, error } = await supabase.from('businesses').insert({
      name, description, category, city, state,
      phone, email, website, hours,
      owner_id: ownerId,
      status: 'active',
      rating: 0,
      review_count: 0,
      verified: false,
      created_at: new Date().toISOString(),
    }).select().single()
    if (error) throw error
    res.json({ business: data })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.get('/api/businesses/:id', async (req, res) => {
  try {
    const { data, error } = await supabase.from('businesses').select('*, reviews(*)').eq('id', req.params.id).single()
    if (error) throw error
    res.json({ business: data })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── MUSIC TRACKS ──────────────────────────────────────────────────────
app.get('/api/music/tracks', async (req, res) => {
  try {
    const { genre, creatorId } = req.query
    let query = supabase.from('tracks').select('*').order('created_at', { ascending: false })
    if (genre)     query = query.eq('genre', genre)
    if (creatorId) query = query.eq('creator_id', creatorId)
    const { data, error } = await query
    if (error) throw error
    res.json({ tracks: data || [] })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/music/tracks', async (req, res) => {
  try {
    const { title, genre, scripture, bpm, creatorId, fileUrl, duration } = req.body
    const { data, error } = await supabase.from('tracks').insert({
      title, genre, scripture, bpm,
      creator_id: creatorId,
      file_url: fileUrl,
      duration,
      stream_count: 0,
      royalties_earned: 0,
      created_at: new Date().toISOString(),
    }).select().single()
    if (error) throw error
    res.json({ track: data })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Record a qualified stream (for royalty calculation)
app.post('/api/music/stream', async (req, res) => {
  try {
    const { trackId, userId, duration } = req.body
    const GENRE_RATES = { Gospel: 0.019, 'Gospel Rap': 0.019, Worship: 0.019, 'Hip-Hop': 0.015, 'R&B': 0.017, default: 0.015 }

    // Only count streams over 30 seconds (anti-fraud)
    if (duration < 30) return res.json({ counted: false, reason: 'Under 30 seconds' })

    const { data: track } = await supabase.from('tracks').select('genre, stream_count, royalties_earned').eq('id', trackId).single()
    if (!track) return res.status(404).json({ error: 'Track not found' })

    const rate = GENRE_RATES[track.genre] || GENRE_RATES.default
    const royalty = rate * 0.9 // creator gets 90% of the rate

    await supabase.from('tracks').update({
      stream_count: (track.stream_count || 0) + 1,
      royalties_earned: ((track.royalties_earned || 0) + royalty),
    }).eq('id', trackId)

    // Log the stream event
    await supabase.from('stream_events').insert({
      track_id: trackId,
      user_id: userId,
      duration,
      royalty_amount: royalty,
      created_at: new Date().toISOString(),
    })

    res.json({ counted: true, royalty: royalty.toFixed(6) })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── START SERVER ──────────────────────────────────────────────────────
const PORT = process.env.PORT || 4000
app.listen(PORT, () => {
  console.log(`\n✅ AMM Backend running on port ${PORT}`)
  console.log(`   Stripe: ${process.env.STRIPE_SECRET_KEY ? '✅ connected' : '❌ STRIPE_SECRET_KEY missing'}`)
  console.log(`   Supabase: ${process.env.SUPABASE_URL ? '✅ connected' : '❌ SUPABASE_URL missing'}`)
  console.log(`   LiveKit: ${process.env.LIVEKIT_API_KEY ? '✅ connected' : '❌ LIVEKIT_API_KEY missing'}`)
  console.log(`\n   Endpoints ready:`)
  console.log(`   POST /api/stripe/checkout  → creates payment session`)
  console.log(`   POST /api/stripe/webhook   → handles payment success`)
  console.log(`   GET  /api/livekit-token    → enables real streaming`)
  console.log(`   GET  /api/player/:id       → load player state`)
  console.log(`   POST /api/player/:id/save  → save player state`)
  console.log(`   GET  /api/marketplace/products → list products`)
  console.log(`   POST /api/marketplace/products → list a product`)
  console.log(`   GET  /api/businesses       → business directory`)
  console.log(`   POST /api/businesses       → register business`)
  console.log(`   POST /api/music/stream     → count qualified stream\n`)
})
