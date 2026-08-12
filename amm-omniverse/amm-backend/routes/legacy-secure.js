const express = require('express')
const { AccessToken } = require('livekit-server-sdk')

function createLegacySecureRouter({ supabase, stripe }) {
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
    } catch (_error) {
      res.status(401).json({ error: 'Authentication failed' })
    }
  }

  router.post('/live/rooms', requireUser, async (req, res) => {
    try {
      const roomKey = String(req.body?.roomKey || '').trim()
      if (!/^[a-zA-Z0-9_-]{3,80}$/.test(roomKey)) return res.status(400).json({ error: 'roomKey must be 3-80 letters, numbers, underscores or hyphens' })
      if (req.body?.youthMode === true) return res.status(403).json({ error: 'Youth rooms require a trusted moderation/guardian provisioning workflow' })
      const visibility = req.body?.visibility === 'private' ? 'private' : 'public'
      const { data: room, error } = await supabase.from('live_rooms').insert({
        room_key: roomKey,
        owner_user_id: req.user.id,
        title: String(req.body?.title || roomKey).slice(0,120),
        visibility,
        youth_mode: false,
      }).select('*').single()
      if (error) return res.status(error.code === '23505' ? 409 : 500).json({ error: error.message })
      await supabase.from('live_room_members').upsert({ room_key: roomKey, user_id: req.user.id, role: 'owner', status: 'active' })
      res.status(201).json({ room })
    } catch (err) { res.status(500).json({ error: err.message }) }
  })

  router.get('/livekit-token', requireUser, async (req, res) => {
    try {
      const roomKey = String(req.query.room || '')
      if (!roomKey) return res.status(400).json({ error: 'room required' })
      if (!process.env.LIVEKIT_API_KEY || !process.env.LIVEKIT_API_SECRET) return res.status(503).json({ error: 'LiveKit is not configured' })

      const { data: room, error: roomError } = await supabase.from('live_rooms').select('*').eq('room_key', roomKey).eq('active', true).maybeSingle()
      if (roomError) return res.status(500).json({ error: roomError.message })
      if (!room) return res.status(404).json({ error: 'Live room not found. Create the room first.' })

      const isOwner = room.owner_user_id === req.user.id
      const { data: member } = await supabase.from('live_room_members').select('role,status').eq('room_key', roomKey).eq('user_id', req.user.id).maybeSingle()
      const activeMember = member?.status === 'active'
      if (room.visibility === 'private' && !isOwner && !activeMember) return res.status(403).json({ error: 'Private room membership required' })
      if (member?.status === 'blocked') return res.status(403).json({ error: 'Room access blocked' })

      const role = isOwner ? 'owner' : (activeMember ? member.role : 'viewer')
      if (room.youth_mode) {
        const { data: identity } = await supabase.from('holo_identity_profiles').select('age_lane').eq('user_id', req.user.id).maybeSingle()
        const allowedAdultRoles = ['owner','moderator']
        if (identity?.age_lane === 'adult' && !allowedAdultRoles.includes(role)) return res.status(403).json({ error: 'Youth room access requires an approved moderation role' })
      }

      const publishRoles = ['owner','cohost','speaker']
      const dataRoles = ['owner','cohost','speaker','moderator']
      const at = new AccessToken(process.env.LIVEKIT_API_KEY, process.env.LIVEKIT_API_SECRET, {
        identity: req.user.id,
        name: req.user.email || req.user.id,
      })
      at.addGrant({
        roomJoin: true,
        room: roomKey,
        canPublish: publishRoles.includes(role),
        canSubscribe: true,
        canPublishData: dataRoles.includes(role),
      })
      res.json({ token: await at.toJwt(), room: roomKey, user: req.user.id, role })
    } catch (_err) {
      res.status(500).json({ error: 'Failed to generate token' })
    }
  })

  router.post('/stripe/checkout', requireUser, async (req, res) => {
    try {
      if (!stripe) return res.status(503).json({ error: 'Stripe is not configured' })
      const { plan, type } = req.body || {}
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
      const base = process.env.FRONTEND_URL || 'https://tryamm.online'
      let session
      if (type === 'subscription' && PLANS[plan]) {
        const p = PLANS[plan]
        session = await stripe.checkout.sessions.create({
          mode: 'subscription', customer_email: req.user.email || undefined,
          metadata: { userId: req.user.id, plan, type: 'subscription' },
          line_items: [{ price_data: { currency: 'usd', product_data: { name: p.name }, unit_amount: p.price, recurring: { interval: p.interval } }, quantity: 1 }],
          success_url: `${base}/?session_id={CHECKOUT_SESSION_ID}&success=1`, cancel_url: `${base}/?cancelled=1`,
        })
      } else if (type === 'tokens' && TOKEN_PACKS[plan]) {
        const p = TOKEN_PACKS[plan]
        session = await stripe.checkout.sessions.create({
          mode: 'payment', customer_email: req.user.email || undefined,
          metadata: { userId: req.user.id, plan, type: 'tokens' },
          line_items: [{ price_data: { currency: 'usd', product_data: { name: p.name }, unit_amount: p.price }, quantity: 1 }],
          success_url: `${base}/?session_id={CHECKOUT_SESSION_ID}&success=1`, cancel_url: `${base}/?cancelled=1`,
        })
      } else return res.status(400).json({ error: 'Invalid plan or type' })
      res.json({ url: session.url, sessionId: session.id })
    } catch (err) { res.status(500).json({ error: err.message }) }
  })

  router.post('/marketplace/sale', requireUser, async (req, res) => {
    try {
      if (!stripe) return res.status(503).json({ error: 'Stripe is not configured' })
      const { productId } = req.body || {}
      if (!productId) return res.status(400).json({ error: 'productId required' })
      const { data: product, error: productError } = await supabase.from('products').select('id,name,price,creator_id,status').eq('id', productId).maybeSingle()
      if (productError) return res.status(500).json({ error: productError.message })
      if (!product || product.status !== 'active') return res.status(404).json({ error: 'Product unavailable' })
      const amount = Math.round(Number(product.price) * 100)
      if (!Number.isInteger(amount) || amount <= 0) return res.status(409).json({ error: 'Product price is invalid' })
      const { data: payout, error: payoutError } = await supabase.from('creator_payout_accounts').select('provider_account_id,charges_enabled,payouts_enabled').eq('user_id', product.creator_id).maybeSingle()
      if (payoutError) return res.status(500).json({ error: payoutError.message })
      if (!payout || !payout.charges_enabled || !payout.payouts_enabled) return res.status(409).json({ error: 'Seller payouts are not enabled' })
      const platformCut = Math.floor(amount * 0.10)
      const creatorCut = amount - platformCut
      const paymentIntent = await stripe.paymentIntents.create({
        amount, currency: 'usd', receipt_email: req.user.email || undefined,
        transfer_data: { amount: creatorCut, destination: payout.provider_account_id },
        metadata: { productId: product.id, buyerUserId: req.user.id, platformCut, creatorCut },
      })
      res.json({ clientSecret: paymentIntent.client_secret, amount, currency: 'usd' })
    } catch (err) { res.status(500).json({ error: err.message }) }
  })

  router.get('/player/:userId', requireUser, async (req, res) => {
    if (req.params.userId !== req.user.id) return res.status(403).json({ error: 'Forbidden' })
    const { data, error } = await supabase.from('player_state').select('*').eq('user_id', req.user.id).maybeSingle()
    if (error) return res.status(500).json({ error: error.message })
    res.json({ state: data || null })
  })

  router.post('/player/:userId/save', requireUser, async (req, res) => {
    if (req.params.userId !== req.user.id) return res.status(403).json({ error: 'Forbidden' })
    try {
      const { cash, tokens, xp, level, missions, vehicles, avatar, cards } = req.body || {}
      const { error } = await supabase.from('player_state').upsert({
        user_id: req.user.id, cash, tokens, xp, level,
        missions: JSON.stringify(missions || []), vehicles: JSON.stringify(vehicles || []), avatar,
        cards: JSON.stringify(cards || []), updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' })
      if (error) throw error
      res.json({ saved: true })
    } catch (err) { res.status(500).json({ error: err.message }) }
  })

  router.post('/marketplace/products', requireUser, async (req, res) => {
    try {
      const { name, description, price, category, isDropship, supplier } = req.body || {}
      if (!name || !Number.isFinite(Number(price)) || Number(price) < 0) return res.status(400).json({ error: 'Valid name and price required' })
      const { data, error } = await supabase.from('products').insert({
        name, description, price: Number(price), category, is_dropship: Boolean(isDropship), supplier_id: supplier || null,
        creator_id: req.user.id, status: 'active', sold_count: 0, created_at: new Date().toISOString(),
      }).select().single()
      if (error) throw error
      res.status(201).json({ product: data })
    } catch (err) { res.status(500).json({ error: err.message }) }
  })

  router.post('/businesses', requireUser, async (req, res) => {
    try {
      const { name, description, category, city, state, phone, email, website, hours } = req.body || {}
      if (!name) return res.status(400).json({ error: 'name required' })
      const { data, error } = await supabase.from('businesses').insert({
        name, description, category, city, state, phone, email, website, hours,
        owner_id: req.user.id, status: 'active', rating: 0, review_count: 0, verified: false,
        created_at: new Date().toISOString(),
      }).select().single()
      if (error) throw error
      res.status(201).json({ business: data })
    } catch (err) { res.status(500).json({ error: err.message }) }
  })

  router.post('/music/tracks', requireUser, async (req, res) => {
    try {
      const { title, genre, scripture, bpm, fileUrl, duration } = req.body || {}
      if (!title) return res.status(400).json({ error: 'title required' })
      const { data, error } = await supabase.from('tracks').insert({
        title, genre, scripture, bpm, creator_id: req.user.id, file_url: fileUrl, duration,
        stream_count: 0, royalties_earned: 0, created_at: new Date().toISOString(),
      }).select().single()
      if (error) throw error
      res.status(201).json({ track: data })
    } catch (err) { res.status(500).json({ error: err.message }) }
  })

  router.post('/music/stream', requireUser, async (req, res) => {
    try {
      const { trackId, duration } = req.body || {}
      const seconds = Number(duration)
      if (!trackId || !Number.isFinite(seconds) || seconds < 30) return res.json({ counted: false, reason: 'Qualified streams require at least 30 seconds' })
      const thirtySecondsAgo = new Date(Date.now() - 30_000).toISOString()
      const { data: recent } = await supabase.from('stream_events').select('id').eq('track_id', trackId).eq('user_id', req.user.id).gte('created_at', thirtySecondsAgo).limit(1)
      if (recent?.length) return res.json({ counted: false, reason: 'Duplicate stream window' })
      const { data: track, error: trackError } = await supabase.from('tracks').select('genre,stream_count,royalties_earned').eq('id', trackId).maybeSingle()
      if (trackError) return res.status(500).json({ error: trackError.message })
      if (!track) return res.status(404).json({ error: 'Track not found' })
      const GENRE_RATES = { Gospel: 0.019, 'Gospel Rap': 0.019, Worship: 0.019, 'Hip-Hop': 0.015, 'R&B': 0.017, default: 0.015 }
      const rate = GENRE_RATES[track.genre] || GENRE_RATES.default
      const royalty = rate * 0.9
      await supabase.from('tracks').update({ stream_count: (track.stream_count || 0) + 1, royalties_earned: Number(track.royalties_earned || 0) + royalty }).eq('id', trackId)
      await supabase.from('stream_events').insert({ track_id: trackId, user_id: req.user.id, duration: seconds, royalty_amount: royalty, created_at: new Date().toISOString() })
      res.json({ counted: true, royalty: royalty.toFixed(6) })
    } catch (err) { res.status(500).json({ error: err.message }) }
  })

  return router
}

module.exports = { createLegacySecureRouter }
