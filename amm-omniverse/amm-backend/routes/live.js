const express = require('express')
const { AccessToken } = require('livekit-server-sdk')

function createLiveRouter({ supabase }) {
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
    } catch (_) {
      res.status(401).json({ error: 'Authentication failed' })
    }
  }

  router.get('/status', (_req, res) => {
    res.json({
      configured: Boolean(process.env.LIVEKIT_API_KEY && process.env.LIVEKIT_API_SECRET && process.env.LIVEKIT_URL),
      urlConfigured: Boolean(process.env.LIVEKIT_URL),
      features: ['audio','video','screen-share','chat-data','multi-participant','recording-provider-ready'],
    })
  })

  router.post('/token', requireUser, async (req, res) => {
    if (!process.env.LIVEKIT_API_KEY || !process.env.LIVEKIT_API_SECRET || !process.env.LIVEKIT_URL) {
      return res.status(503).json({ error: 'LiveKit is not fully configured on the server' })
    }
    const roomName = String(req.body?.roomName || '').trim().replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 80)
    if (!roomName) return res.status(400).json({ error: 'roomName is required' })
    const displayName = String(req.body?.displayName || req.user.user_metadata?.display_name || req.user.email || 'TryAMM User').slice(0, 80)
    const canPublish = req.body?.role !== 'viewer'

    const token = new AccessToken(process.env.LIVEKIT_API_KEY, process.env.LIVEKIT_API_SECRET, {
      identity: req.user.id,
      name: displayName,
      ttl: '2h',
      metadata: JSON.stringify({ tryammUserId: req.user.id, role: canPublish ? 'host' : 'viewer' }),
    })
    token.addGrant({ roomJoin: true, room: roomName, canPublish, canSubscribe: true, canPublishData: true })
    const jwt = await token.toJwt()

    try {
      await supabase.from('platform_events').insert({
        user_id: req.user.id,
        event_type: 'LIVE_TOKEN_ISSUED',
        source: 'livekit',
        payload: { roomName, role: canPublish ? 'host' : 'viewer' },
      })
    } catch (_) {}

    res.json({ token: jwt, url: process.env.LIVEKIT_URL, roomName, identity: req.user.id, role: canPublish ? 'host' : 'viewer' })
  })

  return router
}

module.exports = { createLiveRouter }
